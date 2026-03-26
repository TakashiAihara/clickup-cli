import {
  setAccessToken,
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpaceAvailableFields,
  getSpaceTags,
  createSpaceTag,
  editSpaceTag,
  deleteSpaceTag,
  createFolderFromTemplate,
  createSpaceListFromTemplate,
} from '@clickup/api';
import type {
  GetSpaces200,
  CreateSpaceBody,
  CreateSpace200,
  UpdateSpaceBody,
  GetSpaceAvailableFields200,
  GetSpaceTags200,
  CreateSpaceTagBody,
  EditSpaceTagBody,
  DeleteSpaceTagBody,
  CreateFolderFromTemplateBody,
  CreateSpaceListFromTemplateBody,
} from '@clickup/api';
import { Command } from 'commander';

import { getToken } from '../config.js';
import { handleError, CliError, ExitCodes } from '../utils/errors.js';
import type { OutputFormat } from '../utils/format.js';

function ensureAuth(): void {
  const token = getToken();
  if (!token)
    throw new CliError('Authentication required. Run: clickup auth login', 'AUTH_REQUIRED', ExitCodes.AUTH_REQUIRED);
  setAccessToken(token);
}

export function createSpacesCommand(): Command {
  const cmd = new Command('spaces').description('Space operations');

  cmd
    .command('list')
    .description('List spaces in a workspace')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getSpaces(Number(opts.teamId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const spaces = (result as GetSpaces200).spaces ?? [];
          for (const s of spaces) {
            console.log(`${s.id}\t${s.name}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create')
    .description('Create a space')
    .requiredOption('--team-id <id>', 'Workspace/team ID')
    .requiredOption('--name <name>', 'Space name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createSpace(Number(opts.teamId), {
          name: opts.name,
        } as CreateSpaceBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const created = result as CreateSpace200;
          console.log(`Space created: ${created.name ?? created.id}`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('update <spaceId>')
    .description('Update a space')
    .option('--name <name>', 'New name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (spaceId, opts) => {
      try {
        ensureAuth();
        const body: Partial<UpdateSpaceBody> = {};
        if (opts.name) body.name = opts.name;
        const result = await updateSpace(Number(spaceId), body as UpdateSpaceBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Space updated.');
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('delete <spaceId>')
    .description('Delete a space')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (spaceId, opts) => {
      try {
        ensureAuth();
        await deleteSpace(Number(spaceId));
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, id: spaceId }));
        } else {
          console.log(`Space ${spaceId} deleted.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('fields')
    .description('List available custom fields in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await getSpaceAvailableFields(Number(opts.spaceId));
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          const fields = (result as GetSpaceAvailableFields200).fields ?? [];
          for (const f of fields) {
            console.log(`${f.id}\t${f.name}\t${f.type ?? '-'}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('tags')
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
          const tags = (result as GetSpaceTags200).tags ?? [];
          for (const t of tags) {
            console.log(`${t.name}`);
          }
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create-tag')
    .description('Create a tag in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createSpaceTag(Number(opts.spaceId), {
          tag: { name: opts.name },
        } as CreateSpaceTagBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Tag created: ${opts.name}`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('edit-tag')
    .description('Edit a tag in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'Current tag name')
    .requiredOption('--new-name <newName>', 'New tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await editSpaceTag(Number(opts.spaceId), opts.name, {
          tag: { name: opts.newName },
        } as EditSpaceTagBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Tag renamed: ${opts.name} → ${opts.newName}`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('delete-tag')
    .description('Delete a tag from a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--name <name>', 'Tag name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        await deleteSpaceTag(Number(opts.spaceId), opts.name, {} as DeleteSpaceTagBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify({ deleted: true, tag: opts.name }));
        } else {
          console.log(`Tag "${opts.name}" deleted.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create-folder-from-template')
    .description('Create a folder from a template')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--template-id <id>', 'Template ID')
    .requiredOption('--name <name>', 'Folder name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createFolderFromTemplate(opts.spaceId, opts.templateId, {
          name: opts.name,
        } as CreateFolderFromTemplateBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Folder created from template.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  cmd
    .command('create-list-from-template')
    .description('Create a list from a template in a space')
    .requiredOption('--space-id <id>', 'Space ID')
    .requiredOption('--template-id <id>', 'Template ID')
    .requiredOption('--name <name>', 'List name')
    .option('--output <format>', 'Output format (table|json)', 'table')
    .action(async (opts) => {
      try {
        ensureAuth();
        const result = await createSpaceListFromTemplate(opts.spaceId, opts.templateId, {
          name: opts.name,
        } as CreateSpaceListFromTemplateBody);
        if (opts.output === 'json') {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`List created from template.`);
        }
      } catch (e) {
        handleError(e);
      }
    });

  return cmd;
}
