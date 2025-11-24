import { config as loadEnv } from 'dotenv';
import { getAuthorizedUser, updateTask } from './src/index.js';

loadEnv();

async function main() {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error('Usage: tsx complete-task.ts <task_id>');
    process.exit(1);
  }

  console.log('✅ ClickUp Task Completer\n');

  try {
    // Get user info
    console.log('👤 Getting user information...');
    const userResult = await getAuthorizedUser();
    console.log(`   User: ${userResult.user?.username}\n`);

    console.log(`📝 Completing task: ${taskId}...\n`);

    const result = await updateTask(taskId, {
      status: 'complete'
    });

    console.log('='.repeat(60));
    console.log(`✅ Task completed: ${result.name}`);
    console.log('='.repeat(60));
    console.log(`Status: ${result.status?.status}`);
    console.log('\n✅ Task marked as complete!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);

      if (error.response.data) {
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      }

      if (error.response.status === 401) {
        console.error('\n💡 Authentication error. Check your CLICKUP_API_TOKEN.');
      } else if (error.response.status === 404) {
        console.error('\n💡 Task not found.');
        console.error('   Make sure the task_id is correct and you have access to it.');
      }
    }

    process.exit(1);
  }
}

main();
