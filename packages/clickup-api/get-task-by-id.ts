import { config as loadEnv } from 'dotenv';
import { getAuthorizedUser, getTask } from './src/index.js';

loadEnv();

async function main() {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error('Usage: tsx get-task-by-id.ts <task_id>');
    console.error('\nTo find a task_id:');
    console.error('1. Open a task in ClickUp');
    console.error('2. Look at the URL or click "Copy task link"');
    console.error('3. The task_id is in the format: 86...xyz (letters and numbers)');
    process.exit(1);
  }

  console.log('🔍 ClickUp Task Viewer\n');

  try {
    // Get user info
    console.log('👤 Getting user information...');
    const userResult = await getAuthorizedUser();
    console.log(`   User: ${userResult.user?.username}\n`);

    console.log(`📋 Getting task: ${taskId}...\n`);
    const task = await getTask(taskId);

    console.log('='.repeat(60));
    console.log(`📝 Task: ${task.name}`);
    console.log('='.repeat(60));
    console.log(`ID: ${task.id}`);
    console.log(`Status: ${task.status?.status || 'No status'}`);

    if (task.priority) {
      console.log(`Priority: ${task.priority.priority} (${task.priority.color})`);
    }

    if (task.description) {
      console.log(`\nDescription:`);
      console.log(task.description);
    }

    if (task.assignees && task.assignees.length > 0) {
      console.log(`\nAssignees:`);
      task.assignees.forEach(assignee => {
        console.log(`  - ${assignee.username || assignee.email}`);
      });
    }

    if (task.tags && task.tags.length > 0) {
      console.log(`\nTags: ${task.tags.map(t => t.name).join(', ')}`);
    }

    if (task.due_date) {
      const dueDate = new Date(parseInt(task.due_date));
      console.log(`\nDue Date: ${dueDate.toLocaleString('ja-JP')}`);
    }

    if (task.start_date) {
      const startDate = new Date(parseInt(task.start_date));
      console.log(`Start Date: ${startDate.toLocaleString('ja-JP')}`);
    }

    if (task.time_estimate) {
      const hours = Math.floor(parseInt(task.time_estimate) / 3600000);
      const minutes = Math.floor((parseInt(task.time_estimate) % 3600000) / 60000);
      console.log(`\nTime Estimate: ${hours}h ${minutes}m`);
    }

    if (task.time_spent) {
      const hours = Math.floor(parseInt(task.time_spent) / 3600000);
      const minutes = Math.floor((parseInt(task.time_spent) % 3600000) / 60000);
      console.log(`Time Spent: ${hours}h ${minutes}m`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Task retrieved successfully!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);

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
