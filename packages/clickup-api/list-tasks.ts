import { config as loadEnv } from 'dotenv';
import {
  getAuthorizedUser,
  getAuthorizedTeams,
  getSpaces,
  getFolderlessLists,
  getTasks,
} from './src/index.js';

// Load environment variables
loadEnv();

async function main() {
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

    // Get teams/workspaces
    console.log('🏢 Getting workspaces...');
    const teamsResult = await getAuthorizedTeams();

    if (!teamsResult.teams || teamsResult.teams.length === 0) {
      console.log('   No workspaces found.');
      return;
    }

    console.log(`   Found ${teamsResult.teams.length} workspace(s)\n`);

    // For each team, get spaces and tasks
    for (const team of teamsResult.teams) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📁 Workspace: ${team.name} (ID: ${team.id})`);
      console.log('='.repeat(60));

      try {
        // Get spaces
        console.log('\n  Getting spaces...');
        const spacesResult = await getSpaces({ team_id: team.id });

        if (!spacesResult.spaces || spacesResult.spaces.length === 0) {
          console.log('  No spaces found in this workspace.');
          continue;
        }

        console.log(`  Found ${spacesResult.spaces.length} space(s)`);

        // For each space, get lists and tasks
        for (const space of spacesResult.spaces) {
          console.log(`\n  📂 Space: ${space.name} (ID: ${space.id})`);

          try {
            // Get folderless lists
            console.log('     Getting lists...');
            const listsResult = await getFolderlessLists({
              space_id: space.id,
              archived: false
            });

            if (!listsResult.lists || listsResult.lists.length === 0) {
              console.log('     No lists found in this space.');
              continue;
            }

            console.log(`     Found ${listsResult.lists.length} list(s)`);

            // For each list, get tasks
            for (const list of listsResult.lists) {
              console.log(`\n     📝 List: ${list.name} (ID: ${list.id})`);

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
                  console.log('        No tasks found in this list.');
                  continue;
                }

                console.log(`        Found ${tasksResult.tasks.length} task(s):\n`);

                tasksResult.tasks.forEach((task, index) => {
                  const status = task.status?.status || 'No status';
                  const priority = task.priority ?
                    `Priority ${task.priority.priority}` : 'No priority';

                  console.log(`        ${index + 1}. [${status}] ${task.name}`);
                  console.log(`           ID: ${task.id}`);
                  console.log(`           ${priority}`);

                  if (task.description) {
                    const desc = task.description.length > 60
                      ? task.description.substring(0, 60) + '...'
                      : task.description;
                    console.log(`           Description: ${desc}`);
                  }

                  if (task.assignees && task.assignees.length > 0) {
                    const assigneeNames = task.assignees
                      .map(a => a.username || a.email)
                      .join(', ');
                    console.log(`           Assignees: ${assigneeNames}`);
                  }

                  if (task.due_date) {
                    const dueDate = new Date(parseInt(task.due_date));
                    console.log(`           Due: ${dueDate.toLocaleDateString()}`);
                  }

                  console.log('');
                });

              } catch (error: any) {
                console.error(`        ✗ Error getting tasks: ${error.message}`);
              }
            }

          } catch (error: any) {
            console.error(`     ✗ Error getting lists: ${error.message}`);
          }
        }

      } catch (error: any) {
        console.error(`  ✗ Error getting spaces: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Task listing completed!');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Status Text: ${error.response.statusText}`);

      if (error.response.status === 401) {
        console.error('\n💡 Authentication error. Check your CLICKUP_API_TOKEN.');
      } else if (error.response.status === 404) {
        console.error('\n💡 Resource not found. The API endpoint may have changed.');
      }
    }

    process.exit(1);
  }
}

main();
