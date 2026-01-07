import { describe, expect, test } from '@jest/globals';
import { buildNewSuggestionsEvent } from '../src/events/builders/newSuggestionsEvent.builder.js';
import { notificationsService } from '../src/services/notificationsService.js';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';


describe('buildNewSuggestionsEvent', () => {
  const suggestions = [
    { id: 'email-1', subject: 'First subject', suggestions: ['archive', 'delete'] },
    { id: 'email-2', subject: 'Second subject', suggestions: ['archive'] }
  ];

  test('creates a structured event with summary and timestamp', () => {
    const event = buildNewSuggestionsEvent({ userId: 'user-123', suggestions });

    expect(event).toMatchObject({
      type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
      userId: 'user-123',
      suggestions
    });

    expect(event.summary.totalSuggestions).toBe(3);
    expect(event.summary.sampledEmails).toEqual([
      { emailId: 'email-1', subject: 'First subject', suggestions: ['archive', 'delete'] },
      { emailId: 'email-2', subject: 'Second subject', suggestions: ['archive'] }
    ]);

    expect(new Date(event.generatedAt).toString()).not.toBe('Invalid Date');
  });

  test('is exposed through notificationsService for reuse', () => {
    const service = notificationsService({});
    const event = service.createNewSuggestionsEvent({ userId: 'user-123', suggestions });

    expect(event.type).toBe(DOMAIN_EVENTS.SUGGESTIONS_GENERATED);
    expect(event.userId).toBe('user-123');
    expect(event.summary.totalSuggestions).toBe(3);
  });

  test('throws when userId is missing', () => {
    expect(() => buildNewSuggestionsEvent({ suggestions })).toThrow(/userId/i);
  });
});
