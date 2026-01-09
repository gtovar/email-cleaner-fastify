// src/commands/notification_events/recordNotificationEventCommand.js

export function recordNotificationEventCommand({ models, logger }) {
  const { NotificationEvent } = models;

  return {
    async execute(dbEvent) {
      if (!dbEvent?.type || !dbEvent?.userId) {
        throw new Error("Invalid dbEvent: missing type/userId");
      }

      const row = await NotificationEvent.create(dbEvent);

      logger?.info?.(
        { type: dbEvent.type, userId: dbEvent.userId },
        "NotificationEvent persisted"
      );

      return row;
    },
  };
}

