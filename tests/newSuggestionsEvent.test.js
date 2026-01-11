import { describe, expect, test } from '@jest/globals';
import { buildNewSuggestionsEvent } from '../src/events/builders/newSuggestionsEvent.builder.js';
import { notificationsService } from '../src/services/notificationsService.js';
import { DOMAIN_EVENTS } from '../src/events/eventBus.js';


describe('buildNewSuggestionsEvent', () => {
  const suggestions = [
    {
      id: 'email-1',
      subject: 'First subject',
      suggestions: [
        { action: 'archive', classification: 'bulk', confidence_score: 0.8 },
        { action: 'delete', classification: 'stale_unread', confidence_score: 0.9 }
      ]
    },
    {
      id: 'email-2',
      subject: 'Second subject',
      suggestions: [
        { action: 'archive', classification: 'bulk', confidence_score: 0.8 }
      ]
    }
  ];

  test('creates a structured event with summary and timestamp', () => {
    const event = buildNewSuggestionsEvent({ userId: 'user-123', suggestions });

    expect(event).toMatchObject({
      type: DOMAIN_EVENTS.SUGGESTIONS_GENERATED,
      userId: 'user-123',
      suggestions
    });

    expect(event.summary.totalSuggestions).toBe(3);
    expect(event.summary.actionCounts).toMatchObject({ archive: 2, delete: 1 });
    expect(event.summary.classificationCounts).toMatchObject({ bulk: 2, stale_unread: 1 });
    expect(event.summary.sampledEmails).toEqual([
      {
        emailId: 'email-1',
        subject: 'First subject',
        suggestions: [
          { action: 'archive', classification: 'bulk', confidence_score: 0.8 },
          { action: 'delete', classification: 'stale_unread', confidence_score: 0.9 }
        ]
      },
      {
        emailId: 'email-2',
        subject: 'Second subject',
        suggestions: [
          { action: 'archive', classification: 'bulk', confidence_score: 0.8 }
        ]
      }
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
