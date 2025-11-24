#!/usr/bin/env node
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

console.log('🔍 Quick API Test\n');
console.log('Environment variable check:');
console.log(`CLICKUP_API_TOKEN: ${process.env.CLICKUP_API_TOKEN ? '✓ Set (' + process.env.CLICKUP_API_TOKEN.substring(0, 15) + '...)' : '✗ Not set'}\n`);

// Test with the built client
import {
  setAccessToken,
  getAccessToken,
  getAuthorizedUser,
  getAuthorizedTeams,
} from './dist/index.js';

console.log('Token from getAccessToken():', getAccessToken() ? '✓ Set' : '✗ Not set');

if (!process.env.CLICKUP_API_TOKEN) {
  console.error('\n❌ CLICKUP_API_TOKEN not found in environment');
  console.log('Please set it in .env file');
  process.exit(1);
}

console.log('\n📡 Testing ClickUp API...\n');

try {
  // Test 1: Get authorized user
  console.log('1. Getting authorized user...');
  const userResult = await getAuthorizedUser();
  console.log(`   ✓ Success!`);
  console.log(`   User: ${userResult.user?.username || 'N/A'}`);
  console.log(`   Email: ${userResult.user?.email || 'N/A'}`);
  console.log(`   ID: ${userResult.user?.id || 'N/A'}\n`);

  // Test 2: Get workspaces
  console.log('2. Getting workspaces...');
  const teamsResult = await getAuthorizedTeams();
  console.log(`   ✓ Success!`);
  console.log(`   Workspaces found: ${teamsResult.teams?.length || 0}`);

  if (teamsResult.teams && teamsResult.teams.length > 0) {
    teamsResult.teams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
    });
  }

  console.log('\n✅ All API tests passed!');
  console.log('\nThe ClickUp API client is working correctly.');

} catch (error) {
  console.error('\n❌ API test failed:');
  console.error(`   Error: ${error.message}`);

  if (error.response) {
    console.error(`   Status: ${error.response.status}`);
    console.error(`   Status Text: ${error.response.statusText}`);

    if (error.response.status === 401) {
      console.error('\n💡 This looks like an authentication error.');
      console.error('   Please check that your CLICKUP_API_TOKEN is valid.');
      console.error('   You can generate a new token at: https://app.clickup.com/settings/apps');
    }
  }

  process.exit(1);
}
