import { config as loadEnv } from 'dotenv';
import { getAuthorizedUser } from './src/index.js';

loadEnv();

async function main() {
  console.log('🔍 Inspecting User Data\n');

  try {
    const result = await getAuthorizedUser();
    console.log('Full user response:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
