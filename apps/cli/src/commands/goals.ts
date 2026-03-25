import { Command } from 'commander';
import { setAccessToken, getGoals, getGoal, createGoal, updateGoal, deleteGoal } from '@clickup/api';
import type { GetGoals200, GetGoal200, CreateGoalBody, CreateGoal200, UpdateGoalBody } from '@clickup/api';
import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token) throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createGoalsCommand(): Command {
  const cmd = new Command('goals').description('Goal operations');

  cmd
    .command('list')
    .description('List goals')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getGoals(Number(opts.teamId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const goals = (result as GetGoals200).goals ?? [];
          for (const g of goals) {
            console.log(`${g.id}\t${g.name}`);
          }
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('show <goalId>')
    .description('Show goal details')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (goalId, opts) => {
      try {
        ensureAuth();
        const result = await getGoal(goalId);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const g = (result as GetGoal200).goal ?? result;
          console.log(`ID:   ${g.id}`);
          console.log(`Name: ${g.name}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('create')
    .description('Create a goal')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--name <name>', 'Goal name')
    .option('--description <text>', 'Goal description')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const body: Partial<CreateGoalBody> = { name: opts.name };
        if (opts.description) body.description = opts.description;
        const result = await createGoal(Number(opts.teamId), body as CreateGoalBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Goal created: ${(result as CreateGoal200).goal?.name ?? (result as CreateGoal200).goal?.id}`);
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('update <goalId>')
    .description('Update a goal')
    .option('--name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (goalId, opts) => {
      try {
        ensureAuth();
        const body: Partial<UpdateGoalBody> = {};
        if (opts.name) body.name = opts.name;
        if (opts.description) body.description = opts.description;
        const result = await updateGoal(goalId, body as UpdateGoalBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Goal updated.');
        }
      } catch (e) { handleError(e); }
    });

  cmd
    .command('delete <goalId>')
    .description('Delete a goal')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (goalId, opts) => {
      try {
        ensureAuth();
        await deleteGoal(goalId);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: goalId }));
        } else {
          console.log(`Goal ${goalId} deleted.`);
        }
      } catch (e) { handleError(e); }
    });

  return cmd;
}
