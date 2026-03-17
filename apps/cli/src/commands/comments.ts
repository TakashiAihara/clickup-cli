import { Command } from 'commander';
import { setAccessToken, getTaskComments, createTaskComment, getListComments, createListComment, updateComment, deleteComment } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createCommentsCommand(): Command {
  const cmd = new Command('comments').description('Comment operations');

  cmd
    .command('list-task')
    .description('List comments on a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getTaskComments(opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const comments = (result as any).comments ?? [];
          for (const c of comments) {
            console.log(`${c.id}\t${c.user?.username ?? 'unknown'}\t${c.comment_text?.slice(0, 60) ?? ''}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('list-list')
    .description('List comments on a list')
    .requiredOption('--list-id <id>', 'List ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getListComments(Number(opts.listId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const comments = (result as any).comments ?? [];
          for (const c of comments) {
            console.log(`${c.id}\t${c.user?.username ?? 'unknown'}\t${c.comment_text?.slice(0, 60) ?? ''}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create-task')
    .description('Add a comment to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--text <text>', 'Comment text')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createTaskComment(opts.taskId, { comment_text: opts.text } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Comment added.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create-list')
    .description('Add a comment to a list')
    .requiredOption('--list-id <id>', 'List ID')
    .requiredOption('--text <text>', 'Comment text')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createListComment(Number(opts.listId), { comment_text: opts.text } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Comment added.`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <commentId>')
    .description('Update a comment')
    .requiredOption('--text <text>', 'New comment text')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (commentId, opts) => {
      try {
        ensureAuth();
        const result = await updateComment(Number(commentId), { comment_text: opts.text } as any);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Comment updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <commentId>')
    .description('Delete a comment')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (commentId, opts) => {
      try {
        ensureAuth();
        await deleteComment(Number(commentId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: commentId }));
        } else {
          console.log(`Comment ${commentId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
