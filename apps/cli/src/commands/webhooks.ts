import { Command } from 'commander';
import { setAccessToken, getWebhooks, createWebhook, updateWebhook, deleteWebhook } from '@clickup/api';
import type { GetWebhooks200, CreateWebhookBody, CreateWebhook200, UpdateWebhookBody } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createWebhooksCommand(): Command {
  const cmd = new Command('webhooks').description('Webhook operations');

  cmd
    .command('list')
    .description('List webhooks')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getWebhooks(Number(opts.teamId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const hooks = (result as GetWebhooks200).webhooks ?? [];
          for (const h of hooks) {
            console.log(`${h.id}\t${h.endpoint}\t${h.status ?? '-'}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a webhook')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--endpoint <url>', 'Webhook endpoint URL')
    .requiredOption('--events <events>', 'Comma-separated events (e.g. taskCreated,taskUpdated)')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const body = {
          endpoint: opts.endpoint,
          events: opts.events.split(',').map((e: string) => e.trim()),
        };
        const result = await createWebhook(Number(opts.teamId), body as CreateWebhookBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Webhook created: ${(result as CreateWebhook200).id ?? 'ok'}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <webhookId>')
    .description('Update a webhook')
    .option('--endpoint <url>', 'New endpoint URL')
    .option('--events <events>', 'Comma-separated events')
    .option('--status <status>', 'active or inactive')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (webhookId, opts) => {
      try {
        ensureAuth();
        const body: Partial<UpdateWebhookBody> = {};
        if (opts.endpoint) body.endpoint = opts.endpoint;
        if (opts.events) body.events = opts.events.split(',').map((e: string) => e.trim()).join(',');
        if (opts.status) body.status = opts.status;
        const result = await updateWebhook(webhookId, body as UpdateWebhookBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Webhook updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <webhookId>')
    .description('Delete a webhook')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (webhookId, opts) => {
      try {
        ensureAuth();
        await deleteWebhook(webhookId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: webhookId }));
        } else {
          console.log(`Webhook ${webhookId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
