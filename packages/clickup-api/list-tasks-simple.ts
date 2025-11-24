import { config as loadEnv } from 'dotenv';
import {
  getAuthorizedUser,
  getSpaces,
  getFolderlessLists,
  getTasks,
} from './src/index.js';

// Load environment variables
loadEnv();

async function main() {
  // Get team_id from command line argument
  const teamId = process.argv[2];

  if (!teamId) {
    console.error('Usage: tsx list-tasks-simple.ts <team_id>');
    console.error('\nTo find your team_id:');
    console.error('1. Go to ClickUp and open any workspace');
    console.error('2. Look at the URL: https://app.clickup.com/<team_id>/...');
    console.error('3. Copy the team_id from the URL');
    process.exit(1);
  }

  console.log('📋 ClickUp Tasks Viewer\n');

  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.error('❌ CLICKUP_API_TOKEN not found in environment');
    console.log('Please set it in .env file');
    process.exit(1);
  }

  try {
    // Get user info
    console.log('👤 Getting user information...');
    const userResult = await getAuthorizedUser();
    console.log(`   User: ${userResult.user?.username}\n`);

    console.log(`🏢 Using Team ID: ${teamId}\n`);

    // Get spaces
    console.log('📂 Getting spaces...');
    const spacesResult = await getSpaces({ team_id: teamId });

    if (!spacesResult.spaces || spacesResult.spaces.length === 0) {
      console.log('   No spaces found in this workspace.');
      return;
    }

    console.log(`   Found ${spacesResult.spaces.length} space(s)\n`);

    // For each space, get lists and tasks
    for (const space of spacesResult.spaces) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📁 Space: ${space.name} (ID: ${space.id})`);
      console.log('='.repeat(60));

      try {
        // Get folderless lists
        console.log('\n  Getting lists...');
        const listsResult = await getFolderlessLists({
          space_id: space.id,
          archived: false
        });

        if (!listsResult.lists || listsResult.lists.length === 0) {
          console.log('  No lists found in this space.');
          continue;
        }

        console.log(`  Found ${listsResult.lists.length} list(s)`);

        // For each list, get tasks
        for (const list of listsResult.lists) {
          console.log(`\n  📝 List: ${list.name} (ID: ${list.id})`);

          try {
            const tasksResult = await getTasks(list.id, {
              archived: false,
              page: 0,
              order_by: 'created',
              reverse: true,
              subtasks: false,
              include_closed: false
            });

            if (!tasksResult.tasks || tasksResult.tasks.length === 0) {
              console.log('     No open tasks found in this list.');
              continue;
            }

            console.log(`     Found ${tasksResult.tasks.length} task(s):\n`);

            tasksResult.tasks.slice(0, 10).forEach((task, index) => {
              const status = task.status?.status || 'No status';
              const priority = task.priority ?
                `P${task.priority.priority}` : 'No priority';

              console.log(`     ${index + 1}. [${status}] ${task.name}`);
              console.log(`        ID: ${task.id} | ${priority}`);

              if (task.description && task.description.length > 0) {
                const desc = task.description.replace(/\n/g, ' ').substring(0, 60);
                console.log(`        ${desc}${task.description.length > 60 ? '...' : ''}`);
              }

              if (task.assignees && task.assignees.length > 0) {
                const assigneeNames = task.assignees
                  .map(a => a.username || a.email)
                  .filter(n => n)
                  .join(', ');
                if (assigneeNames) {
                  console.log(`        👤 ${assigneeNames}`);
                }
              }

              if (task.due_date) {
                const dueDate = new Date(parseInt(task.due_date));
                console.log(`        📅 Due: ${dueDate.toLocaleDateString('ja-JP')}`);
              }

              console.log('');
            });

            if (tasksResult.tasks.length > 10) {
              console.log(`     ... and ${tasksResult.tasks.length - 10} more tasks\n`);
            }

          } catch (error: any) {
            console.error(`     ✗ Error getting tasks: ${error.message}`);
            if (error.response?.status === 404) {
              console.error(`       This list may not exist or you don't have access.`);
            }
          }
        }

      } catch (error: any) {
        console.error(`  ✗ Error getting lists: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Task listing completed!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    if (error.response) {
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);

      if (error.response.status === 401) {
        console.error('\n💡 Authentication error. Check your CLICKUP_API_TOKEN.');
      } else if (error.response.status === 404) {
        console.error('\n💡 Resource not found.');
        console.error('   Make sure the team_id is correct.');
        console.error('   You can find it in the ClickUp URL when browsing your workspace.');
      } else if (error.response.status === 403) {
        console.error('\n💡 Access denied. You may not have permission to access this workspace.');
      }
    }

    process.exit(1);
  }
}

main();
