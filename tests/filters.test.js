import { describe, test, expect } from '@jest/globals';
import { buildGmailQuery } from '../src/utils/filters.js';

describe('buildGmailQuery', () => {
  test('combines unread and category filters', () => {
    const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
    expect(q).toBe('is:unread category:promotions');
  });

  test('returns trimmed string without optional filters', () => {
    const q = buildGmailQuery({});
    expect(q).toBe('');
  });
});
