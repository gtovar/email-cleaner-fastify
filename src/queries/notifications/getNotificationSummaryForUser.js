// src/queries/notifications/getNotificationSummaryForUser.js
import { Op } from 'sequelize';
import { DOMAIN_EVENTS } from '../../events/eventBus.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function buildPeriodWindow(period) {
  const now = new Date();
  if (period === 'daily') {
    return { period, start: new Date(now.getTime() - DAY_MS), end: now };
  }
  if (period === 'weekly') {
    return { period, start: new Date(now.getTime() - 7 * DAY_MS), end: now };
  }
  return { period: period ?? 'all', start: null, end: null };
}

function createEmptySummary({ period, start, end }) {
  return {
    period,
    windowStart: start ? start.toISOString() : null,
    windowEnd: end ? end.toISOString() : null,
    totalEvents: 0,
    totalSuggestions: 0,
    totalConfirmed: 0,
    suggestedActions: {},
    confirmedActions: {},
    clasificaciones: {}
  };
}

/**
 * Query CQRS-lite para el summary de notificaciones.
 *
 * Fuente: NotificationEvent (summary agregado por eventos de dominio).
 *
 * Firma:
 *   getNotificationSummaryForUser({ models, userId, period })
 */
export async function getNotificationSummaryForUser({ models, userId, period } = {}) {
  const { period: normalizedPeriod, start, end } = buildPeriodWindow(period);
  const NotificationEvent = models?.NotificationEvent;

  if (!NotificationEvent?.findAll) {
    return createEmptySummary({ period: normalizedPeriod, start, end });
  }

  const where = { userId: userId ?? 'demo-user' };
  if (start && end) {
    where.createdAt = { [Op.between]: [start, end] };
  }

  const events = await NotificationEvent.findAll({
    where,
    attributes: ['type', 'summary', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  const summary = createEmptySummary({ period: normalizedPeriod, start, end });
  summary.totalEvents = events.length;

  for (const event of events) {
    const payloadSummary = event?.summary ?? {};

    if (event.type === DOMAIN_EVENTS.SUGGESTIONS_GENERATED) {
      summary.totalSuggestions += Number(payloadSummary.totalSuggestions || 0);

      const actionCounts = payloadSummary.actionCounts || {};
      for (const [action, count] of Object.entries(actionCounts)) {
        summary.suggestedActions[action] = (summary.suggestedActions[action] ?? 0) + Number(count || 0);
      }

      const clasificacionCounts = payloadSummary.clasificacionCounts || {};
      for (const [label, count] of Object.entries(clasificacionCounts)) {
        summary.clasificaciones[label] = (summary.clasificaciones[label] ?? 0) + Number(count || 0);
      }
    }

    if (event.type === DOMAIN_EVENTS.SUGGESTION_CONFIRMED) {
      const confirmed = Number(payloadSummary.totalConfirmed || 0);
      summary.totalConfirmed += confirmed;

      if (payloadSummary.action) {
        const action = String(payloadSummary.action);
        summary.confirmedActions[action] = (summary.confirmedActions[action] ?? 0) + confirmed;
      }
    }
  }

  return summary;
}
