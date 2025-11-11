// src/tests/filters.test.js
import { buildGmailQuery } from '../src/utils/filters.js';

test('buildGmailQuery with unread and category', () => {
  const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
  expect(q).toBe('is:unread category:promotions');
});
