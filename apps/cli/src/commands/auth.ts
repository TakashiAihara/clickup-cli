import { setAccessToken, getAuthorizedUser, type GetAuthorizedUser200 } from '@clickup/api';
import { password, confirm } from '@inquirer/prompts';
import { Command } from 'commander';

import { saveToken, removeConfig, getToken, maskToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

export function createAuthCommand(): Command {
  const auth = new Command('auth').description('Authentication management');

  auth
    .command('login')
    .description('Store API token')
    .option('--token <string>', 'Provide token directly (not recommended)')
    .action(async (opts) => {
      try {
        let token = opts.token as string | undefined;

        if (!token) {
          token = await password({
            message: 'Enter your ClickUp API token:',
          });
        }

        if (!token?.trim()) {
          throw new CliError('Token cannot be empty.', 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);
        }

        token = token.trim();
        setAccessToken(token);

        // Validate token by calling API
        const result = await getAuthorizedUser();
        const user = (result as GetAuthorizedUser200).user!;

        saveToken(token);

        console.log(`Authenticated as ${user.username} (${user.email})`);
      } catch (error) {
        handleError(error);
      }
    });

  auth
    .command('status')
    .description('Check authentication status')
    .action(async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error('Not authenticated. Run: clickup auth login');
          process.exit(ExitCodes.AUTH_REQUIRED);
        }

        setAccessToken(token);
        const result = await getAuthorizedUser();
        const user = (result as GetAuthorizedUser200).user!;

        console.log(`User:  ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Token: ${maskToken(token)}`);
      } catch (error) {
        handleError(error);
      }
    });

  auth
    .command('logout')
    .description('Remove stored token')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (opts) => {
      try {
        if (!opts.confirm) {
          const ok = await confirm({ message: 'Remove stored token?', default: false });
          if (!ok) {
            console.log('Cancelled.');
            process.exit(ExitCodes.GENERAL);
          }
        }

        removeConfig();
        console.log('Logged out. Token removed.');
      } catch (error) {
        handleError(error);
      }
    });

  return auth;
}
