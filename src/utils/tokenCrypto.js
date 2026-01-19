import crypto from 'crypto';

const PREFIX = 'v1';
const IV_BYTES = 12;

function getKey() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded)');
  }
  return key;
}

export function encryptToken(value) {
  if (!value) return value;
  const key = getKey();
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  }
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64')
  ].join(':');
}

export function decryptToken(value) {
  if (!value) return value;
  const str = String(value);
  if (!str.startsWith(`${PREFIX}:`)) {
    return str;
  }
  const key = getKey();
  if (!key) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  }
  const [, ivB64, tagB64, dataB64] = str.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted token format');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
