import { fixtureInboxSource } from './fixtureInboxSource.js';
import { gmailInboxSource } from './gmailInboxSource.js';

export function resolveInboxSource({ logger } = {}) {
  const mode = process.env.INBOX_SOURCE || 'gmail';

  if (mode === 'fixture') {
    logger?.info?.({ inboxSource: mode }, 'Using fixture inbox source');
    return fixtureInboxSource;
  }

  if (mode !== 'gmail') {
    logger?.warn?.({ inboxSource: mode }, 'Unknown INBOX_SOURCE; falling back to gmail');
  }

  return gmailInboxSource;
}
