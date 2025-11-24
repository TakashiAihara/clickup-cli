import { config as loadEnv } from 'dotenv';
import { getAuthorizedUser, getTasks } from './src/index.js';

loadEnv();

async function main() {
  const listIdStr = process.argv[2];

  if (!listIdStr) {
    console.error('Usage: tsx get-list-tasks.ts <list_id>');
    console.error('\nTo find a list_id:');
    console.error('1. Open a list in ClickUp');
    console.error('2. Look at the URL: https://app.clickup.com/.../v/li/<list_id>');
    console.error('3. Copy the list_id from the URL');
    console.error('\nExample: tsx get-list-tasks.ts 900701394861');
    process.exit(1);
  }

  const listId = parseInt(listIdStr, 10);
  if (isNaN(listId)) {
    console.error('Error: list_id must be a valid number');
    process.exit(1);
  }

  console.log('📋 ClickUp List Tasks Viewer\n');

  try {
    // Get user info
    console.log('👤 Getting user information...');
    const userResult = await getAuthorizedUser();
    console.log(`   User: ${userResult.user?.username}\n`);

    console.log(`📝 Getting tasks from list: ${listId}...\n`);

    const tasksResult = await getTasks(listId, {
      archived: false,
      include_closed: true,
      page: 0,
      order_by: 'created',
      reverse: true,
      subtasks: true,
    });

    if (!tasksResult.tasks || tasksResult.tasks.length === 0) {
      console.log('No tasks found in this list.');
      return;
    }

    console.log('='.repeat(70));
    console.log(`Found ${tasksResult.tasks.length} task(s)`);
    console.log('='.repeat(70));
    console.log('');

    tasksResult.tasks.forEach((task, index) => {
      const status = task.status?.status || 'No status';
      const statusColor = task.status?.color || 'gray';

      // Priority display
      let priorityDisplay = 'No priority';
      if (task.priority) {
        const priorityNames: { [key: string]: string } = {
          '1': '🔴 Urgent',
          '2': '🟡 High',
          '3': '🔵 Normal',
          '4': '⚪ Low'
        };
        priorityDisplay = priorityNames[task.priority.priority] || `Priority ${task.priority.priority}`;
      }

      console.log(`${index + 1}. 【${status}】 ${task.name}`);
      console.log(`   ID: ${task.id} | ${priorityDisplay}`);

      if (task.description && task.description.length > 0) {
        const desc = task.description
          .replace(/\n/g, ' ')
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .substring(0, 80);
        console.log(`   💬 ${desc}${task.description.length > 80 ? '...' : ''}`);
      }

      if (task.assignees && task.assignees.length > 0) {
        const assigneeNames = task.assignees
          .map(a => a.username || a.email)
          .filter(n => n)
          .join(', ');
        if (assigneeNames) {
          console.log(`   👤 Assignees: ${assigneeNames}`);
        }
      }

      if (task.tags && task.tags.length > 0) {
        const tagNames = task.tags.map(t => t.name).join(', ');
        console.log(`   🏷️  Tags: ${tagNames}`);
      }

      if (task.due_date) {
        const dueDate = new Date(parseInt(task.due_date));
        const now = new Date();
        const isOverdue = dueDate < now && task.status?.status !== 'complete';
        const dateStr = dueDate.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log(`   📅 Due: ${dateStr}${isOverdue ? ' ⚠️ OVERDUE' : ''}`);
      }

      if (task.time_estimate) {
        const hours = Math.floor(parseInt(task.time_estimate) / 3600000);
        const minutes = Math.floor((parseInt(task.time_estimate) % 3600000) / 60000);
        console.log(`   ⏱️  Estimate: ${hours}h ${minutes}m`);
      }

      if (task.time_spent) {
        const hours = Math.floor(parseInt(task.time_spent) / 3600000);
        const minutes = Math.floor((parseInt(task.time_spent) % 3600000) / 60000);
        console.log(`   ⏰ Spent: ${hours}h ${minutes}m`);
      }

      // Show parent if subtask
      if (task.parent) {
        console.log(`   ↳ Subtask of: ${task.parent}`);
      }

      // Show creation date
      if (task.date_created) {
        const created = new Date(parseInt(task.date_created));
        const createdStr = created.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        console.log(`   📆 Created: ${createdStr}`);
      }

      console.log('');
    });

    console.log('='.repeat(70));
    console.log('✅ Task listing completed!');

    // Summary
    const statusCounts: { [key: string]: number } = {};
    tasksResult.tasks.forEach(task => {
      const status = task.status?.status || 'No status';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\n📊 Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);

      if (error.response.status === 401) {
        console.error('\n💡 Authentication error. Check your CLICKUP_API_TOKEN.');
      } else if (error.response.status === 404) {
        console.error('\n💡 List not found.');
        console.error('   Make sure the list_id is correct and you have access to it.');
      } else if (error.response.status === 403) {
        console.error('\n💡 Access denied.');
        console.error('   You may not have permission to access this list.');
      }
    }

    process.exit(1);
  }
}

main();
