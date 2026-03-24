import { describe, test, expect, jest } from '@jest/globals';
import { receiptResponseService } from '../src/services/receiptResponseService.js';

describe('receiptResponseService.upsert', () => {
  test('resolves a unique-constraint conflict without surfacing a failure to the caller', async () => {
    const savedRow = {
      userId: 'user-a',
      emailId: 'email-1',
      response: 'paid',
      updatedAt: new Date('2026-03-24T12:00:00.000Z'),
      save: jest.fn(async function save() {
        this.updatedAt = new Date('2026-03-24T12:01:00.000Z');
        return this;
      }),
    };

    const models = {
      ReceiptResponse: {
        create: jest.fn(async () => {
          const error = new Error('duplicate key value violates unique constraint');
          error.name = 'SequelizeUniqueConstraintError';
          throw error;
        }),
        findOne: jest.fn(async () => savedRow),
      },
    };

    const logger = { info: jest.fn() };
    const service = receiptResponseService({ models, logger });

    const result = await service.upsert({
      userId: 'user-a',
      targetId: 'email-1',
      response: 'ignore',
    });

    expect(models.ReceiptResponse.create).toHaveBeenCalledWith({
      userId: 'user-a',
      emailId: 'email-1',
      response: 'ignore',
    });
    expect(models.ReceiptResponse.findOne).toHaveBeenCalledWith({
      where: { userId: 'user-a', emailId: 'email-1' },
    });
    expect(savedRow.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      targetId: 'email-1',
      response: 'ignore',
      updatedAt: '2026-03-24T12:01:00.000Z',
    });
  });
});
