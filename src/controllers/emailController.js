import { resolveInboxSource } from '../services/inboxSources/index.js';
/**
 * Lista correos desde la fuente configurada para Inbox.
 */
export async function listEmails(req, reply) {
  const { unread, olderThan, category, minAttachmentSize, pageToken } = req.query;
  const user = req.user;

  try {
    const inboxSource = resolveInboxSource({ logger: req.log });
    const { emails, nextPageToken, total } = await inboxSource.listEmails({
      server: req.server,
      email: user?.email,
      unread,
      olderThan,
      category,
      minAttachmentSize,
      pageToken,
      maxResults: 20,
    });

    reply.send({
      emails,
      nextPageToken,
      total,
    });
  } catch (err) {
    req.log.error(err);
    reply.code(500).send({ error: 'Failed to fetch emails.' });
  }
}

export async function getEmailContent(req, reply) {
  try {
    const inboxSource = resolveInboxSource({ logger: req.log });
    const content = await inboxSource.getEmailContent({
      server: req.server,
      email: req.user?.email,
      emailId: req.params?.id,
    });

    if (!content) {
      return reply.code(404).send({ error: 'Email content not found' });
    }

    return reply.send(content);
  } catch (err) {
    req.log.error(err);
    return reply.code(500).send({ error: 'Failed to fetch email content.' });
  }
}
