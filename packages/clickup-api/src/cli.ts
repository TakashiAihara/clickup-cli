#!/usr/bin/env node
import { Command } from 'commander';
import { config as loadEnv } from 'dotenv';
import {
  getAuthorizedUser,
  getTask,
  getTasks,
  updateTask,
  createTask,
  deleteTask,
  getAuthorizedTeams,
  getSpaces,
  getFolderlessLists,
} from './index.js';

loadEnv();

const program = new Command();

program
  .name('clickup')
  .description('ClickUp CLI - Interact with ClickUp API from the command line')
  .version('0.1.0');

// User commands
const userCmd = program.command('user').description('User operations');

userCmd
  .command('me')
  .description('Get current user information')
  .action(async () => {
    try {
      const result = await getAuthorizedUser();
      console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Task commands
const taskCmd = program.command('task').description('Task operations');

taskCmd
  .command('get <task_id>')
  .description('Get a task by ID')
  .option('-j, --json', 'Output as JSON')
  .action(async (taskId: string, options) => {
    try {
      const task = await getTask(taskId);
      if (options.json) {
        console.log(JSON.stringify(task, null, 2));
      } else {
        console.log('='.repeat(60));
        console.log(`Task: ${task.name}`);
        console.log('='.repeat(60));
        console.log(`ID: ${task.id}`);
        console.log(`Status: ${task.status?.status || 'No status'}`);
        if (task.description) {
          console.log(`\nDescription:\n${task.description}`);
        }
        if (task.assignees && task.assignees.length > 0) {
          const assigneeNames = task.assignees
            .map((a: any) => a.username || a.email)
            .filter((n: any) => n);
          if (assigneeNames.length > 0) {
            console.log(`\nAssignees: ${assigneeNames.join(', ')}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

taskCmd
  .command('update <task_id>')
  .description('Update a task')
  .option('-s, --status <status>', 'Update status')
  .option('-n, --name <name>', 'Update name')
  .option('-d, --description <description>', 'Update description')
  .option('-p, --priority <priority>', 'Update priority (1-4)')
  .option('-j, --json', 'Output as JSON')
  .action(async (taskId: string, options) => {
    try {
      const updateData: any = {};
      if (options.status) updateData.status = options.status;
      if (options.name) updateData.name = options.name;
      if (options.description) updateData.description = options.description;
      if (options.priority) updateData.priority = parseInt(options.priority, 10);

      const result = await updateTask(taskId, updateData);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`✅ Task updated: ${result.name}`);
        console.log(`Status: ${result.status?.status}`);
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      if (error.response?.data) {
        console.error('Details:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }
  });

taskCmd
  .command('complete <task_id>')
  .description('Mark a task as complete')
  .action(async (taskId: string) => {
    try {
      const result = await updateTask(taskId, { status: 'complete' });
      console.log(`✅ Task completed: ${result.name}`);
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

taskCmd
  .command('create <list_id>')
  .description('Create a new task')
  .requiredOption('-n, --name <name>', 'Task name')
  .option('-d, --description <description>', 'Task description')
  .option('-p, --priority <priority>', 'Priority (1-4)')
  .option('-s, --status <status>', 'Status')
  .option('-j, --json', 'Output as JSON')
  .action(async (listId: string, options) => {
    try {
      const taskData: any = { name: options.name };
      if (options.description) taskData.description = options.description;
      if (options.priority) taskData.priority = parseInt(options.priority, 10);
      if (options.status) taskData.status = options.status;

      const result = await createTask(parseInt(listId, 10), taskData);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`✅ Task created: ${result.name}`);
        console.log(`ID: ${result.id}`);
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      if (error.response?.data) {
        console.error('Details:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }
  });

taskCmd
  .command('delete <task_id>')
  .description('Delete a task')
  .action(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      console.log(`✅ Task deleted: ${taskId}`);
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// List commands
const listCmd = program.command('list').description('List operations');

listCmd
  .command('tasks <list_id>')
  .description('Get tasks from a list')
  .option('-a, --archived', 'Include archived tasks')
  .option('-c, --closed', 'Include closed tasks')
  .option('-p, --page <page>', 'Page number', '0')
  .option('-j, --json', 'Output as JSON')
  .action(async (listId: string, options) => {
    try {
      const params: any = {
        archived: options.archived || false,
        include_closed: options.closed || false,
        page: parseInt(options.page, 10),
        order_by: 'created',
        reverse: true,
        subtasks: true,
      };

      const result = await getTasks(parseInt(listId, 10), params);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (!result.tasks || result.tasks.length === 0) {
          console.log('No tasks found.');
          return;
        }

        console.log(`Found ${result.tasks.length} task(s)\n`);
        result.tasks.forEach((task, index) => {
          const status = task.status?.status || 'No status';
          console.log(`${index + 1}. [${status}] ${task.name}`);
          console.log(`   ID: ${task.id}`);
          if (task.assignees && task.assignees.length > 0) {
            const assigneeNames = task.assignees
              .map((a: any) => a.username || a.email)
              .filter((n: any) => n);
            if (assigneeNames.length > 0) {
              console.log(`   Assignees: ${assigneeNames.join(', ')}`);
            }
          }
          console.log('');
        });
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Workspace commands
const workspaceCmd = program.command('workspace').description('Workspace operations');

workspaceCmd
  .command('list')
  .description('List all workspaces')
  .option('-j, --json', 'Output as JSON')
  .action(async (options) => {
    try {
      const result = await getAuthorizedTeams();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (!result.teams || result.teams.length === 0) {
          console.log('No workspaces found.');
          return;
        }

        console.log(`Found ${result.teams.length} workspace(s):\n`);
        result.teams.forEach((team, index) => {
          console.log(`${index + 1}. ${team.name}`);
          console.log(`   ID: ${team.id}`);
        });
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

workspaceCmd
  .command('spaces <team_id>')
  .description('List spaces in a workspace')
  .option('-j, --json', 'Output as JSON')
  .action(async (teamId: string, options) => {
    try {
      const result = await getSpaces(parseInt(teamId, 10));

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (!result.spaces || result.spaces.length === 0) {
          console.log('No spaces found.');
          return;
        }

        console.log(`Found ${result.spaces.length} space(s):\n`);
        result.spaces.forEach((space, index) => {
          console.log(`${index + 1}. ${space.name}`);
          console.log(`   ID: ${space.id}`);
        });
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

// Space commands
const spaceCmd = program.command('space').description('Space operations');

spaceCmd
  .command('lists <space_id>')
  .description('List all lists in a space (folderless)')
  .option('-a, --archived', 'Include archived lists')
  .option('-j, --json', 'Output as JSON')
  .action(async (spaceId: string, options) => {
    try {
      const result = await getFolderlessLists(
        parseInt(spaceId, 10),
        { archived: options.archived || false }
      );

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (!result.lists || result.lists.length === 0) {
          console.log('No lists found.');
          return;
        }

        console.log(`Found ${result.lists.length} list(s):\n`);
        result.lists.forEach((list, index) => {
          console.log(`${index + 1}. ${list.name}`);
          console.log(`   ID: ${list.id}`);
        });
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
