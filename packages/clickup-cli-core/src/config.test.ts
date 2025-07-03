import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { ConfigManager } from './config.js';

vi.mock('fs');
vi.mock('os');
vi.mock('path');

const mockedReadFileSync = vi.mocked(readFileSync);
const mockedWriteFileSync = vi.mocked(writeFileSync);
const mockedExistsSync = vi.mocked(existsSync);
const mockedMkdirSync = vi.mocked(mkdirSync);
const mockedHomedir = vi.mocked(homedir);
const mockedJoin = vi.mocked(join);

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedHomedir.mockReturnValue('/home/user');
    mockedJoin.mockImplementation((...args) => args.join('/'));
    mockedExistsSync.mockReturnValue(true);
    configManager = new ConfigManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set up config directory paths', () => {
      expect(mockedHomedir).toHaveBeenCalled();
      expect(mockedJoin).toHaveBeenCalledWith('/home/user', '.clickup-cli');
      expect(mockedJoin).toHaveBeenCalledWith('/home/user/.clickup-cli', 'config.json');
    });

    it('should create config directory if it does not exist', () => {
      mockedExistsSync.mockReturnValue(false);
      new ConfigManager();
      
      expect(mockedMkdirSync).toHaveBeenCalledWith('/home/user/.clickup-cli', { recursive: true });
    });

    it('should not create config directory if it already exists', () => {
      mockedExistsSync.mockReturnValue(true);
      new ConfigManager();
      
      expect(mockedMkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should return empty config if file does not exist', () => {
      mockedExistsSync.mockReturnValue(false);
      
      const result = configManager.load();
      
      expect(result).toEqual({});
    });

    it('should load config from file', () => {
      mockedExistsSync.mockReturnValue(true);
      const mockConfig = { accessToken: 'test-token', defaultTeamId: 'team-123' };
      mockedReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
      
      const result = configManager.load();
      
      expect(mockedReadFileSync).toHaveBeenCalledWith('/home/user/.clickup-cli/config.json', 'utf-8');
      expect(result).toEqual(mockConfig);
    });

    it('should return empty config if JSON parsing fails', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = configManager.load();
      
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load config:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('should save config to file', () => {
      const config = { accessToken: 'test-token', defaultTeamId: 'team-123' };
      
      configManager.save(config);
      
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/home/user/.clickup-cli/config.json',
        JSON.stringify(config, null, 2)
      );
    });

    it('should throw error if save fails', () => {
      const config = { accessToken: 'test-token' };
      const error = new Error('Write failed');
      mockedWriteFileSync.mockImplementation(() => { throw error; });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => configManager.save(config)).toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save config:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('should merge updates with existing config', () => {
      const existingConfig = { accessToken: 'old-token', defaultTeamId: 'team-123' };
      const updates = { accessToken: 'new-token', defaultSpaceId: 'space-456' };
      
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(existingConfig));
      mockedWriteFileSync.mockImplementation(() => {});
      
      configManager.update(updates);
      
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/home/user/.clickup-cli/config.json',
        JSON.stringify({
          accessToken: 'new-token',
          defaultTeamId: 'team-123',
          defaultSpaceId: 'space-456',
        }, null, 2)
      );
    });
  });

  describe('get', () => {
    it('should return specific config value', () => {
      const config = { accessToken: 'test-token', defaultTeamId: 'team-123' };
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(config));
      
      const result = configManager.get('accessToken');
      
      expect(result).toBe('test-token');
    });

    it('should return undefined for non-existent key', () => {
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue('{}');
      
      const result = configManager.get('accessToken');
      
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set a single config value', () => {
      const existingConfig = { defaultTeamId: 'team-123' };
      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValue(JSON.stringify(existingConfig));
      mockedWriteFileSync.mockImplementation(() => {});
      
      configManager.set('accessToken', 'new-token');
      
      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        '/home/user/.clickup-cli/config.json',
        JSON.stringify({
          defaultTeamId: 'team-123',
          accessToken: 'new-token',
        }, null, 2)
      );
    });
  });
});