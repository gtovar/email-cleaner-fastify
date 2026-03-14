import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.unstable_mockModule('../src/services/actionExecutor.js', () => ({
  executeInboxAction: jest.fn(async (emailId, action) => ({
    simulated: true,
    emailId,
    action,
  })),
}));

const { inboxActionsService } = await import('../src/services/inboxActionsService.js');
const { executeInboxAction } = await import('../src/services/actionExecutor.js');

describe('inboxActionsService', () => {
  let recorded;
  let bulkCreate;
  let service;

  beforeEach(() => {
    recorded = [];
    executeInboxAction.mockReset();
    executeInboxAction.mockImplementation(async (emailId, action) => ({
      simulated: true,
      emailId,
      action,
    }));
    bulkCreate = jest.fn(async (rows) => {
      rows.forEach((row) => recorded.push(row));
      return rows;
    });

    service = inboxActionsService({
      models: {
        ActionHistory: {
          bulkCreate,
        },
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    });
  });

  test('returns full execution when all items succeed', async () => {
    const result = await service.runActions({
      emailIds: ['email-1', 'email-2'],
      action: 'mark_unread',
      userId: 'user-123',
    });

    expect(executeInboxAction).toHaveBeenCalledTimes(2);
    expect(recorded).toHaveLength(2);
    expect(result).toEqual({
      success: true,
      execution: 'full',
      action: 'mark_unread',
      source: 'inbox',
      summary: {
        total: 2,
        processed: 2,
        failed: 0,
      },
      results: [
        { emailId: 'email-1', status: 'ok' },
        { emailId: 'email-2', status: 'ok' },
      ],
    });
  });

  test('returns partial execution when some items fail', async () => {
    executeInboxAction.mockImplementation(async (emailId, action) => {
      if (emailId === 'email-2') {
        const error = new Error('Missing email');
        error.code = 'not_found';
        throw error;
      }
      return { simulated: true, emailId, action };
    });

    const result = await service.runActions({
      emailIds: ['email-1', 'email-2', 'email-3'],
      action: 'archive',
      userId: 'user-123',
    });

    expect(recorded).toHaveLength(2);
    expect(result).toEqual({
      success: true,
      execution: 'partial',
      action: 'archive',
      source: 'inbox',
      summary: {
        total: 3,
        processed: 2,
        failed: 1,
      },
      results: [
        { emailId: 'email-1', status: 'ok' },
        { emailId: 'email-2', status: 'error', reason: 'not_found' },
        { emailId: 'email-3', status: 'ok' },
      ],
    });
  });

  test('returns none execution when all items fail individually', async () => {
    executeInboxAction.mockImplementation(async () => {
      const error = new Error('Cannot execute');
      error.code = 'execution_failed';
      throw error;
    });

    const result = await service.runActions({
      emailIds: ['email-1', 'email-2'],
      action: 'delete',
      userId: 'user-123',
    });

    expect(bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      execution: 'none',
      action: 'delete',
      source: 'inbox',
      summary: {
        total: 2,
        processed: 0,
        failed: 2,
      },
      results: [
        { emailId: 'email-1', status: 'error', reason: 'execution_failed' },
        { emailId: 'email-2', status: 'error', reason: 'execution_failed' },
      ],
    });
  });

  test('returns success true with execution none when emailIds is empty', async () => {
    const result = await service.runActions({
      emailIds: [],
      action: 'archive',
      userId: 'user-123',
    });

    expect(executeInboxAction).not.toHaveBeenCalled();
    expect(bulkCreate).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      execution: 'none',
      action: 'archive',
      source: 'inbox',
      summary: {
        total: 0,
        processed: 0,
        failed: 0,
      },
      results: [],
    });
  });

  test('preserves per-item outcomes when persistence fails after execution', async () => {
    bulkCreate.mockRejectedValueOnce(new Error('db unavailable'));
    executeInboxAction.mockImplementation(async (emailId, action) => {
      if (emailId === 'email-2') {
        const error = new Error('Missing email');
        error.code = 'not_found';
        throw error;
      }
      return { simulated: true, emailId, action };
    });

    const result = await service.runActions({
      emailIds: ['email-1', 'email-2'],
      action: 'archive',
      userId: 'user-123',
    });

    expect(result).toEqual({
      success: true,
      execution: 'partial',
      action: 'archive',
      source: 'inbox',
      summary: {
        total: 2,
        processed: 1,
        failed: 1,
      },
      results: [
        { emailId: 'email-1', status: 'ok' },
        { emailId: 'email-2', status: 'error', reason: 'not_found' },
      ],
    });
  });
});
