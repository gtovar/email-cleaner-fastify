import { actionHistoryService } from './actionHistoryService.js';
import { executeGmailAction } from './actionExecutor.js';
import { eventBus } from './eventBus.js';
import { summaryQueries } from "../queries/notifications/index.js";

export const NEW_SUGGESTIONS_EVENT = 'NEW_SUGGESTIONS_AVAILABLE';

/**
 * Builds a structured event indicating that new suggestions are ready for a user.
 * The summary keeps a total count and a small sample to avoid sending full payloads.
 */
export function buildNewSuggestionsEvent({ userId, suggestions }) {
    if (!userId || typeof userId !== 'string') {
        throw new Error('userId is required to build a suggestions event');
    }

    const normalizedSuggestions = Array.isArray(suggestions) ? suggestions : [];
    const nowIso = new Date().toISOString();

    const totalSuggestions = normalizedSuggestions.reduce(
        (acc, item) => acc + (Array.isArray(item?.suggestions) ? item.suggestions.length : 0),
        0
    );

    const sampledEmails = normalizedSuggestions
        .slice(0, 3)
        .map((item) => ({
            emailId: String(item?.id ?? item?.emailId ?? ''),
            subject: item?.subject ?? '',
            suggestions: Array.isArray(item?.suggestions) ? item.suggestions.slice(0, 3) : []
        }));

    return {
        type: NEW_SUGGESTIONS_EVENT,
        userId,
        summary: {
            totalSuggestions,
            sampledEmails
        },
        generatedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso
    };
}

export const notificationsService = (models) => ({
    async getSummaryForUser({ userId = 'demo-user' } = {}) {

        // 1) Leer el summary desde la Query
        const summary = await summaryQueries.getNotificationSummaryForUser({ models, userId, });

        // 2) (Versión HU16 sin EventBus) emitir evento a EventStore
        if (summary.length > 0) {
            const domainEvent = buildNewSuggestionsEvent({ userId, suggestions: summary });
            // En vez de hablar directo con NotificationEvent,
            // publicamos un evento de dominio.
            await eventBus.publish("suggestion.generated", { userId, suggestions: summary, });//Un listener se encarga de crear/persistir NotificationEvent, algo asi como un // src/events/listeners/saveToNotificationEvent.js

        }

        // 3) Devuelves summary al frontend
        return summary;
    },

    async confirmActions({ ids, action, userId }) {
        const results = [];
        const historyService = actionHistoryService(models); // ✅ inicialización correcta

        for (const emailId of ids) {
            let gmailResult = null;

            if (action === 'accept') {
                gmailResult = await executeGmailAction(emailId);
            }

            const history = {
                userId,
                emailId,
                action,
                timestamp: new Date().toISOString(),
                details: {
                    gmailResponse: gmailResult,
                    note: action === 'accept' ? 'Ejecutado' : 'Ignorado'
                }
            };

            await historyService.record(history);
            results.push(history);
        }

        return {
            success: true,
            processed: results.length,
            data: results
        };
    },

    createNewSuggestionsEvent({ userId, suggestions }) {
        return buildNewSuggestionsEvent({ userId, suggestions });
    }
});
