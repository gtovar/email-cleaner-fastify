// src/tests/filters.test.js
const { buildGmailQuery } = require('../utils/filters');

test('buildGmailQuery with unread and category', () => {
  const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
  expect(q).toBe('is:unread category:promotions');
});
