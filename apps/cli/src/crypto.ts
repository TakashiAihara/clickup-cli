import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { hostname, userInfo } from 'node:os';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

export interface EncryptedData {
  version: 1;
  salt: string;
  iv: string;
  tag: string;
  encrypted: string;
}

function getMachineId(): string {
  return `${hostname()}:${userInfo().username}`;
}

export function deriveKey(salt: Buffer): Buffer {
  return scryptSync(getMachineId(), salt, KEY_LENGTH);
}

export function encrypt(plaintext: string): EncryptedData {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    version: 1,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    encrypted: encrypted.toString('hex'),
  };
}

export function decrypt(data: EncryptedData): string {
  const salt = Buffer.from(data.salt, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const tag = Buffer.from(data.tag, 'hex');
  const encrypted = Buffer.from(data.encrypted, 'hex');

  const key = deriveKey(salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}
