import { GmailService } from '../services/gmailService.js';
import { getGmailClientForUser } from '../services/googleAuthService.js';
/**
 * Lista correos de Gmail aplicando filtros personalizados.
 */
export async function listEmails(req, reply) {
  const { unread, olderThan, category, minAttachmentSize, pageToken } = req.query;
  const user = req.user;

  try {
    const gmailClient = await getGmailClientForUser(req.server, user?.email);
    const gmailService = new GmailService(gmailClient);

  let query = [];
  if (unread) query.push('is:unread');
  if (olderThan) query.push(`older_than:${olderThan}d`);
  if (category) query.push(`category:${category}`);
  if (minAttachmentSize) query.push(`larger:${minAttachmentSize}M`);

    const { emails, nextPageToken, total } = await gmailService.listMessagesByQuery({
      query: query.join(' '),
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
