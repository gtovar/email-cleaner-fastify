import { EventEmitter } from 'events';
const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

export const eventBus = {
    subscribe(eventName, handler) {
        if (!subscribers[eventName]) {
            subscribers[eventName] = [];
        }
        subscribers[eventName].push(handler);
    },

    publish(eventName, payload) {
        if (!subscribers[eventName]) return;

        for (const handler of subscribers[eventName]) {
            handler(payload);
        }
    }
};

export const DOMAIN_EVENTS = {
  NEW_SUGGESTIONS: 'domain.suggestions.generated'
};

export function publishEvent(eventName, payload) {
  eventBus.emit(eventName, payload);
}

export function subscribeEvent(eventName, handler) {
  eventBus.on(eventName, handler);
  return () => eventBus.off(eventName, handler);
}

export function clearEventListeners(eventName) {
  if (eventName) {
    eventBus.removeAllListeners(eventName);
  } else {
    eventBus.removeAllListeners();
  }
}

export { eventBus };
