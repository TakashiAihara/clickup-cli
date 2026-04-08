import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { encrypt, decrypt, type EncryptedData } from './crypto.js';
import { CliError, ExitCodes } from './utils/errors.js';

// XDG-compliant config directory
const CONFIG_DIR = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, 'clickup-cli')
  : join(homedir(), '.config', 'clickup-cli');

const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.json');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// Legacy paths (for migration)
const LEGACY_CONFIG_DIR = join(homedir(), '.clickup-cli');
const LEGACY_CONFIG_FILE = join(LEGACY_CONFIG_DIR, 'config.json');

export interface AppConfig {
  default_list_id?: string;
  output_format?: 'table' | 'json';
  allowedTeamIds?: string[];
  allowedSpaceIds?: string[];
}

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

// --- Token (encrypted) ---

export function saveToken(token: string): void {
  ensureConfigDir();
  const encrypted = encrypt(token);
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(encrypted, null, 2), { mode: 0o600 });
}

export function loadToken(): string | null {
  if (!existsSync(CREDENTIALS_FILE)) {
    return null;
  }
  try {
    const raw = readFileSync(CREDENTIALS_FILE, 'utf-8');
    const data: EncryptedData = JSON.parse(raw);
    return decrypt(data);
  } catch {
    return null;
  }
}

export function removeToken(): void {
  if (existsSync(CREDENTIALS_FILE)) {
    unlinkSync(CREDENTIALS_FILE);
  }
}

// --- Config (non-sensitive) ---

export function loadConfig(): AppConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as AppConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: AppConfig): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function removeConfig(): void {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
  }
  removeToken();
}

// --- Migration ---

export function migrateFromLegacy(): boolean {
  if (!existsSync(LEGACY_CONFIG_FILE)) {
    return false;
  }

  try {
    const raw = readFileSync(LEGACY_CONFIG_FILE, 'utf-8');
    const legacy = JSON.parse(raw);

    if (legacy.token) {
      saveToken(legacy.token);
    }

    // Migrate non-token settings
    const config: AppConfig = {};
    if (legacy.default_list_id) config.default_list_id = legacy.default_list_id;
    if (legacy.output_format) config.output_format = legacy.output_format;
    if (Object.keys(config).length > 0) {
      saveConfig(config);
    }

    // Remove legacy files
    unlinkSync(LEGACY_CONFIG_FILE);
    try {
      rmSync(LEGACY_CONFIG_DIR, { recursive: true });
    } catch {
      // Directory may not be empty or already removed
    }

    console.error('Migrated config from ~/.clickup-cli/ to ~/.config/clickup-cli/');
    return true;
  } catch {
    return false;
  }
}

// --- Token resolution ---

export function getToken(): string | undefined {
  // Env var takes precedence
  if (process.env.CLICKUP_API_TOKEN) {
    return process.env.CLICKUP_API_TOKEN;
  }

  // Try encrypted credentials
  const token = loadToken();
  if (token) return token;

  // Try legacy migration
  if (migrateFromLegacy()) {
    return loadToken() ?? undefined;
  }

  return undefined;
}

export function maskToken(token: string): string {
  if (token.length <= 8) return '****';
  return token.slice(0, 4) + '****' + token.slice(-4);
}

// --- Access restriction ---

export function checkTeamAccess(teamId: string): void {
  const config = loadConfig();
  if (config.allowedTeamIds && config.allowedTeamIds.length > 0) {
    if (!config.allowedTeamIds.includes(teamId)) {
      throw new CliError(
        `Access restricted: team ${teamId} is not in allowedTeamIds. Allowed: ${config.allowedTeamIds.join(', ')}`,
        'ACCESS_RESTRICTED',
        ExitCodes.ACCESS_RESTRICTED,
      );
    }
  }
}

export function checkSpaceAccess(spaceId: string): void {
  const config = loadConfig();
  if (config.allowedSpaceIds && config.allowedSpaceIds.length > 0) {
    if (!config.allowedSpaceIds.includes(spaceId)) {
      throw new CliError(
        `Access restricted: space ${spaceId} is not in allowedSpaceIds. Allowed: ${config.allowedSpaceIds.join(', ')}`,
        'ACCESS_RESTRICTED',
        ExitCodes.ACCESS_RESTRICTED,
      );
    }
  }
}

// Re-export paths for testing
export const paths = {
  CONFIG_DIR,
  CREDENTIALS_FILE,
  CONFIG_FILE,
  LEGACY_CONFIG_DIR,
  LEGACY_CONFIG_FILE,
} as const;
