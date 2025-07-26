export const actionHistoryService = (models) => ({
  async record(historyItem) {
    await models.ActionHistory.create(historyItem);
  },

  async getHistory({ userId, page = 1, perPage = 20 }) {
    const offset = (page - 1) * perPage;

    const { rows, count } = await models.ActionHistory.findAndCountAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit: perPage,
      offset
    });

    return {
      total: count,
      page,
      perPage,
      data: rows
    };
  }
});
