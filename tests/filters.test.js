import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGmailQuery } from '../src/utils/filters.js';

test('buildGmailQuery with unread and category', () => {
  const q = buildGmailQuery({ unread: 'true', category: 'promotions' });
  assert.equal(q, 'is:unread category:promotions');
});
