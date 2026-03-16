import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { loadConfig, saveConfig, updateConfig, getConfigValue, setConfigValue } from './config.js';

const mockConfigDir = join(homedir(), '.test-clickup-cli');
const mockConfigPath = join(mockConfigDir, 'config.json');

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmSync: vi.fn(),
  };
});

describe('Config functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(mkdirSync).mockReturnValue(undefined);
    vi.mocked(rmSync).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create config directory if it does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    loadConfig(); // Call any function that triggers ensureConfigDir
    expect(mkdirSync).toHaveBeenCalledWith(mockConfigDir, { recursive: true });
  });

  it('should not create config directory if it already exists', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    loadConfig(); // Call any function that triggers ensureConfigDir
    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it('should load config from file if it exists', () => {
    const mockConfig = { accessToken: 'test-token' };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
    const result = loadConfig();
    expect(result).toEqual(mockConfig);
    expect(readFileSync).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
  });

  it('should return empty object if config file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const result = loadConfig();
    expect(result).toEqual({});
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it('should return empty object and log error if config file is invalid', () => {
    vi.mocked(readFileSync).mockReturnValue('invalid json');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = loadConfig();
    expect(result).toEqual({});
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load config:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should save config to file', () => {
    const config = { accessToken: 'new-token' };
    saveConfig(config);
    expect(writeFileSync).toHaveBeenCalledWith(mockConfigPath, JSON.stringify(config, null, 2));
  });

  it('should throw error if saving config fails', () => {
    const config = { accessToken: 'new-token' };
    const error = new Error('Write failed');
    vi.mocked(writeFileSync).mockImplementation(() => { throw error; });
    expect(() => saveConfig(config)).toThrow(error);
    expect(writeFileSync).toHaveBeenCalledWith(mockConfigPath, JSON.stringify(config, null, 2));
  });

  it('should update existing config', () => {
    const initialConfig = { accessToken: 'old-token', defaultTeamId: 'team1' };
    const updates = { accessToken: 'new-token' };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(initialConfig));
    updateConfig(updates);
    expect(writeFileSync).toHaveBeenCalledWith(mockConfigPath, JSON.stringify({ ...initialConfig, ...updates }, null, 2));
  });

  it('should get a specific config value', () => {
    const mockConfig = { accessToken: 'test-token' };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
    const result = getConfigValue('accessToken');
    expect(result).toBe('test-token');
  });

  it('should return undefined for non-existent config value', () => {
    const mockConfig = { defaultTeamId: 'team1' };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));
    const result = getConfigValue('accessToken');
    expect(result).toBeUndefined();
  });

  it('should set a specific config value', () => {
    const initialConfig = { accessToken: 'old-token' };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(initialConfig));
    setConfigValue('accessToken', 'new-token');
    expect(writeFileSync).toHaveBeenCalledWith(mockConfigPath, JSON.stringify({ accessToken: 'new-token' }, null, 2));
  });
});
