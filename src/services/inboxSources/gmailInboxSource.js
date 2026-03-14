import { GmailService } from '../gmailService.js';
import { getGmailClientForUser } from '../googleAuthService.js';

const buildQuery = ({ unread, olderThan, category, minAttachmentSize }) => {
  const query = [];
  if (unread) query.push('is:unread');
  if (olderThan) query.push(`older_than:${olderThan}d`);
  if (category) query.push(`category:${category}`);
  if (minAttachmentSize) query.push(`larger:${minAttachmentSize}M`);
  return query.join(' ');
};

export const gmailInboxSource = {
  async listEmails({ server, email, unread, olderThan, category, minAttachmentSize, pageToken, maxResults }) {
    const gmailClient = await getGmailClientForUser(server, email);
    const gmailService = new GmailService(gmailClient);

    return gmailService.listMessagesByQuery({
      query: buildQuery({ unread, olderThan, category, minAttachmentSize }),
      pageToken,
      maxResults,
    });
  },
};
