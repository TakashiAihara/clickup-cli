import {
  setAccessToken,
  getTaskComments,
  createTaskComment,
  getListComments,
  createListComment,
  updateComment,
  deleteComment,
  getThreadedComments,
  createThreadedComment,
} from '@clickup/api';
import type {
  GetTaskComments200,
  GetListComments200,
  CreateTaskCommentBody,
  CreateListCommentBody,
  UpdateCommentBody,
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
          const comments = (result as GetTaskComments200).comments ?? [];
          for (const c of comments) {
            console.log(`${c.id}\t${c.user?.username ?? 'unknown'}\t${c.comment_text?.slice(0, 60) ?? ''}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
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
          const comments = (result as GetListComments200).comments ?? [];
          for (const c of comments) {
            console.log(`${c.id}\t${c.user?.username ?? 'unknown'}\t${c.comment_text?.slice(0, 60) ?? ''}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
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
        const result = await createTaskComment(opts.taskId, {
          comment_text: opts.text,
        } as unknown as CreateTaskCommentBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Comment added.`);
        }
      } catch (e) {
        handleError(e);
      }
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
        const result = await createListComment(Number(opts.listId), {
          comment_text: opts.text,
        } as unknown as CreateListCommentBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Comment added.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('update <commentId>')
    .description('Update a comment')
    .requiredOption('--text <text>', 'New comment text')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (commentId, opts) => {
      try {
        ensureAuth();
        const result = await updateComment(Number(commentId), {
          comment_text: opts.text,
        } as unknown as UpdateCommentBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Comment updated.');
        }
      } catch (e) {
        handleError(e);
      }
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
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('replies')
    .description('List threaded replies on a comment')
    .requiredOption('--comment-id <id>', 'Comment ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getThreadedComments(Number(opts.commentId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const res = result as Record<string, unknown>;
          const replies: Record<string, unknown>[] = (res.comments ?? res.replies ?? []) as Record<string, unknown>[];
          for (const r of replies) {
            const user = r.user as Record<string, unknown> | undefined;
            console.log(
              `${r.id}\t${user?.username ?? 'unknown'}\t${typeof r.comment_text === 'string' ? r.comment_text.slice(0, 60) : ''}`,
            );
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('reply')
    .description('Post a threaded reply to a comment')
    .requiredOption('--comment-id <id>', 'Comment ID')
    .requiredOption('--body <text>', 'Reply text')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createThreadedComment(Number(opts.commentId), {
          comment_text: opts.body,
        });
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Reply posted.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  return cmd;
}
