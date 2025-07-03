#!/usr/bin/env node

import { Command } from 'commander';
import { createAuthCommand, createTasksCommand, createSpacesCommand, createListsCommand } from '../../../packages/clickup-cli-core/dist/index.js';

const program = new Command();

program
  .name('clickup')
  .description('ClickUp CLI - Manage your ClickUp workspace from the command line')
  .version('0.1.0');

program.addCommand(createAuthCommand());
program.addCommand(createTasksCommand());
program.addCommand(createSpacesCommand());
program.addCommand(createListsCommand());

program.parse();