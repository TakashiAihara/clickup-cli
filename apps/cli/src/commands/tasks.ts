import { Command } from 'commander';
import { confirm } from '@inquirer/prompts';
import {
  setAccessToken,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addDependency,
  deleteDependency,
  addTaskLink,
  deleteTaskLink,
  gettrackedtime,
  tracktime,
  edittimetracked,
  deletetimetracked,
  createChecklist,
  getTaskMembers,
  addGuestToTask,
  removeGuestFromTask,
  addTagToTask,
  removeTagFromTask,
  createTaskAttachment,
  mergeTasks,
  getTaskSTimeinStatus,
  getBulkTasksTimeinStatus,
} from '@clickup/api';
import type {
  GetTasksParams,
  GetTasks200,
  CreateTask200,
  UpdateTaskBody,
  AddDependencyBody,
  DeleteDependencyParams,
  Gettrackedtime200,
  TracktimeBody,
  EdittimetrackedBody,
  GetTaskMembers200,
  AddGuestToTaskBody,
  CreateTaskAttachmentBody,
  MergeTasksBody,
  GetTaskSTimeinStatus200,
  GetBulkTasksTimeinStatusParams,
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

        const params: GetTasksParams = {
          page: parseInt(opts.page, 10),
        };
        if (opts.status) params.statuses = [opts.status];
        if (opts.assignee) params.assignees = [opts.assignee];

        const result = await getTasks(Number(opts.listId), params);

        const format = opts.output as OutputFormat;
        if (format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const taskList = (result as GetTasks200).tasks ?? result;
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

        const body: Record<string, unknown> = { name: opts.name };
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
          console.log(`Task created: ${(result as CreateTask200).name ?? (result as CreateTask200).id}`);
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

        const body: Record<string, unknown> = {};
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

        const result = await updateTask(taskId, parsed.data as UpdateTaskBody, {});

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

  // --- US1: Dependencies & Links ---

  tasks
    .command('add-dependency')
    .description('Add a dependency to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--depends-on <id>', 'Task ID this task depends on')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addDependency(opts.taskId, { depends_on: opts.dependsOn } as AddDependencyBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Dependency added: ${opts.taskId} depends on ${opts.dependsOn}`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('remove-dependency')
    .description('Remove a dependency from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--depends-on <id>', 'Dependent task ID to remove')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await deleteDependency(opts.taskId, { depends_on: opts.dependsOn } as unknown as DeleteDependencyParams);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Dependency removed.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('add-link')
    .description('Link two tasks together')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--links-to <id>', 'Task ID to link to')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addTaskLink(opts.taskId, opts.linksTo);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Task linked: ${opts.taskId} ↔ ${opts.linksTo}`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('remove-link')
    .description('Remove a link between two tasks')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--links-to <id>', 'Linked task ID to remove')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await deleteTaskLink(opts.taskId, opts.linksTo);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Link removed.`);
        }
      } catch (e) { handleError(e); }
    });

  // --- US2: Time tracking per task ---

  tasks
    .command('time')
    .description('List tracked time for a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await gettrackedtime(opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const data = (result as Gettrackedtime200).data ?? result;
          const entries: Record<string, unknown>[] = Array.isArray(data) ? data : [];
          for (const e of entries) {
            const dur = e.duration ? `${Math.round(Number(e.duration) / 60000)}m` : '-';
            const user = e.user as Record<string, unknown> | undefined;
            console.log(`${e.id}\t${dur}\t${user?.username ?? '-'}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('track-time')
    .description('Add a time entry to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--duration <ms>', 'Duration in milliseconds')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await tracktime(opts.taskId, { duration: Number(opts.duration) } as unknown as TracktimeBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Time tracked: ${Math.round(Number(opts.duration) / 60000)} minutes`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('edit-time')
    .description('Edit a time entry on a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--interval-id <id>', 'Time interval ID')
    .requiredOption('--duration <ms>', 'New duration in milliseconds')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await edittimetracked(opts.taskId, opts.intervalId, { duration: Number(opts.duration) } as unknown as EdittimetrackedBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Time entry updated.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('delete-time')
    .description('Delete a time entry from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--interval-id <id>', 'Time interval ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await deletetimetracked(opts.taskId, opts.intervalId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, intervalId: opts.intervalId }));
        } else {
          console.log(`Time entry deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  // --- US3: Checklist ---

  tasks
    .command('create-checklist')
    .description('Create a checklist on a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--name <name>', 'Checklist name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createChecklist(opts.taskId, { name: opts.name });
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Checklist "${opts.name}" created.`);
        }
      } catch (e) { handleError(e); }
    });

  // --- US5: Members & Guests ---

  tasks
    .command('members')
    .description('List members of a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getTaskMembers(opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const members = (result as GetTaskMembers200).members ?? [];
          for (const m of members) {
            console.log(`${m.id}\t${m.username ?? m.email ?? '-'}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('add-guest')
    .description('Add a guest to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--permission-level <level>', 'Permission level (read, comment, edit, create)', 'read')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addGuestToTask(opts.taskId, Number(opts.guestId), { permission_level: opts.permissionLevel } as AddGuestToTaskBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Guest ${opts.guestId} added to task.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('remove-guest')
    .description('Remove a guest from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--guest-id <id>', 'Guest ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeGuestFromTask(opts.taskId, Number(opts.guestId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, guestId: opts.guestId }));
        } else {
          console.log(`Guest ${opts.guestId} removed from task.`);
        }
      } catch (e) { handleError(e); }
    });

  // --- US6: Tags ---

  tasks
    .command('add-tag')
    .description('Add a tag to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--tag-name <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await addTagToTask(opts.taskId, opts.tagName);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Tag "${opts.tagName}" added to task.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('remove-tag')
    .description('Remove a tag from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--tag-name <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeTagFromTask(opts.taskId, opts.tagName);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, tag: opts.tagName }));
        } else {
          console.log(`Tag "${opts.tagName}" removed from task.`);
        }
      } catch (e) { handleError(e); }
    });

  // --- US7: Attach, Merge, Time in Status ---

  tasks
    .command('attach')
    .description('Attach a file to a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--file <path>', 'File path to attach')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const fs = await import('fs');
        if (!fs.existsSync(opts.file)) {
          throw new CliError(`File not found: ${opts.file}`, 'VALIDATION_ERROR', ExitCodes.VALIDATION_ERROR);
        }
        const fileData = fs.readFileSync(opts.file);
        const blob = new Blob([fileData]);
        const result = await createTaskAttachment(opts.taskId, blob as unknown as CreateTaskAttachmentBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`File attached to task.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('merge')
    .description('Merge a task into another task')
    .requiredOption('--task-id <id>', 'Task ID (merge target)')
    .requiredOption('--merge-with <id>', 'Task ID to merge into target')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await mergeTasks(opts.taskId, { source_task_ids: [opts.mergeWith] } as MergeTasksBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result ?? { merged: true }, null, 2));
        } else {
          console.log(`Task ${opts.mergeWith} merged into ${opts.taskId}.`);
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('time-in-status')
    .description('Show time spent in each status for a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getTaskSTimeinStatus(opts.taskId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const statuses = (result as GetTaskSTimeinStatus200).current_status ? [result] : ((result as Record<string, unknown>).data ?? []);
          for (const s of (Array.isArray(statuses) ? statuses : [])) {
            const total = s.total_time ? `${Math.round(Number(s.total_time.by_minute) / 60)}h` : '-';
            console.log(`${s.status ?? '-'}\t${total}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  tasks
    .command('bulk-time-in-status')
    .description('Show time in status for multiple tasks')
    .requiredOption('--task-ids <ids>', 'Comma-separated task IDs')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const taskIds = opts.taskIds.split(',').map((id: string) => id.trim());
        const result = await getBulkTasksTimeinStatus({ task_ids: taskIds } as unknown as GetBulkTasksTimeinStatusParams);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      } catch (e) { handleError(e); }
    });

  return tasks;
}
