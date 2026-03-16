import { Command } from 'commander';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { getConfigValue } from '../config.js';

export function createTasksCommand() {
  const tasksCommand = new Command('tasks')
    .description('Manage ClickUp tasks');

  tasksCommand
    .command('get-all')
    .description('Get all tasks in a list')
    .requiredOption('-l, --list-id <listId>', 'List ID')
    .action(async (options) => {
      const accessToken = getConfigValue('accessToken');
      if (!accessToken) {
        console.error('Access token not found. Please login first.');
        return;
      }

      const clickup = new ClickUpClient({ accessToken });
      try {
        const tasks = await clickup.getTasks(options.listId);
        console.log(JSON.stringify(tasks, null, 2));
      } catch (error) {
        console.error('Failed to get tasks:', error);
      }
    });

  return tasksCommand;
}