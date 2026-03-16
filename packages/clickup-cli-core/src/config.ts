import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface Config {
  accessToken?: string;
  defaultTeamId?: string;
  defaultSpaceId?: string;
}

const configDir = join(homedir(), '.clickup-cli');
const configPath = join(configDir, 'config.json');

function ensureConfigDir(): void {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir(); // Ensure directory exists before trying to read
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load config:', error);
    return {};
  }
}

export function saveConfig(config: Config): void {
  ensureConfigDir(); // Ensure directory exists before trying to write
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

export function updateConfig(updates: Partial<Config>): void {
  const current = loadConfig();
  const updated = { ...current, ...updates };
  saveConfig(updated);
}

export function getConfigValue(key: keyof Config): string | undefined {
  const config = loadConfig();
  return config[key];
}

export function setConfigValue(key: keyof Config, value: string): void {
  updateConfig({ [key]: value });
}
