import { Command } from 'commander';
import { setAccessToken, getFolders, getFolder, createFolder, updateFolder, deleteFolder, getFolderAvailableFields, addGuestToFolder, removeGuestFromFolder, createFolderListFromTemplate } from '@clickup/api';
import type { GetFolders200Folders, GetFolder200, CreateFolder200, UpdateFolderBody, GetFolderAvailableFields200, AddGuestToFolderBody, CreateFolderListFromTemplateBody } from '@clickup/api';
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
          const folders = (result as unknown as { folders: GetFolders200Folders[] }).folders ?? [];
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
          const f = result as GetFolder200;
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
          const created = result as CreateFolder200;
          console.log(`Folder created: ${created.name ?? created.id}`);
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
        const body: Partial<UpdateFolderBody> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateFolder(Number(folderId), body as UpdateFolderBody);
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

  cmd
    .command('fields')
    .description('List available custom fields in a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getFolderAvailableFields(Number(opts.folderId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const fields = (result as GetFolderAvailableFields200).fields ?? [];
          for (const f of fields) {
            console.log(`${f.id}\t${f.name}\t${f.type ?? '-'}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('add-guest')
    .description('Add a guest to a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--permission-level <level>', 'Permission level (read, comment, edit, create)', 'read')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addGuestToFolder(Number(opts.folderId), Number(opts.guestId), { permission_level: opts.permissionLevel } as AddGuestToFolderBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Guest ${opts.guestId} added to folder.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('remove-guest')
    .description('Remove a guest from a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeGuestFromFolder(Number(opts.folderId), Number(opts.guestId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, guestId: opts.guestId }));
        } else {
          console.log(`Guest ${opts.guestId} removed from folder.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create-list-from-template')
    .description('Create a list from a template in a folder')
    .requiredOption('--folder-id <id>', 'Folder ID')
    .requiredOption('--template-id <id>', 'Template ID')
    .requiredOption('--name <name>', 'List name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createFolderListFromTemplate(opts.folderId, opts.templateId, { name: opts.name } as CreateFolderListFromTemplateBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`List created from template.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
