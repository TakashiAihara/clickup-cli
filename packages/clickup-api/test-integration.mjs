#!/usr/bin/env node
import { config as loadEnv } from 'dotenv';
import {
  setAccessToken,
  getAccessToken,
  getAuthorizedUser,
  getAuthorizedTeams,
  customAxiosInstance,
} from './dist/index.js';

// Load environment variables
loadEnv();

console.log('🧪 ClickUp API Integration Tests\n');
console.log('='.repeat(50));

const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
};

function test(name, fn) {
  return async () => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      results.passed++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
      results.failed++;
    }
  };
}

function skip(name, reason) {
  console.log(`⊘ ${name} (${reason})`);
  results.skipped++;
}

// Main test suite
async function runTests() {
  console.log('\n📋 Token Management Tests\n');

  // Test 1: Read token from environment
  await test('Should read token from environment variable', () => {
    const token = getAccessToken();
    if (process.env.CLICKUP_API_TOKEN) {
      if (token !== process.env.CLICKUP_API_TOKEN) {
        throw new Error('Token mismatch');
      }
    } else {
      console.log('  Info: CLICKUP_API_TOKEN not set');
    }
  })();

  // Test 2: Set token programmatically
  await test('Should set token programmatically', () => {
    const originalToken = getAccessToken();
    const testToken = 'test_token_123';

    setAccessToken(testToken);
    const newToken = getAccessToken();

    if (newToken !== testToken) {
      throw new Error('Token was not set correctly');
    }

    // Restore
    if (originalToken) {
      setAccessToken(originalToken);
    }
  })();

  console.log('\n📋 Authentication Tests\n');

  const apiToken = getAccessToken();

  if (!apiToken) {
    skip('API authentication tests', 'No API token available');
    console.log('\n💡 Set CLICKUP_API_TOKEN in .env to run authentication tests');
  } else {
    // Test 3: Get authorized user
    await test('Should get authorized user', async () => {
      const result = await getAuthorizedUser();
      if (!result || !result.user) {
        throw new Error('No user data returned');
      }
      if (!result.user.id || !result.user.username) {
        throw new Error('User data incomplete');
      }
      console.log(`  User: ${result.user.username} (ID: ${result.user.id})`);
    })();

    // Test 4: Get authorized workspaces
    await test('Should get authorized workspaces', async () => {
      const result = await getAuthorizedTeams();
      if (!result || !result.teams) {
        throw new Error('No teams data returned');
      }
      if (!Array.isArray(result.teams)) {
        throw new Error('Teams is not an array');
      }
      console.log(`  Workspaces found: ${result.teams.length}`);
      if (result.teams.length > 0) {
        console.log(`  First workspace: ${result.teams[0].name}`);
      }
    })();
  }

  console.log('\n📋 Generated Client Tests\n');

  // Test 5: Exports
  await test('Should export customAxiosInstance', () => {
    if (typeof customAxiosInstance !== 'function') {
      throw new Error('customAxiosInstance is not a function');
    }
  })();

  await test('Should export getAuthorizedUser', () => {
    if (typeof getAuthorizedUser !== 'function') {
      throw new Error('getAuthorizedUser is not a function');
    }
  })();

  await test('Should export getAuthorizedTeams', () => {
    if (typeof getAuthorizedTeams !== 'function') {
      throw new Error('getAuthorizedTeams is not a function');
    }
  })();

  console.log('\n📋 Error Handling Tests\n');

  // Test 6: Invalid token
  await test('Should reject invalid token', async () => {
    const originalToken = getAccessToken();
    setAccessToken('invalid_token_xyz');

    try {
      await getAuthorizedUser();
      throw new Error('Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error('Expected 401 status code');
      }
    } finally {
      if (originalToken) {
        setAccessToken(originalToken);
      }
    }
  })();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary\n');
  console.log(`✓ Passed:  ${results.passed}`);
  console.log(`✗ Failed:  ${results.failed}`);
  console.log(`⊘ Skipped: ${results.skipped}`);
  console.log(`━ Total:   ${results.passed + results.failed + results.skipped}\n`);

  if (results.failed > 0) {
    console.log('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Build first if needed
import { existsSync } from 'fs';
if (!existsSync('./dist/index.js')) {
  console.error('❌ Build output not found. Run `pnpm build` first.');
  process.exit(1);
}

runTests().catch((error) => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
