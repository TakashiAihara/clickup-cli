import { Command } from 'commander';
import { setAccessToken, getLists, getFolderlessLists, createList, createFolderlessList, updateList, deleteList } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createListsCommand(): Command {
  const cmd = new Command('lists').description('List operations');

  cmd
    .command('list')
    .description('List lists in a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getLists(Number(opts.folderId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const lists = (result as any).lists ?? [];
          for (const l of lists) {
            console.log(`${l.id}\t${l.name}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('folderless')
    .description('List folderless lists in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getFolderlessLists(Number(opts.spaceId), {});
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const lists = (result as any).lists ?? [];
          for (const l of lists) {
            console.log(`${l.id}\t${l.name}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a list in a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .requiredOption('--name <name>', 'List name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createList(Number(opts.folderId), { name: opts.name });
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`List created: ${(result as any).name ?? (result as any).id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create-folderless')
    .description('Create a folderless list in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'List name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createFolderlessList(Number(opts.spaceId), { name: opts.name });
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`List created: ${(result as any).name ?? (result as any).id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <listId>')
    .description('Update a list')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (listId, opts) => {
      try {
        ensureAuth();
        const body: Record<string, any> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateList(listId, body as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('List updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <listId>')
    .description('Delete a list')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (listId, opts) => {
      try {
        ensureAuth();
        await deleteList(Number(listId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: listId }));
        } else {
          console.log(`List ${listId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
