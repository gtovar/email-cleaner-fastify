import { NEW_SUGGESTIONS_EVENT } from './notificationsService.js';

export function notificationEventsService(models) {
  const model = models?.NotificationEvent;
  if (!model) {
    throw new Error('NotificationEvent model is required');
  }

  return {
    async record(event) {
      return model.create(event);
    },

    async list({ page = 1, perPage = 20, type, userId } = {}) {
      const safePage = Number(page) > 0 ? Number(page) : 1;
      const safePerPage = Number(perPage) > 0 ? Number(perPage) : 20;

      const where = {};
      if (type) where.type = type;
      if (userId) where.userId = userId;

      const { count, rows } = await model.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset: (safePage - 1) * safePerPage,
        limit: safePerPage
      });

      return {
        total: count,
        page: safePage,
        perPage: safePerPage,
        data: rows.map((row) => row.toJSON())
      };
    }
  };
}

export { NEW_SUGGESTIONS_EVENT } from './notificationsService.js';
