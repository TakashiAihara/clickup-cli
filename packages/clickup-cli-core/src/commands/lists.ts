import { Command } from 'commander';
import chalk from 'chalk';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { ConfigManager } from '../config.js';

export function createListsCommand(): Command {
  const lists = new Command('lists');
  
  lists
    .description('Manage lists')
    .addCommand(createListListsCommand());

  return lists;
}

function createListListsCommand(): Command {
  return new Command('list')
    .description('List all lists in a space')
    .requiredOption('-s, --space-id <spaceId>', 'Space ID')
    .action(async (options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        const lists = await client.getLists(options.spaceId);
        
        if (lists.length === 0) {
          console.log(chalk.yellow('No lists found'));
          return;
        }

        console.log(chalk.blue(`Found ${lists.length} lists:`));
        lists.forEach(list => {
          console.log(`${chalk.green(list.id)} - ${list.name} (${list.task_count || 0} tasks)`);
        });
      } catch (error) {
        console.error(chalk.red('Failed to fetch lists:', error));
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