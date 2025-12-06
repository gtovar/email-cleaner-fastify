import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { notificationsService } from '../src/services/notificationsService.js';
import { registerNotificationEventListeners, __resetNotificationEventListeners } from '../src/services/notificationEventListeners.js';
import { clearEventListeners, DOMAIN_EVENTS } from '../src/services/eventBus.js';

describe('notificationsService', () => {
    let recorded;
    let eventsRecorded;
    let service;

    beforeEach(() => {
        recorded = [];
        eventsRecorded = [];
        clearEventListeners(DOMAIN_EVENTS.NEW_SUGGESTIONS);
        __resetNotificationEventListeners();

        const fakeModels = {
            ActionHistory: {
                create: jest.fn(async (row) => {
                    recorded.push(row);
                    return row;
                })
            },
            NotificationEvent: {
                create: jest.fn(async (row) => {
                    eventsRecorded.push(row);
                    return row;
                })
            }
        };

        registerNotificationEventListeners({ eventBus: null, models: fakeModels });
        service = notificationsService(fakeModels);
    });

    afterEach(() => {
        clearEventListeners(DOMAIN_EVENTS.NEW_SUGGESTIONS);
        __resetNotificationEventListeners();
    });

    test('getSummary devuelve al menos una sugerencia demo', async () => {
        const summary = await service.getSummary({
            userId: 'demo-user',
            period: 'daily'
        });

        expect(Array.isArray(summary)).toBe(true);
        expect(summary.length).toBeGreaterThan(0);
        expect(summary[0]).toMatchObject({
            id: 'test1',
            suggestions: ['archive']
        });

        expect(eventsRecorded).toHaveLength(1);
        expect(eventsRecorded[0]).toMatchObject({
            type: 'NEW_SUGGESTIONS_AVAILABLE',
            userId: 'demo-user'
        });
    });

    test('confirmActions registra acción y devuelve conteo procesado', async () => {
        const result = await service.confirmActions({
            ids: ['test1'],
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
