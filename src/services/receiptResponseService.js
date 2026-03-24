import { UniqueConstraintError } from 'sequelize';

function toApiShape(rowOrNull, targetId) {
  if (!rowOrNull) {
    return {
      targetId,
      response: null,
      updatedAt: null,
    };
  }

  return {
    targetId,
    response: rowOrNull.response,
    updatedAt:
      typeof rowOrNull.updatedAt?.toISOString === 'function'
        ? rowOrNull.updatedAt.toISOString()
        : rowOrNull.updatedAt ?? null,
  };
}

function isUniqueConstraint(error) {
  return (
    error instanceof UniqueConstraintError ||
    error?.name === 'SequelizeUniqueConstraintError'
  );
}

function createTargetNotFoundError() {
  const error = new Error('Email content not found');
  error.statusCode = 404;
  return error;
}

export function receiptResponseService({ models, logger, resolveTarget = async () => true }) {
  const { ReceiptResponse } = models ?? {};

  if (!ReceiptResponse) {
    throw new Error('ReceiptResponse model is not registered');
  }

  return {
    async upsert({ userId, targetId, response }) {
      // HU_07A keeps targetId in the API contract while resolving it to emailId internally.
      const emailId = String(targetId);
      const targetExists = await resolveTarget({ userId, targetId: emailId });

      if (!targetExists) {
        throw createTargetNotFoundError();
      }

      try {
        const row = await ReceiptResponse.create({
          userId,
          emailId,
          response,
        });

        logger?.info?.(
          { userId, emailId, response },
          'Receipt response created',
        );

        return toApiShape(row, emailId);
      } catch (error) {
        if (!isUniqueConstraint(error)) {
          throw error;
        }

        const row = await ReceiptResponse.findOne({
          where: { userId, emailId },
        });

        if (!row) {
          throw error;
        }

        row.response = response;
        await row.save();

        logger?.info?.(
          { userId, emailId, response },
          'Receipt response updated after conflict',
        );

        return toApiShape(row, emailId);
      }
    },

    async getCurrent({ userId, targetId }) {
      const emailId = String(targetId);
      const targetExists = await resolveTarget({ userId, targetId: emailId });

      if (!targetExists) {
        throw createTargetNotFoundError();
      }

      const row = await ReceiptResponse.findOne({
        where: { userId, emailId },
      });

      return toApiShape(row, emailId);
    },
  };
}
