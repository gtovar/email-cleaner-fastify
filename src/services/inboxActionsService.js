import { executeInboxAction } from './actionExecutor.js';

const normalizeItemFailureReason = (error) => {
  if (typeof error?.code === 'string' && error.code.trim()) {
    return error.code.trim();
  }
  return 'execution_failed';
};

const deriveExecution = ({ processed, failed }) => {
  if (processed > 0 && failed === 0) return 'full';
  if (processed > 0 && failed > 0) return 'partial';
  return 'none';
};

export const inboxActionsService = ({ models, logger }) => ({
  async runActions({ emailIds, action, userId }) {
    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return {
        success: true,
        execution: 'none',
        action,
        source: 'inbox',
        summary: {
          total: 0,
          processed: 0,
          failed: 0,
        },
        results: [],
      };
    }

    const rows = [];
    const results = [];

    try {
      for (const emailId of emailIds) {
        try {
          const gmailResult = await executeInboxAction(emailId, action);
          rows.push({
            userId,
            emailId,
            action,
            timestamp: new Date().toISOString(),
            details: {
              source: 'inbox',
              gmailResponse: gmailResult,
              note: 'Executed from inbox direct action flow',
            },
          });
          results.push({ emailId, status: 'ok' });
        } catch (error) {
          results.push({
            emailId,
            status: 'error',
            reason: normalizeItemFailureReason(error),
          });
        }
      }

      if (rows.length > 0) {
        await models.ActionHistory.bulkCreate(rows);
      }
    } catch (error) {
      logger?.error?.(
        { userId, action, count: emailIds.length, source: 'inbox', err: error },
        'Inbox bulk action failed before valid item processing completed'
      );

      return {
        success: false,
        execution: 'none',
        action,
        source: 'inbox',
        summary: {
          total: emailIds.length,
          processed: 0,
          failed: emailIds.length,
        },
        results: emailIds.map((emailId) => ({
          emailId,
          status: 'error',
          reason: 'system_error',
        })),
      };
    }

    const summary = {
      total: emailIds.length,
      processed: results.filter((result) => result.status === 'ok').length,
      failed: results.filter((result) => result.status === 'error').length,
    };
    const execution = deriveExecution(summary);

    logger?.info?.(
      { userId, action, count: emailIds.length, source: 'inbox', execution, summary },
      'Inbox actions executed'
    );

    return {
      success: true,
      execution,
      action,
      source: 'inbox',
      summary,
      results,
    };
  },
});
