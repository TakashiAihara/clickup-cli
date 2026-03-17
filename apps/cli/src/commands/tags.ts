import { Command } from 'commander';
import { setAccessToken, getSpaceTags, createSpaceTag, editSpaceTag, deleteSpaceTag, addTagToTask, removeTagFromTask } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createTagsCommand(): Command {
  const cmd = new Command('tags').description('Tag operations');

  cmd
    .command('list')
    .description('List tags in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getSpaceTags(Number(opts.spaceId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const tags = (result as any).tags ?? [];
          for (const t of tags) {
            console.log(`${t.name}\t${t.tag_fg ?? '-'}\t${t.tag_bg ?? '-'}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a tag in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createSpaceTag(Number(opts.spaceId), { tag: { name: opts.name } } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Tag created: ${opts.name}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <tagName>')
    .description('Update a tag in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--new-name <name>', 'New tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (tagName, opts) => {
      try {
        ensureAuth();
        const result = await editSpaceTag(Number(opts.spaceId), tagName, { tag: { name: opts.newName } } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Tag renamed: ${tagName} -> ${opts.newName}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <tagName>')
    .description('Delete a tag from a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (tagName, opts) => {
      try {
        ensureAuth();
        await deleteSpaceTag(Number(opts.spaceId), tagName, {} as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, name: tagName }));
        } else {
          console.log(`Tag ${tagName} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('add')
    .description('Add a tag to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--tag <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await addTagToTask(opts.taskId, opts.tag);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ added: true, task: opts.taskId, tag: opts.tag }));
        } else {
          console.log(`Tag "${opts.tag}" added to task ${opts.taskId}.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('remove')
    .description('Remove a tag from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--tag <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeTagFromTask(opts.taskId, opts.tag);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, task: opts.taskId, tag: opts.tag }));
        } else {
          console.log(`Tag "${opts.tag}" removed from task ${opts.taskId}.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
