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

export function receiptResponseService({ models, logger }) {
  const { ReceiptResponse } = models ?? {};

  if (!ReceiptResponse) {
    throw new Error('ReceiptResponse model is not registered');
  }

  return {
    async upsert({ userId, targetId, response }) {
      // HU_07A keeps targetId in the API contract while resolving it to emailId internally.
      const emailId = String(targetId);

      let row = await ReceiptResponse.findOne({
        where: { userId, emailId },
      });

      if (!row) {
        row = await ReceiptResponse.create({
          userId,
          emailId,
          response,
        });

        logger?.info?.(
          { userId, emailId, response },
          'Receipt response created',
        );
      } else {
        row.response = response;
        await row.save();

        logger?.info?.(
          { userId, emailId, response },
          'Receipt response updated',
        );
      }

      return toApiShape(row, emailId);
    },

    async getCurrent({ userId, targetId }) {
      const emailId = String(targetId);

      const row = await ReceiptResponse.findOne({
        where: { userId, emailId },
      });

      return toApiShape(row, emailId);
    },
  };
}
