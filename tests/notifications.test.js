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
                }),
                findAll: jest.fn(async () => ([
                    {
                        type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
                        summary: {
                            totalSuggestions: 3,
                            actionCounts: { archive: 2, delete: 1 },
                            classificationCounts: { bulk: 2, stale_unread: 1 }
                        },
                        createdAt: new Date().toISOString()
                    },
                    {
                        type: DOMAIN_EVENTS.SUGGESTION_CONFIRMED,
                        summary: { totalConfirmed: 1, action: 'accept' },
                        createdAt: new Date().toISOString()
                    }
                ]))
            }
        };
       
        const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

        registerNotificationEventListeners({ eventBus, models: fakeModels, logger });
        service = notificationsService({ models: fakeModels, eventBus, logger });
    });

    test('getSummaryForUser devuelve summary agregado desde NotificationEvent', async () => {
        const summary = await service.getSummaryForUser({
            userId: 'demo-user',
            period: 'daily'
        });

        expect(summary).toMatchObject({
            period: 'daily',
            totalEvents: 2,
            totalSuggestions: 3,
            totalConfirmed: 1,
            suggestedActions: { archive: 2, delete: 1 },
            confirmedActions: { accept: 1 },
            classifications: { bulk: 2, stale_unread: 1 }
        });
        expect(eventsRecorded).toHaveLength(0);
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
