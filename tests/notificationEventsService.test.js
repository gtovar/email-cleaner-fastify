import { describe, expect, test, jest } from '@jest/globals';
import { notificationEventsService, NEW_SUGGESTIONS_EVENT } from '../src/services/notificationEventsService.js';

describe('notificationEventsService', () => {
  test('filters by userId and type while paginating', async () => {
    const now = new Date().toISOString();
    const rows = [
      { toJSON: () => ({ type: NEW_SUGGESTIONS_EVENT, userId: 'user-a', summary: { totalSuggestions: 2 }, createdAt: now, updatedAt: now }) },
      { toJSON: () => ({ type: 'SYSTEM_HEALTH', userId: 'user-b', summary: { message: 'ok' }, createdAt: now, updatedAt: now }) }
    ];

    const model = {
      findAndCountAll: jest.fn(async ({ where, limit, offset, order }) => {
        const filtered = rows.filter((r) => {
          const json = r.toJSON();
          if (where.type && json.type !== where.type) return false;
          if (where.userId && json.userId !== where.userId) return false;
          return true;
        });
        return { count: filtered.length, rows: filtered };
      })
    };

    const service = notificationEventsService({ NotificationEvent: model });
    const result = await service.list({ page: 1, perPage: 5, type: NEW_SUGGESTIONS_EVENT, userId: 'user-a' });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({ type: NEW_SUGGESTIONS_EVENT, userId: 'user-a' });
  });
});
