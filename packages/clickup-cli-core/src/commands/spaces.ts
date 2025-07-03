import { Command } from 'commander';
import chalk from 'chalk';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { ConfigManager } from '../config.js';

export function createSpacesCommand(): Command {
  const spaces = new Command('spaces');
  
  spaces
    .description('Manage spaces')
    .addCommand(createListSpacesCommand());

  return spaces;
}

function createListSpacesCommand(): Command {
  return new Command('list')
    .description('List spaces')
    .requiredOption('-t, --team-id <teamId>', 'Team ID')
    .action(async (options) => {
      const client = await getAuthenticatedClient();
      if (!client) return;

      try {
        const spaces = await client.getSpaces(options.teamId);
        
        if (spaces.length === 0) {
          console.log(chalk.yellow('No spaces found'));
          return;
        }

        console.log(chalk.blue(`Found ${spaces.length} spaces:`));
        spaces.forEach(space => {
          console.log(`${chalk.green(space.id)} - ${space.name} ${space.private ? '(Private)' : '(Public)'}`);
        });
      } catch (error) {
        console.error(chalk.red('Failed to fetch spaces:', error));
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