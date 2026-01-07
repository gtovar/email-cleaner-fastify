import { recordNotificationEventCommand } from "../commands/notification_events/recordNotificationEventCommand.js";

export const notificationEventsService = ({ models, eventBus, logger }) => ({
  /**
   * Write-path (CQRS-lite): persistir NotificationEvent
   */
  async record(dbEvent) {
    const cmd = recordNotificationEventCommand({ models, logger });
    return cmd.execute(dbEvent);
  },

  /**
   * Read-path (CQRS-lite): listar/paginar/filtrar NotificationEvents
   */
  async list({ page = 1, perPage = 20, type, userId } = {}) {
    const NotificationEvent = models?.NotificationEvent;
    if (!NotificationEvent?.findAndCountAll) {
      throw new Error("NotificationEvent model with findAndCountAll is required");
    }

    const where = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const safePage = Number(page) || 1;
    const safePerPage = Number(perPage) || 20;
    const limit = safePerPage;
    const offset = (safePage - 1) * safePerPage;

    const result = await NotificationEvent.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      total: result.count,
      page: safePage,
      perPage: safePerPage,
      data: result.rows.map((r) => (typeof r.toJSON === "function" ? r.toJSON() : r)),
    };
  }
});

