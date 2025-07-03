import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface Config {
  accessToken?: string;
  defaultTeamId?: string;
  defaultSpaceId?: string;
}

export class ConfigManager {
  private configDir: string;
  private configPath: string;

  constructor() {
    this.configDir = join(homedir(), '.clickup-cli');
    this.configPath = join(this.configDir, 'config.json');
    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
  }

  load(): Config {
    if (!existsSync(this.configPath)) {
      return {};
    }
    
    try {
      const content = readFileSync(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load config:', error);
      return {};
    }
  }

  save(config: Config): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  update(updates: Partial<Config>): void {
    const current = this.load();
    const updated = { ...current, ...updates };
    this.save(updated);
  }

  get(key: keyof Config): string | undefined {
    const config = this.load();
    return config[key];
  }

  set(key: keyof Config, value: string): void {
    this.update({ [key]: value });
  }
}