import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClickUpClient } from '../../../clickup-api/dist/index.js';
import { getConfigValue, setConfigValue, updateConfig } from '../config.js';

export function createAuthCommand(): Command {
  const auth = new Command('auth');
  
  auth
    .description('Manage authentication')
    .addCommand(createLoginCommand())
    .addCommand(createLogoutCommand())
    .addCommand(createStatusCommand());

  return auth;
}

function createLoginCommand(): Command {
  return new Command('login')
    .description('Login to ClickUp')
    .action(async () => {
      const { accessToken } = await inquirer.prompt([
        {
          type: 'password',
          name: 'accessToken',
          message: 'Enter your ClickUp access token:',
          mask: '*',
        },
      ]);

      try {
        const client = new ClickUpClient({ accessToken });
        const user = await client.getUser();
        
        setConfigValue('accessToken', accessToken);
        
        console.log(chalk.green(`✓ Successfully logged in as ${user.username}`));
      } catch (error) {
        console.error(chalk.red('✗ Failed to authenticate. Please check your access token.'));
        process.exit(1);
      }
    });
}

function createLogoutCommand(): Command {
  return new Command('logout')
    .description('Logout from ClickUp')
    .action(() => {
      updateConfig({ accessToken: undefined });
      console.log(chalk.green('✓ Successfully logged out'));
    });
}

function createStatusCommand(): Command {
  return new Command('status')
    .description('Show authentication status')
    .action(async () => {
      const accessToken = getConfigValue('accessToken');
      
      if (!accessToken) {
        console.log(chalk.yellow('Not authenticated. Run "clickup auth login" to login.'));
        return;
      }

      try {
        const client = new ClickUpClient({ accessToken });
        const user = await client.getUser();
        console.log(chalk.green(`✓ Authenticated as ${user.username} (${user.email})`));
      } catch (error) {
        console.log(chalk.red('✗ Authentication expired. Please login again.'));
      }
    });
}