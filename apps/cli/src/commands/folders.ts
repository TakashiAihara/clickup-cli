import { Command } from 'commander';
import { setAccessToken, getFolders, getFolder, createFolder, updateFolder, deleteFolder } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createFoldersCommand(): Command {
  const cmd = new Command('folders').description('Folder operations');

  cmd
    .command('list')
    .description('List folders in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getFolders(Number(opts.spaceId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const folders = (result as any).folders ?? [];
          for (const f of folders) {
            console.log(`${f.id}\t${f.name}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('show <folderId>')
    .description('Show folder details')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (folderId, opts) => {
      try {
        ensureAuth();
        const result = await getFolder(Number(folderId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const f = result as any;
          console.log(`ID:   ${f.id}`);
          console.log(`Name: ${f.name}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a folder')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'Folder name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createFolder(Number(opts.spaceId), { name: opts.name });
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Folder created: ${(result as any).name ?? (result as any).id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <folderId>')
    .description('Update a folder')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (folderId, opts) => {
      try {
        ensureAuth();
        const body: Record<string, any> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateFolder(Number(folderId), body as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Folder updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <folderId>')
    .description('Delete a folder')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (folderId, opts) => {
      try {
        ensureAuth();
        await deleteFolder(Number(folderId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: folderId }));
        } else {
          console.log(`Folder ${folderId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
