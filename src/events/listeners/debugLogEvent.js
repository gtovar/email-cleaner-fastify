// src/events/listeners/debugLogEvent.js

export function makeDebugLogEventListener({ logger }) {
  return async function debugLogEvent(event) {
      logger?.debug?.(
            { event },
            "Event received on EventBus (debug listener)"
          );
    };
}
