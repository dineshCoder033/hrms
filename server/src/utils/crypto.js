const crypto = require('crypto');
const env = require('../config/env');

const KEY = Buffer.from(env.FIELD_ENCRYPTION_KEY, 'hex');

/**
 * AES-256-GCM authenticated encryption for sensitive fields (e.g. bank account numbers)
 */
const encrypt = (plain) => {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), enc].map((b) => b.toString('base64')).join('.');
};

/**
 * AES-256-GCM authenticated decryption
 */
const decrypt = (payload) => {
  if (!payload || typeof payload !== 'string' || !payload.includes('.')) return payload;
  try {
    const parts = payload.split('.');
    if (parts.length !== 3) return payload;
    const [iv, tag, enc] = parts.map((s) => Buffer.from(s, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return '***DECRYPTION_ERROR***';
  }
};

/**
 * Account number masking helper (e.g. XXXXXX1234)
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '';
  const str = String(accountNumber);
  if (str.length <= 4) return str;
  return `XXXXXX${str.slice(-4)}`;
};

module.exports = {
  encrypt,
  decrypt,
  maskAccountNumber
};

