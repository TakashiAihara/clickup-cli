import { Command } from 'commander';
import { setAccessToken, getSpaces, createSpace, updateSpace, deleteSpace } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';
import type { OutputFormat } from '../utils/format.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createSpacesCommand(): Command {
  const cmd = new Command('spaces').description('Space operations');

  cmd
    .command('list')
    .description('List spaces in a workspace')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getSpaces(Number(opts.teamId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const spaces = (result as any).spaces ?? [];
          for (const s of spaces) {
            console.log(`${s.id}\t${s.name}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a space')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--name <name>', 'Space name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createSpace(Number(opts.teamId), { name: opts.name } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Space created: ${(result as any).name ?? (result as any).id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <spaceId>')
    .description('Update a space')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (spaceId, opts) => {
      try {
        ensureAuth();
        const body: Record<string, any> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateSpace(Number(spaceId), body as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Space updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <spaceId>')
    .description('Delete a space')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (spaceId, opts) => {
      try {
        ensureAuth();
        await deleteSpace(Number(spaceId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: spaceId }));
        } else {
          console.log(`Space ${spaceId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
