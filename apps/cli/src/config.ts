import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.clickup-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config {
  token: string;
  team_id?: string;
  default_list_id?: string;
  output_format?: 'table' | 'json';
}

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as Config;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function removeConfig(): void {
  if (existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
  }
}

export function getToken(): string | undefined {
  // Env var takes precedence
  if (process.env.CLICKUP_API_TOKEN) {
    return process.env.CLICKUP_API_TOKEN;
  }
  return loadConfig()?.token;
}

export function maskToken(token: string): string {
  if (token.length <= 8) return '****';
  return token.slice(0, 4) + '****' + token.slice(-4);
}
