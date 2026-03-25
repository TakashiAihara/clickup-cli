import { Command } from 'commander';

import { createAuthCommand } from './commands/auth.js';
import { createCommentsCommand } from './commands/comments.js';
import { createCustomFieldsCommand } from './commands/custom-fields.js';
import { createFoldersCommand } from './commands/folders.js';
import { createGoalsCommand } from './commands/goals.js';
import { createListsCommand } from './commands/lists.js';
import { createSpacesCommand } from './commands/spaces.js';
import { createTagsCommand } from './commands/tags.js';
import { createTasksCommand } from './commands/tasks.js';
import { createTimeTrackingCommand } from './commands/time-tracking.js';
import { createViewsCommand } from './commands/views.js';
import { createWebhooksCommand } from './commands/webhooks.js';

const program = new Command();

program.name('clickup').description('ClickUp CLI - Manage ClickUp resources from the command line').version('0.1.0');

program.addCommand(createAuthCommand());
program.addCommand(createTasksCommand());
program.addCommand(createSpacesCommand());
program.addCommand(createListsCommand());
program.addCommand(createFoldersCommand());
program.addCommand(createCommentsCommand());
program.addCommand(createGoalsCommand());
program.addCommand(createTimeTrackingCommand());
program.addCommand(createViewsCommand());
program.addCommand(createWebhooksCommand());
program.addCommand(createTagsCommand());
program.addCommand(createCustomFieldsCommand());

program.parse();
