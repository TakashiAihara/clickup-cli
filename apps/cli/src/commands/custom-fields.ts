import { Command } from 'commander';
import { setAccessToken, getAccessibleCustomFields, setCustomFieldValue, removeCustomFieldValue } from '@clickup/api';
import type { GetAccessibleCustomFields200, SetCustomFieldValueBody } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createCustomFieldsCommand(): Command {
  const cmd = new Command('custom-fields').description('Custom field operations');

  cmd
    .command('list')
    .description('List accessible custom fields for a list')
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
      } catch (e) { handleError(e); }
    });

  cmd
    .command('set')
    .description('Set a custom field value on a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--field-id <id>', 'Custom field ID')
    .requiredOption('--value <value>', 'Value (JSON string for complex types)')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        let value: unknown = opts.value;
        try { value = JSON.parse(opts.value); } catch {}
        const result = await setCustomFieldValue(opts.taskId, opts.fieldId, { value } as SetCustomFieldValueBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Custom field value set.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('remove')
    .description('Remove a custom field value from a task')
    .requiredOption('--task-id <id>', 'Task ID')
    .requiredOption('--field-id <id>', 'Custom field ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await removeCustomFieldValue(opts.taskId, opts.fieldId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ removed: true, task: opts.taskId, field: opts.fieldId }));
        } else {
          console.log('Custom field value removed.');
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
