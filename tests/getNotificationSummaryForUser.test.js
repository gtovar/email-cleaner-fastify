import { describe, test, expect, jest } from '@jest/globals';
import { Op } from 'sequelize';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';
import { getNotificationSummaryForUser } from '../src/queries/notifications/getNotificationSummaryForUser.js';

describe('getNotificationSummaryForUser temporal contract', () => {
  test('daily uses a rolling 24-hour UTC window on persisted createdAt', async () => {
    const events = [
      {
        type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
        summary: {
          totalSuggestions: 2,
          actionCounts: { archive: 2 },
          classificationCounts: { bulk: 2 }
        },
        createdAt: '2026-01-09T12:00:00.000Z'
      },
      {
        type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
        summary: { totalConfirmed: 1, action: 'accept' },
        createdAt: '2026-01-09T12:00:00.000Z'
      }
    ];

    const models = {
      NotificationEvent: {
        findAll: jest.fn(async () => events)
      }
    };

    const summary = await getNotificationSummaryForUser({
      models,
      userId: 'demo-user',
      period: 'daily',
      now: '2026-01-10T12:00:00.000Z'
    });

    const where = models.NotificationEvent.findAll.mock.calls[0][0].where;
    const [start, end] = where.createdAt[Op.between];

    expect(start.toISOString()).toBe('2026-01-09T12:00:00.000Z');
    expect(end.toISOString()).toBe('2026-01-10T12:00:00.000Z');
    expect(summary).toEqual({
      period: 'daily',
      windowStart: '2026-01-09T12:00:00.000Z',
      windowEnd: '2026-01-10T12:00:00.000Z',
      totalEvents: 2,
      totalSuggestions: 2,
      totalConfirmed: 1,
      suggestedActions: { archive: 2 },
      confirmedActions: { accept: 1 },
      classifications: { bulk: 2 }
    });
  });

  test('weekly uses a rolling 7-day UTC window with inclusive boundaries', async () => {
    const models = {
      NotificationEvent: {
        findAll: jest.fn(async ({ where }) => {
          const [start, end] = where.createdAt[Op.between];
          const events = [
            {
              type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
              summary: {
                totalSuggestions: 4,
                actionCounts: { delete: 4 },
                classificationCounts: { stale_unread: 4 }
              },
              createdAt: start.toISOString()
            },
            {
              type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
              summary: { totalConfirmed: 1, action: 'accept' },
              createdAt: end.toISOString()
            }
          ];
          return events;
        })
      }
    };

    const summary = await getNotificationSummaryForUser({
      models,
      userId: 'demo-user',
      period: 'weekly',
      now: '2026-01-10T12:00:00.000Z'
    });

    const where = models.NotificationEvent.findAll.mock.calls[0][0].where;
    const [start, end] = where.createdAt[Op.between];

    expect(start.toISOString()).toBe('2026-01-03T12:00:00.000Z');
    expect(end.toISOString()).toBe('2026-01-10T12:00:00.000Z');
    expect(summary).toEqual({
      period: 'weekly',
      windowStart: '2026-01-03T12:00:00.000Z',
      windowEnd: '2026-01-10T12:00:00.000Z',
      totalEvents: 2,
      totalSuggestions: 4,
      totalConfirmed: 1,
      suggestedActions: { delete: 4 },
      confirmedActions: { accept: 1 },
      classifications: { stale_unread: 4 }
    });
  });

  test('omitted period means all-time summary with null windows', async () => {
    const models = {
      NotificationEvent: {
        findAll: jest.fn(async () => [
          {
            type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
            summary: {
              totalSuggestions: 3,
              actionCounts: { archive: 3 },
              classificationCounts: { promotions_old: 3 }
            },
            createdAt: '2026-01-01T00:00:00.000Z'
          }
        ])
      }
    };

    const summary = await getNotificationSummaryForUser({
      models,
      userId: 'demo-user',
      now: '2026-01-10T12:00:00.000Z'
    });

    const where = models.NotificationEvent.findAll.mock.calls[0][0].where;

    expect(where.userId).toBe('demo-user');
    expect(where.createdAt).toBeUndefined();
    expect(summary).toEqual({
      period: 'all',
      windowStart: null,
      windowEnd: null,
      totalEvents: 1,
      totalSuggestions: 3,
      totalConfirmed: 0,
      suggestedActions: { archive: 3 },
      confirmedActions: {},
      classifications: { promotions_old: 3 }
    });
  });
});
