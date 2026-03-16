import { Command } from 'commander';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { getConfigValue } from '../config.js';

export function createListsCommand() {
  const listsCommand = new Command('lists')
    .description('Manage ClickUp lists');

  listsCommand
    .command('get-all')
    .description('Get all lists in a space')
    .requiredOption('-s, --space-id <spaceId>', 'Space ID')
    .action(async (options) => {
      const accessToken = getConfigValue('accessToken');
      if (!accessToken) {
        console.error('Access token not found. Please login first.');
        return;
      }

      const clickup = new ClickUpClient({ accessToken });
      try {
        const lists = await clickup.getLists(options.spaceId);
        console.log(JSON.stringify(lists, null, 2));
      } catch (error) {
        console.error('Failed to get lists:', error);
      }
    });

  return listsCommand;
}