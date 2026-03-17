import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
  saveToken,
  loadToken,
  removeToken,
  saveConfig,
  loadConfig,
  removeConfig,
  getToken,
  maskToken,
  migrateFromLegacy,
  paths,
} from './config.js';

describe('Config module (encrypted)', () => {
  describe('maskToken', () => {
    it('should mask middle of token', () => {
      expect(maskToken('pk_12345678abcd')).toBe('pk_1****abcd');
    });

    it('should fully mask short tokens', () => {
      expect(maskToken('short')).toBe('****');
    });
  });

  describe('saveToken / loadToken', () => {
    afterEach(() => {
      // Clean up test credentials
      if (existsSync(paths.CREDENTIALS_FILE)) {
        unlinkSync(paths.CREDENTIALS_FILE);
      }
    });

    it('should encrypt and save token, then load and decrypt', () => {
      const token = 'pk_test_encrypted_roundtrip';
      saveToken(token);

      const loaded = loadToken();
      expect(loaded).toBe(token);
    });

    it('should not store plaintext token in credentials file', () => {
      const token = 'pk_plaintext_check_secret';
      saveToken(token);

      const raw = readFileSync(paths.CREDENTIALS_FILE, 'utf-8');
      expect(raw).not.toContain(token);

      // Should contain encrypted data structure
      const data = JSON.parse(raw);
      expect(data.version).toBe(1);
      expect(data.salt).toBeDefined();
      expect(data.iv).toBeDefined();
      expect(data.tag).toBeDefined();
      expect(data.encrypted).toBeDefined();
    });

    it('should store credentials with 0600 permissions', () => {
      saveToken('pk_perms_test');

      if (process.platform !== 'win32') {
        const stats = statSync(paths.CREDENTIALS_FILE);
        const mode = (stats.mode & 0o777).toString(8);
        expect(mode).toBe('600');
      }
    });

    it('should return null when no credentials exist', () => {
      removeToken();
      expect(loadToken()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should prefer env var over stored token', () => {
      const envToken = process.env.CLICKUP_API_TOKEN;
      if (!envToken) return;
      expect(getToken()).toBe(envToken);
    });
  });

  describe('migrateFromLegacy', () => {
    const legacyDir = paths.LEGACY_CONFIG_DIR;
    const legacyFile = paths.LEGACY_CONFIG_FILE;

    afterEach(() => {
      // Clean up legacy and new files
      try { unlinkSync(legacyFile); } catch {}
      try { rmSync(legacyDir, { recursive: true }); } catch {}
      try { unlinkSync(paths.CREDENTIALS_FILE); } catch {}
      try { unlinkSync(paths.CONFIG_FILE); } catch {}
    });

    it('should migrate token from legacy config', () => {
      // Create legacy config
      mkdirSync(legacyDir, { recursive: true });
      writeFileSync(legacyFile, JSON.stringify({ token: 'pk_legacy_token' }));

      const migrated = migrateFromLegacy();
      expect(migrated).toBe(true);

      // Token should be encrypted in new location
      const token = loadToken();
      expect(token).toBe('pk_legacy_token');

      // Legacy file should be removed
      expect(existsSync(legacyFile)).toBe(false);
    });

    it('should return false when no legacy config exists', () => {
      expect(migrateFromLegacy()).toBe(false);
    });
  });

  describe('AppConfig (non-sensitive)', () => {
    afterEach(() => {
      try { unlinkSync(paths.CONFIG_FILE); } catch {}
    });

    it('should save and load non-sensitive config', () => {
      saveConfig({ output_format: 'json', default_list_id: '12345' });
      const config = loadConfig();
      expect(config.output_format).toBe('json');
      expect(config.default_list_id).toBe('12345');
    });

    it('should not contain token in config file', () => {
      saveConfig({ output_format: 'table' });
      const raw = readFileSync(paths.CONFIG_FILE, 'utf-8');
      expect(raw).not.toContain('token');
    });
  });
});
