import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import {
  setAccessToken,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';
import { printTaskTable, printTaskDetail, type OutputFormat } from '../utils/format.js';
import { createTaskSchema, updateTaskSchema } from '../validation/schemas.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) {
    throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  }
  setAccessToken(token);
}

export function createTasksCommand(): Command {
  const tasks = new Command('tasks').description('Task operations');

  tasks
    .command('list')
    .description('List tasks in a list')
    .requiredOption('--list-id <id>', 'ClickUp list ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .option('--status <status>', 'Filter by status')
    .option('--assignee <id>', 'Filter by assignee')
    .option('--page <number>', 'Page number', '0')
    .action(async (opts) => {
      try {
        ensureAuth();

        const params: Record<string, any> = {
          page: parseInt(opts.page, 10),
        };
        if (opts.status) params.statuses = [opts.status];
        if (opts.assignee) params.assignees = [opts.assignee];

        const result = await getTasks(Number(opts.listId), params);

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const taskList = (result as any).tasks ?? result;
          printTaskTable(Array.isArray(taskList) ? taskList : []);
        }
      } catch (error) {
        handleError(error);
      }
    });

  tasks
    .command('show <taskId>')
    .description('Show task details')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (taskId, opts) => {
      try {
        ensureAuth();

        const result = await getTask(taskId, {});

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          printTaskDetail(result);
        }
      } catch (error) {
        handleError(error);
      }
    });

  tasks
    .command('create')
    .description('Create a new task')
    .requiredOption('--list-id <id>', 'ClickUp list ID')
    .requiredOption('--name <name>', 'Task name')
    .option('--description <text>', 'Task description')
    .option('--status <status>', 'Task status')
    .option('--priority <number>', 'Priority (1=urgent, 2=high, 3=normal, 4=low)')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();

        const body: Record<string, any> = { name: opts.name };
        if (opts.description) body.description = opts.description;
        if (opts.status) body.status = opts.status;
        if (opts.priority) body.priority = parseInt(opts.priority, 10);
        if (opts.tags) body.tags = opts.tags.split(',').map((t: string) => t.trim());

        const parsed = createTaskSchema.safeParse(body);
        if (!parsed.success) {
          const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new CliError(`Validation error: ${msg}`, 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);
        }

        const result = await createTask(Number(opts.listId), parsed.data);

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Task created: ${(result as any).name ?? (result as any).id}`);
          printTaskDetail(result);
        }
      } catch (error) {
        handleError(error);
      }
    });

  tasks
    .command('update <taskId>')
    .description('Update a task')
    .option('--name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--status <status>', 'New status')
    .option('--priority <number>', 'New priority (1-4, or "null" to clear)')
    .option('--tags <tags>', 'Comma-separated tags (replaces all)')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (taskId, opts) => {
      try {
        ensureAuth();

        const body: Record<string, any> = {};
        if (opts.name) body.name = opts.name;
        if (opts.description) body.description = opts.description;
        if (opts.status) body.status = opts.status;
        if (opts.priority) {
          body.priority = opts.priority === 'null' ? null : parseInt(opts.priority, 10);
        }
        if (opts.tags) body.tags = opts.tags.split(',').map((t: string) => t.trim());

        if (Object.keys(body).length === 0) {
          throw new CliError('No fields to update. Use --name, --status, etc.', 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);
        }

        const parsed = updateTaskSchema.safeParse(body);
        if (!parsed.success) {
          const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new CliError(`Validation error: ${msg}`, 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);
        }

        const result = await updateTask(taskId, parsed.data as any, {});

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Task updated.');
          printTaskDetail(result);
        }
      } catch (error) {
        handleError(error);
      }
    });

  tasks
    .command('delete <taskId>')
    .description('Delete a task')
    .option('--confirm', 'Skip confirmation prompt')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (taskId, opts) => {
      try {
        ensureAuth();

        if (!opts.confirm) {
          const ok = await confirm({ message: `Delete task ${taskId}?`, default: false });
          if (!ok) {
            console.log('Cancelled.');
            process.exit(ExitCodes.GENERAL);
          }
        }

        await deleteTask(taskId, {});

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify({ deleted: true, id: taskId }));
        } else {
          console.log(`Task ${taskId} deleted.`);
        }
      } catch (error) {
        handleError(error);
      }
    });

  return tasks;
}
