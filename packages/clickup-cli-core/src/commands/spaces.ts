import { Command } from 'commander';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { getConfigValue } from '../config.js';

export function createSpacesCommand() {
  const spacesCommand = new Command('spaces')
    .description('Manage ClickUp spaces');

  spacesCommand
    .command('get-all')
    .description('Get all spaces in a team')
    .requiredOption('-t, --team-id <teamId>', 'Team ID')
    .action(async (options) => {
      const accessToken = getConfigValue('accessToken');
      if (!accessToken) {
        console.error('Access token not found. Please login first.');
        return;
      }

      const clickup = new ClickUpClient({ accessToken });
      try {
        const spaces = await clickup.getSpaces(options.teamId);
        console.log(JSON.stringify(spaces, null, 2));
      } catch (error) {
        console.error('Failed to get spaces:', error);
      }
    });

  return spacesCommand;
}