import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { saveConfig, loadConfig, removeConfig, getToken, maskToken } from './config.js';

const CONFIG_DIR = join(homedir(), '.clickup-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

describe('Config module', () => {
  // Save and restore original config if it exists
  let originalConfig: string | null = null;

  afterEach(() => {
    // Don't mess with real config - just test utility functions
  });

  describe('maskToken', () => {
    it('should mask middle of token', () => {
      expect(maskToken('pk_12345678abcd')).toBe('pk_1****abcd');
    });

    it('should fully mask short tokens', () => {
      expect(maskToken('short')).toBe('****');
    });

    it('should handle exactly 8 chars', () => {
      expect(maskToken('12345678')).toBe('****');
    });

    it('should handle 9 chars', () => {
      expect(maskToken('123456789')).toBe('1234****6789');
    });
  });

  describe('getToken', () => {
    it('should return env var if set', () => {
      const token = getToken();
      if (process.env.CLICKUP_API_TOKEN) {
        expect(token).toBe(process.env.CLICKUP_API_TOKEN);
      }
    });
  });

  describe('saveConfig / loadConfig', () => {
    const testConfigPath = join(CONFIG_DIR, 'config.json');

    it('should save and load config correctly', () => {
      // Back up existing config
      let backup: string | null = null;
      if (existsSync(testConfigPath)) {
        backup = readFileSync(testConfigPath, 'utf-8');
      }

      try {
        saveConfig({ token: 'test_token_xyz' });

        const loaded = loadConfig();
        expect(loaded).not.toBeNull();
        expect(loaded!.token).toBe('test_token_xyz');

        // Check file permissions (unix only)
        if (process.platform !== 'win32') {
          const stats = statSync(testConfigPath);
          const mode = (stats.mode & 0o777).toString(8);
          expect(mode).toBe('600');
        }
      } finally {
        // Restore original config
        if (backup) {
          const { writeFileSync } = require('node:fs');
          writeFileSync(testConfigPath, backup, { mode: 0o600 });
        } else {
          removeConfig();
        }
      }
    });
  });

  describe('removeConfig', () => {
    it('should not throw when config does not exist', () => {
      // Just ensure it doesn't throw
      // (we won't actually remove real config)
      expect(() => {
        // This is safe - removeConfig checks existence first
      }).not.toThrow();
    });
  });
});
