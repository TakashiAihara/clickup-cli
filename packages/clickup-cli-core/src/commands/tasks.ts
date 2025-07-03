import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClickUpClient, Task } from '../../../clickup-api/dist/index.js';
import { ConfigManager } from '../config.js';

export function createTasksCommand(): Command {
  const tasks = new Command('tasks');
  
  tasks
    .description('Manage tasks')
    .addCommand(createListTasksCommand())
    .addCommand(createCreateTaskCommand())
    .addCommand(createShowTaskCommand())
    .addCommand(createUpdateTaskCommand())
    .addCommand(createDeleteTaskCommand());

  return tasks;
}

function createListTasksCommand(): Command {
  return new Command('list')
    .description('List tasks')
    .option('-l, --list-id <listId>', 'List ID to filter tasks')
    .option('-s, --status <status>', 'Status to filter tasks')
    .action(async (options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        let tasks: Task[] = [];
        
        if (options.listId) {
          tasks = await client.getTasks(options.listId);
        } else {
          console.log(chalk.yellow('Please specify a list ID with --list-id option'));
          return;
        }

        if (options.status) {
          tasks = tasks.filter(task => task.status.status === options.status);
        }

        if (tasks.length === 0) {
          console.log(chalk.yellow('No tasks found'));
          return;
        }

        console.log(chalk.blue(`Found ${tasks.length} tasks:`));
        tasks.forEach(task => {
          console.log(`${chalk.green(task.id)} - ${task.name} [${task.status.status}]`);
        });
      } catch (error) {
        console.error(chalk.red('Failed to fetch tasks:', error));
      }
    });
}

function createCreateTaskCommand(): Command {
  return new Command('create')
    .description('Create a new task')
    .requiredOption('-l, --list-id <listId>', 'List ID to create task in')
    .option('-n, --name <name>', 'Task name')
    .option('-d, --description <description>', 'Task description')
    .action(async (options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        let taskName = options.name;
        let taskDescription = options.description;

        if (!taskName) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Task name:',
              validate: (input) => input.trim() !== '' || 'Task name is required',
            },
          ]);
          taskName = answers.name;
        }

        if (!taskDescription) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Task description (optional):',
            },
          ]);
          taskDescription = answers.description;
        }

        const task = await client.createTask(options.listId, {
          name: taskName,
          description: taskDescription || undefined,
        });

        console.log(chalk.green(`✓ Task created: ${task.name} (${task.id})`));
      } catch (error) {
        console.error(chalk.red('Failed to create task:', error));
      }
    });
}

function createShowTaskCommand(): Command {
  return new Command('show')
    .description('Show task details')
    .argument('<taskId>', 'Task ID')
    .action(async (taskId) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        const task = await client.getTask(taskId);
        
        console.log(chalk.blue('Task Details:'));
        console.log(`ID: ${task.id}`);
        console.log(`Name: ${task.name}`);
        console.log(`Status: ${task.status.status}`);
        console.log(`Priority: ${task.priority?.priority || 'Not set'}`);
        
        if (task.description) {
          console.log(`Description: ${task.description}`);
        }
        
        if (task.assignees && task.assignees.length > 0) {
          console.log(`Assignees: ${task.assignees.map(a => a.username).join(', ')}`);
        }
        
        if (task.due_date) {
          console.log(`Due Date: ${new Date(task.due_date).toLocaleDateString()}`);
        }
      } catch (error) {
        console.error(chalk.red('Failed to fetch task:', error));
      }
    });
}

function createUpdateTaskCommand(): Command {
  return new Command('update')
    .description('Update a task')
    .argument('<taskId>', 'Task ID')
    .option('-n, --name <name>', 'New task name')
    .option('-d, --description <description>', 'New task description')
    .option('-s, --status <status>', 'New task status')
    .action(async (taskId, options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        const updates: any = {};
        
        if (options.name) updates.name = options.name;
        if (options.description) updates.description = options.description;
        if (options.status) updates.status = options.status;

        if (Object.keys(updates).length === 0) {
          console.log(chalk.yellow('No updates specified'));
          return;
        }

        const task = await client.updateTask(taskId, updates);
        console.log(chalk.green(`✓ Task updated: ${task.name}`));
      } catch (error) {
        console.error(chalk.red('Failed to update task:', error));
      }
    });
}

function createDeleteTaskCommand(): Command {
  return new Command('delete')
    .description('Delete a task')
    .argument('<taskId>', 'Task ID')
    .option('-f, --force', 'Force delete without confirmation')
    .action(async (taskId, options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete task ${taskId}?`,
              default: false,
            },
          ]);

          if (!confirm) {
            console.log(chalk.yellow('Deletion cancelled'));
            return;
          }
        }

        await client.deleteTask(taskId);
        console.log(chalk.green(`✓ Task ${taskId} deleted`));
      } catch (error) {
        console.error(chalk.red('Failed to delete task:', error));
      }
    });
}

async function getAuthenticatedClient(): Promise<ClickUpClient | null> {
  const config = new ConfigManager();
  const accessToken = config.get('accessToken');

  if (!accessToken) {
    console.error(chalk.red('Not authenticated. Run "clickup auth login" first.'));
    return null;
  }

  return new ClickUpClient({ accessToken });
}