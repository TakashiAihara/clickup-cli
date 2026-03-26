import { describe, it, expect } from 'vitest';

import { encrypt, decrypt, type EncryptedData } from './crypto.js';

describe('crypto', () => {
  it('should encrypt and decrypt a token (roundtrip)', () => {
    const token = 'pk_12345678_abcdefghijklmnop';
    const encrypted = encrypt(token);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(token);
  });

  it('should produce different ciphertext each time (random salt/iv)', () => {
    const token = 'pk_test_token';
    const e1 = encrypt(token);
    const e2 = encrypt(token);
    expect(e1.encrypted).not.toBe(e2.encrypted);
    expect(e1.salt).not.toBe(e2.salt);
    expect(e1.iv).not.toBe(e2.iv);
  });

  it('should not contain plaintext in encrypted output', () => {
    const token = 'pk_supersecret_value';
    const encrypted = encrypt(token);
    const json = JSON.stringify(encrypted);
    expect(json).not.toContain(token);
  });

  it('should detect tampered ciphertext', () => {
    const token = 'pk_tamper_test';
    const encrypted = encrypt(token);

    // Flip a byte in encrypted data
    const tampered: EncryptedData = {
      ...encrypted,
      encrypted: encrypted.encrypted.slice(0, -2) + 'ff',
    };

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should detect tampered auth tag', () => {
    const token = 'pk_tag_test';
    const encrypted = encrypt(token);

    const tampered: EncryptedData = {
      ...encrypted,
      tag: '00'.repeat(16),
    };

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should set version to 1', () => {
    const encrypted = encrypt('test');
    expect(encrypted.version).toBe(1);
  });

  it('should handle empty string', () => {
    const encrypted = encrypt('');
    expect(decrypt(encrypted)).toBe('');
  });

  it('should handle long tokens', () => {
    const token = 'pk_' + 'a'.repeat(1000);
    const encrypted = encrypt(token);
    expect(decrypt(encrypted)).toBe(token);
  });
});
