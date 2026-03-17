import { Command } from 'commander';
import { createAuthCommand } from './commands/auth.js';
import { createTasksCommand } from './commands/tasks.js';

const program = new Command();

program
  .name('clickup')
  .description('ClickUp CLI - Manage tasks from the command line')
  .version('0.1.0');

program.addCommand(createAuthCommand());
program.addCommand(createTasksCommand());

program.parse();
