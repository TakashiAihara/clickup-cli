import {
  setAccessToken,
  gettimeentrieswithinadaterange,
  createatimeentry,
  getsingulartimeentry,
  updateatimeEntry,
  deleteatimeEntry,
  startatimeEntry,
  stopatimeEntry,
  getrunningtimeentry,
} from '@clickup/api';
import type {
  Gettimeentrieswithinadaterange200,
  GettimeentrieswithinadaterangeParams,
  CreateatimeentryBody,
  UpdateatimeEntryBody,
  StartatimeEntryBody,
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

export function createTimeTrackingCommand(): Command {
  const cmd = new Command('time').description('Time tracking operations');

  cmd
    .command('list')
    .description('List time entries within a date range')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--start <ms>', 'Start date (unix ms)')
    .option('--end <ms>', 'End date (unix ms)')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const params: GettimeentrieswithinadaterangeParams = {};
        if (opts.start) params.start_date = Number(opts.start);
        if (opts.end) params.end_date = Number(opts.end);
        const result = await gettimeentrieswithinadaterange(Number(opts.teamId), params);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const entries = (result as Gettimeentrieswithinadaterange200).data ?? [];
          for (const e of entries) {
            const dur = e.duration ? `${Math.round(Number(e.duration) / 60000)}m` : '-';
            console.log(`${e.id}\t${dur}\t${e.task?.name ?? '-'}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('show <timerId>')
    .description('Show a time entry')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (timerId, opts) => {
      try {
        ensureAuth();
        const result = await getsingulartimeentry(Number(opts.teamId), timerId);
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create')
    .description('Create a time entry')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--duration <ms>', 'Duration in milliseconds')
    .option('--description <text>', 'Description')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const body: Partial<CreateatimeentryBody> = {
          tid: opts.taskId,
          duration: Number(opts.duration),
        };
        if (opts.description) body.description = opts.description;
        const result = await createatimeentry(Number(opts.teamId), body as CreateatimeentryBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Time entry created.');
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('update <timerId>')
    .description('Update a time entry')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--duration <ms>', 'New duration in milliseconds')
    .option('--description <text>', 'New description')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (timerId, opts) => {
      try {
        ensureAuth();
        const body: Partial<UpdateatimeEntryBody> = {};
        if (opts.duration) body.duration = Number(opts.duration);
        if (opts.description) body.description = opts.description;
        const result = await updateatimeEntry(Number(opts.teamId), Number(timerId), body as UpdateatimeEntryBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Time entry updated.');
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('delete <timerId>')
    .description('Delete a time entry')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (timerId, opts) => {
      try {
        ensureAuth();
        await deleteatimeEntry(Number(opts.teamId), Number(timerId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: timerId }));
        } else {
          console.log(`Time entry ${timerId} deleted.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('start')
    .description('Start a timer')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--description <text>', 'Description')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const body: Partial<StartatimeEntryBody> = { tid: opts.taskId };
        if (opts.description) body.description = opts.description;
        const result = await startatimeEntry(Number(opts.teamId), body as StartatimeEntryBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Timer started.');
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('stop')
    .description('Stop the running timer')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await stopatimeEntry(Number(opts.teamId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Timer stopped.');
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('running')
    .description('Get the current running timer')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getrunningtimeentry(Number(opts.teamId));
        console.log(JSON.stringify(result, null, 2));
      } catch (e) {
        handleError(e);
      }
    });

  return cmd;
}
