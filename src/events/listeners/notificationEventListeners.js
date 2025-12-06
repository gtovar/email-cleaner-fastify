import { notificationEventsService } from './notificationEventsService.js';
import { DOMAIN_EVENTS, subscribeEvent } from './eventBus.js';

let listenersRegistered = false;

export function registerNotificationEventListeners({ eventBus, models }) {
  if (listenersRegistered) return;
  listenersRegistered = true;

  const eventsService = notificationEventsService(models);

  subscribeEvent(DOMAIN_EVENTS.NEW_SUGGESTIONS, async (event) => {
    if (!event) return;
    await eventsService.record(event);
  });
}

export { DOMAIN_EVENTS } from './eventBus.js';

// Testing hook to allow re-registering listeners with fresh models
export function __resetNotificationEventListeners() {
  listenersRegistered = false;
}
