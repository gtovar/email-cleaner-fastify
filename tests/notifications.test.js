import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { notificationsService } from '../src/services/notificationsService.js';

describe('notificationsService', () => {
    let recorded;
    let service;

    beforeEach(() => {
        recorded = [];
        const fakeModels = {
            ActionHistory: {
                create: jest.fn(async (row) => {
                    recorded.push(row);
                    return row;
                })
            }
        };
        service = notificationsService(fakeModels);
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
