import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { registerNotificationEventListeners } from '../src/events/subscribers/registerNotificationEventListeners.js';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';
import { notificationsService } from '../src/services/notificationsService.js';


describe('notificationsService', () => {
    let recorded;
    let eventsRecorded;
    let service;

    function createFakeEventBus() {
      const subscribers = new Map(); // eventName -> handlers[]
      return {
          subscribe(eventName, handler) {
                const list = subscribers.get(eventName) ?? [];
                list.push(handler);
                subscribers.set(eventName, list);
                return () => {
                        const next = (subscribers.get(eventName) ?? []).filter((h) => h !== handler);
                        subscribers.set(eventName, next);
                      };
              },
          async publish(eventName, payload) {
                const handlers = subscribers.get(eventName) ?? [];
                for (const handler of handlers) {
                        await handler(payload);
                      }
              },
          _subscribers: subscribers
        };
    }

    beforeEach(() => {
        recorded = [];
        eventsRecorded = [];
        const eventBus = createFakeEventBus()

        const fakeModels = {
            ActionHistory: {
                bulkCreate: jest.fn(async (rows) => {
                  for (const row of rows) recorded.push(row);
                  return rows;
                }),
                create: jest.fn(async (row) => { recorded.push(row); return row; })
            },
            NotificationEvent: {
                bulkCreate: jest.fn(async (rows) => {
                    rows.forEach((row) => eventsRecorded.push(row));
                    return rows;
                }),
                create: jest.fn(async (row) => {
                    eventsRecorded.push(row);
                    return row;
                })
            }
        };
       
        const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

        registerNotificationEventListeners({ eventBus, models: fakeModels, logger });
        service = notificationsService({ models: fakeModels, eventBus, logger });
    });

    test('getSummaryForUser publica domain.suggestions.generated y se persiste NotificationEvent', async () => {
        const summary = await service.getSummaryForUser({
            userId: 'demo-user',
            period: 'daily'
        });

        expect(Array.isArray(summary)).toBe(true);
        expect(summary.length).toBeGreaterThan(0);

        expect(eventsRecorded).toHaveLength(1);
        expect(eventsRecorded[0]).toMatchObject({
            type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
            userId: 'demo-user'
        });
    });

    test('confirmActions registra acción y devuelve conteo procesado', async () => {
        const result = await service.confirmActions({
            emailIds: ['test1'],
            action: 'accept',
            userId: 'user-123'
        });

        expect(result).toMatchObject({
            success: true,
            processed: 1
        });

        expect(recorded).toHaveLength(1);
        expect(recorded[0]).toMatchObject({
            userId: 'user-123',
            emailId: 'test1',
            action: 'accept'
        });
        expect(recorded[0].timestamp).toBeDefined();
    });
});
