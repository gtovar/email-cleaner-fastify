import { buildNewSuggestionsEvent } from "./notificationsEventsBuilder.js";
import { DOMAIN_EVENTS } from "../events/eventBus.js";

export const notificationsService = ({ models, eventBus }) => ({
  async getSummaryForUser({ userId }) {
      const summary = await summaryQueries.getNotificationSummaryForUser({ models, userId });

      if (summary.length > 0) {
            const domainEvent = buildNewSuggestionsEvent({ userId, suggestions: summary });

            await eventBus.publish(DOMAIN_EVENTS.NEW_SUGGESTIONS, domainEvent);
          }

      return summary;
    },
});

