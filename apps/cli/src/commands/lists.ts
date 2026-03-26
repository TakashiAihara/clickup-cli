import {
  setAccessToken,
  getLists,
  getFolderlessLists,
  createList,
  createFolderlessList,
  updateList,
  deleteList,
  getAccessibleCustomFields,
  getListMembers,
  addGuestToList,
  removeGuestFromList,
  addTaskToList,
  removeTaskFromList,
  createTaskFromTemplate,
} from '@clickup/api';
import type {
  GetLists200,
  GetFolderlessLists200,
  CreateList200,
  CreateFolderlessList200,
  UpdateListBody,
  GetAccessibleCustomFields200,
  GetListMembers200,
  AddGuestToListBody,
  CreateTaskFromTemplateBody,
} from '@clickup/api';
import { Command } from 'commander';

import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token)
    throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
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
          const lists = (result as GetLists200).lists ?? [];
          for (const l of lists) {
            console.log(`${l.id}\t${l.name}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
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
          const lists = (result as GetFolderlessLists200).lists ?? [];
          for (const l of lists) {
            console.log(`${l.id}\t${l.name}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
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
          const created = result as CreateList200;
          console.log(`List created: ${created.name ?? created.id}`);
        }
      } catch (e) {
        handleError(e);
      }
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
          const created = result as CreateFolderlessList200;
          console.log(`List created: ${created.name ?? created.id}`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('update <listId>')
    .description('Update a list')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (listId, opts) => {
      try {
        ensureAuth();
        const body: Partial<UpdateListBody> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateList(listId, body as UpdateListBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('List updated.');
        }
      } catch (e) {
        handleError(e);
      }
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
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('fields')
    .description('List available custom fields in a list')
    .requiredOption('--list-id <id>', 'List ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getAccessibleCustomFields(Number(opts.listId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const fields = (result as GetAccessibleCustomFields200).fields ?? [];
          for (const f of fields) {
            console.log(`${f.id}\t${f.name}\t${f.type ?? '-'}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('members')
    .description('List members of a list')
    .requiredOption('--list-id <id>', 'List ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getListMembers(Number(opts.listId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const members = (result as GetListMembers200).members ?? [];
          for (const m of members) {
            console.log(`${m.id}\t${m.username ?? m.email ?? '-'}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('add-guest')
    .description('Add a guest to a list')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--permission-level <level>', 'Permission level (read, comment, edit, create)', 'read')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addGuestToList(Number(opts.listId), Number(opts.guestId), {
          permission_level: opts.permissionLevel,
        } as AddGuestToListBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Guest ${opts.guestId} added to list.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('remove-guest')
    .description('Remove a guest from a list')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeGuestFromList(Number(opts.listId), Number(opts.guestId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, guestId: opts.guestId }));
        } else {
          console.log(`Guest ${opts.guestId} removed from list.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('add-task')
    .description('Add a task to a list')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addTaskToList(Number(opts.listId), opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Task ${opts.taskId} added to list.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('remove-task')
    .description('Remove a task from a list')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeTaskFromList(Number(opts.listId), opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, taskId: opts.taskId }));
        } else {
          console.log(`Task ${opts.taskId} removed from list.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create-task-from-template')
    .description('Create a task from a template')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--template-id <id>', 'Template ID')
    .requiredOption('--name <name>', 'Task name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createTaskFromTemplate(Number(opts.listId), opts.templateId, {
          name: opts.name,
        } as CreateTaskFromTemplateBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Task created from template.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  return cmd;
}
