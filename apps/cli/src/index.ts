import { Command } from 'commander';
import { setAccessToken, getAuthorizedUser, getAuthorizedTeams } from '@clickup/api';

const program = new Command();

program
  .name('clickup')
  .description('ClickUp CLI')
  .version('0.1.0');

program
  .command('whoami')
  .description('Show current user')
  .action(async () => {
    const result = await getAuthorizedUser();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('workspaces')
  .description('List workspaces')
  .action(async () => {
    const result = await getAuthorizedTeams();
    console.log(JSON.stringify(result, null, 2));
  });

// Set token from env before parsing
const token = process.env.CLICKUP_API_TOKEN;
if (token) {
  setAccessToken(token);
}

program.parse();
