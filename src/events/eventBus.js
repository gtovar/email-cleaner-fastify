// src/events/eventBus.js

/**
 * Crea un EventBus en memoria, con API explícita:
 *  - subscribe(eventName, handler) → devuelve función para desuscribirse.
 *  - publish(eventName, payload)  → ejecuta los handlers (pueden ser async).
 *  - clear(eventName?)           → limpia handlers (útil para tests).
 *
 * No depende de EventEmitter de Node, es una implementación simple y predecible.
 */
export function createEventBus({ logger } = {}) {
  // Map<string, Set<Function>>
  const subscribers = new Map();

  function subscribe(eventName, handler) {
    if (!eventName || typeof handler !== "function") {
      throw new Error("subscribe(eventName, handler) requiere argumentos válidos");
    }

    if (!subscribers.has(eventName)) {
      subscribers.set(eventName, new Set());
    }

    const handlers = subscribers.get(eventName);
    handlers.add(handler);

    // Función de cleanup para desuscribirse
    return () => {
      const currentHandlers = subscribers.get(eventName);
      if (!currentHandlers) return;
      currentHandlers.delete(handler);
      if (currentHandlers.size === 0) {
        subscribers.delete(eventName);
      }
    };
  }

  async function publish(eventName, payload) {
    const handlers = subscribers.get(eventName);
    if (!handlers || handlers.size === 0) {
      logger?.debug?.({ eventName }, "No subscribers registered for event");
      return;
    }

    // Ejecutamos handlers en serie (más simple de razonar)
    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (err) {
        logger?.error?.(
          { err, eventName },
          "Error while handling event on EventBus"
        );
      }
    }
  }

  function clear(eventName) {
    if (typeof eventName === "string") {
      subscribers.delete(eventName);
      return;
    }
    subscribers.clear();
  }

  return {
    subscribe,
    publish,
    clear,
  };
}

/**
 * Dominio de eventos conocidos del sistema.
 * Úsalo para evitar strings mágicos en el código.
 */
export const DOMAIN_EVENTS = {
  SUGGESTIONS_GENERATED: "domain.suggestions.generated",
  SUGGESTION_CONFIRMED: "domain.suggestions.confirmed",
};

/**
 * Singleton por defecto.
 *
 * En la mayoría de los casos usarás este directamente:
 *   import { eventBus } from "../events/eventBus.js";
 *
 * En tests o configuraciones avanzadas puedes crear buses adicionales con createEventBus().
 */
export const eventBus = createEventBus();

