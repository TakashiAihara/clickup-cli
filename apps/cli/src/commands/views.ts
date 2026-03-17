import { Command } from 'commander';
import {
  setAccessToken,
  getSpaceViews,
  getFolderViews,
  getListViews,
  getTeamViews,
  getView,
  createSpaceView,
  createFolderView,
  createListView,
  createTeamView,
  updateView,
  deleteView,
  getViewTasks,
} from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

function printViews(result: any): void {
  const views = (result as any).views ?? [];
  for (const v of views) {
    console.log(`${v.id}\t${v.name}\t${v.type ?? '-'}`);
  }
}

export function createViewsCommand(): Command {
  const cmd = new Command('views').description('View operations');

  cmd
    .command('list')
    .description('List views (specify one of --space-id, --folder-id, --list-id, or --team-id)')
    .option('--space-id <id>', 'Space ID')
    .option('--folder-id <id>', 'Folder ID')
    .option('--list-id <id>', 'List ID')
    .option('--team-id <id>', 'Team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        let result: any;
        if (opts.spaceId) result = await getSpaceViews(Number(opts.spaceId));
        else if (opts.folderId) result = await getFolderViews(Number(opts.folderId));
        else if (opts.listId) result = await getListViews(Number(opts.listId));
        else if (opts.teamId) result = await getTeamViews(Number(opts.teamId));
        else throw new CliError('Specify --space-id, --folder-id, --list-id, or --team-id', 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);

        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          printViews(result);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('show <viewId>')
    .description('Show view details')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (viewId, opts) => {
      try {
        ensureAuth();
        const result = await getView(viewId);
        console.log(JSON.stringify(result, null, 2));
      } catch (e) { handleError(e); }
    });

  cmd
    .command('tasks <viewId>')
    .description('Get tasks from a view')
    .option('--page <number>', 'Page number', '0')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (viewId, opts) => {
      try {
        ensureAuth();
        const result = await getViewTasks(viewId, { page: Number(opts.page) });
        console.log(JSON.stringify(result, null, 2));
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a view')
    .requiredOption('--name <name>', 'View name')
    .requiredOption('--type <type>', 'View type (list, board, calendar, gantt, etc.)')
    .option('--space-id <id>', 'Space ID')
    .option('--folder-id <id>', 'Folder ID')
    .option('--list-id <id>', 'List ID')
    .option('--team-id <id>', 'Team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const body = { name: opts.name, type: opts.type } as any;
        let result: any;
        if (opts.spaceId) result = await createSpaceView(Number(opts.spaceId), body);
        else if (opts.folderId) result = await createFolderView(Number(opts.folderId), body);
        else if (opts.listId) result = await createListView(Number(opts.listId), body);
        else if (opts.teamId) result = await createTeamView(Number(opts.teamId), body);
        else throw new CliError('Specify --space-id, --folder-id, --list-id, or --team-id', 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);

        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`View created: ${(result as any).view?.name ?? (result as any).id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <viewId>')
    .description('Update a view')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (viewId, opts) => {
      try {
        ensureAuth();
        const body: Record<string, any> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateView(viewId, body as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('View updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <viewId>')
    .description('Delete a view')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (viewId, opts) => {
      try {
        ensureAuth();
        await deleteView(viewId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: viewId }));
        } else {
          console.log(`View ${viewId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
