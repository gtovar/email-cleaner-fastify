import { google } from 'googleapis';
import { GmailService } from '../services/gmailService.js';
/**
 * Lista correos de Gmail aplicando filtros personalizados.
 */
export async function listEmails(req, reply) {
  const { unread, olderThan, category, minAttachmentSize, pageToken } = req.query;
  const user = req.user;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: user.googleAccessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const gmailService = new GmailService(gmail);

  let query = [];
  if (unread) query.push('is:unread');
  if (olderThan) query.push(`older_than:${olderThan}d`);
  if (category) query.push(`category:${category}`);
  if (minAttachmentSize) query.push(`larger:${minAttachmentSize}M`);

  try {
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
    reply.code(500).send({ error: 'No se pudo obtener los correos.' });
  }
}
