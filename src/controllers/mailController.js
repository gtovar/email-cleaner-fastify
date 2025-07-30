import { google } from 'googleapis';
import { suggestActions } from '../services/emailSuggester.js';


/**
 * Lista correos de Gmail aplicando filtros personalizados.
 */
export async function listEmails(req, reply) {
  const { unread, olderThan, category, minAttachmentSize, pageToken } = req.query;
  const user = req.user;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: user.googleAccessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  let query = [];
  if (unread) query.push('is:unread');
  if (olderThan) query.push(`older_than:${olderThan}d`);
  if (category) query.push(`category:${category}`);
  if (minAttachmentSize) query.push(`larger:${minAttachmentSize}M`);

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query.join(' '),
      pageToken,
      maxResults: 20,
    });

    const mails = await Promise.all(
      (res.data.messages || []).map(async (msg) => {
        const mail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
        const headers = mail.data.payload.headers;
        return {
          id: msg.id,
          subject: headers.find(h => h.name === 'Subject')?.value,
          from: headers.find(h => h.name === 'From')?.value,
          date: headers.find(h => h.name === 'Date')?.value,
          labels: mail.data.labelIds,
          isRead: !mail.data.labelIds.includes('UNREAD'), // necesario para sugerencias
          attachmentSizeMb: mail.data.sizeEstimate / (1024 * 1024),
          category: category || 'general', // fallback para testing
        };
      })
    );

    const mailsWithSuggestions = await suggestActions(mails);

    reply.send({
      mails: mailsWithSuggestions,
      nextPageToken: res.data.nextPageToken,
      total: res.data.resultSizeEstimate,
    });

  } catch (err) {
    req.log.error(err);
    reply.code(500).send({ error: 'No se pudo obtener los correos.' });
  }
}
