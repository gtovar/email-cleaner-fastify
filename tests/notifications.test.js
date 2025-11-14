import test from 'node:test';
import assert from 'node:assert/strict';
import { notificationsService } from '../src/services/notificationsService.js';

test('getSummary devuelve al menos una sugerencia demo', async () => {
  const fakeModels = {};
  const service = notificationsService(fakeModels);

  const summary = await service.getSummary({
    userId: 'demo-user',
    period: 'daily'
  });

  assert.ok(Array.isArray(summary), 'summary debe ser un array');
  assert.ok(summary.length > 0, 'summary no debe estar vacío');

  const first = summary[0];
  assert.equal(first.id, 'test1');
  assert.deepEqual(first.suggestions, ['archive']);
});

test('confirmActions registra acción y devuelve conteo procesado', async () => {
  const recorded = [];

  const fakeModels = {
    ActionHistory: {
      async create(row) {
        recorded.push(row);
        return row;
      }
    }
  };

  const service = notificationsService(fakeModels);

  const result = await service.confirmActions({
    ids: ['test1'],
    action: 'accept',
    userId: 'user-123'
  });

  // Lo que el servicio realmente devuelve
  assert.equal(result.success, true);
  assert.equal(result.processed, 1);

  // Lo que se registró en el historial
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].userId, 'user-123');
  assert.equal(recorded[0].emailId, 'test1');
  assert.equal(recorded[0].action, 'accept');
  assert.ok(recorded[0].timestamp, 'debe tener timestamp');
});

