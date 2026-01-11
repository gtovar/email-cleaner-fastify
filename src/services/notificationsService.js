import { executeGmailAction } from './actionExecutor.js';
import { summaryQueries } from '../queries/notifications/index.js';
import { confirmActionCommand } from "../commands/notifications/confirmActionCommand.js";
import { buildNewSuggestionsEvent } from '../events/builders/newSuggestionsEvent.builder.js';


export const notificationsService = ({ models, eventBus, logger }) => ({
  /**
   * GET /api/v1/notifications/summary
   *
   * Orquesta el flujo:
   *  - Lee el summary agregado vía Query (CQRS: solo lectura)
   *  - Devuelve el summary al controller
   */
  async getSummaryForUser({ userId = 'demo-user', period } = {}) {
    // 1) Delegar la lectura a la capa de Queries
    const summary = await summaryQueries.getNotificationSummaryForUser({
      models,
      userId,
      period,
    });

    // 2) Devolver tal cual al frontend
    return summary;
  },

  // POST /api/v1/notifications/confirm
  async confirmActions({ emailIds, action, userId }) {
    const results = [];

    for (const emailId of emailIds) {
      let gmailResult = null;

      if (action === 'accept') {
        gmailResult = await executeGmailAction(emailId);
      }

      results.push({
        userId,
        emailId,
        action,
        timestamp: new Date().toISOString(),
        details: {
          gmailResponse: gmailResult,
          note: action === 'accept' ? 'Ejecutado' : 'Ignorado'
        }
      });
    }
    
    const commandResult = await confirmActionCommand({
      models,
      eventBus,
      logger,
      userId,
      emailIds,
      action,
    });

    return {
      ...commandResult,
      emailIds,
      action,
      data: results
    };
  },
  createNewSuggestionsEvent({ userId, suggestions }) {
    return buildNewSuggestionsEvent({ userId, suggestions });
  }
});
