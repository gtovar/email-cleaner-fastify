export async function getGoogleAccessToken({ models, email, logger }) {
  if (!email) {
    const err = new Error('Missing user email for token lookup');
    logger?.warn?.(err.message);
    throw err;
  }

  const Token = models?.Token;
  if (!Token) {
    const err = new Error('Token model not available');
    logger?.error?.(err.message);
    throw err;
  }

  const tokenRecord = await Token.findOne({ where: { email } });
  if (!tokenRecord?.access_token) {
    const err = new Error('No Google access token found for user');
    logger?.warn?.({ email }, err.message);
    throw err;
  }

  return tokenRecord.access_token;
}
