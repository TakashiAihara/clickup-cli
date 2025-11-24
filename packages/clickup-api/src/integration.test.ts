import { describe, it, expect, beforeAll } from 'vitest';
import { config as loadEnv } from 'dotenv';
import {
  setAccessToken,
  getAccessToken,
  getAuthorizedUser,
  getAuthorizedTeams,
} from './index.js';

// Load environment variables
loadEnv();

describe('ClickUp API Integration Tests', () => {
  beforeAll(() => {
    const token = process.env.CLICKUP_API_TOKEN;
    if (!token) {
      console.warn('⚠️  CLICKUP_API_TOKEN not found in environment variables');
      console.warn('⚠️  Set CLICKUP_API_TOKEN in .env file to run integration tests');
    }
  });

  describe('Token Management', () => {
    it('should read token from environment variable', () => {
      const token = getAccessToken();
      console.log('Token available:', token ? '✓' : '✗');

      if (process.env.CLICKUP_API_TOKEN) {
        expect(token).toBe(process.env.CLICKUP_API_TOKEN);
      } else {
        console.log('Info: CLICKUP_API_TOKEN not set in environment');
        expect(token).toBeUndefined();
      }
    });

    it('should allow setting token programmatically', () => {
      const originalToken = getAccessToken();
      const testToken = 'test_token_12345';

      setAccessToken(testToken);
      const newToken = getAccessToken();

      expect(newToken).toBe(testToken);
      console.log('✓ Token set programmatically');

      // Restore original token
      if (originalToken) {
        setAccessToken(originalToken);
      }
    });
  });

  describe('Authentication Endpoints', () => {
    it('should get authorized user information', async () => {
      const token = getAccessToken();

      if (!token) {
        console.warn('Skipping: No API token available');
        return;
      }

      try {
        const result = await getAuthorizedUser();
        console.log('✓ User authenticated:', result.user?.username || result.user?.email);

        expect(result).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('username');
        expect(result.user).toHaveProperty('email');
      } catch (error: any) {
        console.error('✗ Authentication failed:', error.message);
        if (error.response?.status === 401) {
          console.error('  Invalid API token. Please check CLICKUP_API_TOKEN in .env');
        }
        throw error;
      }
    }, 10000);

    it('should get authorized workspaces', async () => {
      const token = getAccessToken();

      if (!token) {
        console.warn('Skipping: No API token available');
        return;
      }

      try {
        const result = await getAuthorizedTeams();
        console.log('✓ Workspaces found:', result.teams?.length || 0);

        expect(result).toBeDefined();
        expect(result.teams).toBeDefined();
        expect(Array.isArray(result.teams)).toBe(true);

        if (result.teams && result.teams.length > 0) {
          const firstTeam = result.teams[0];
          console.log('  First workspace:', firstTeam.name);
          expect(firstTeam).toHaveProperty('id');
          expect(firstTeam).toHaveProperty('name');
        }
      } catch (error: any) {
        console.error('✗ Failed to get workspaces:', error.message);
        throw error;
      }
    }, 10000);
  });

  describe('Generated Client Functionality', () => {
    it('should have customAxiosInstance function exported', async () => {
      const { customAxiosInstance } = await import('./index.js');
      expect(customAxiosInstance).toBeDefined();
      expect(typeof customAxiosInstance).toBe('function');
    });

    it('should export generated API clients', async () => {
      const apiModule = await import('./index.js');

      // Check that generated functions are exported
      expect(apiModule.getAuthorizedUser).toBeDefined();
      expect(apiModule.getAuthorizedTeams).toBeDefined();

      console.log('✓ Generated API clients exported successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid token gracefully', async () => {
      const originalToken = getAccessToken();
      setAccessToken('invalid_token_xyz');

      try {
        await getAuthorizedUser();
        // If we get here, the token might be valid somehow
        console.warn('Expected authentication to fail with invalid token');
      } catch (error: any) {
        console.log('✓ Invalid token rejected as expected');
        expect(error).toBeDefined();
        expect(error.response?.status).toBe(401);
      } finally {
        // Restore original token
        if (originalToken) {
          setAccessToken(originalToken);
        }
      }
    }, 10000);
  });
});
