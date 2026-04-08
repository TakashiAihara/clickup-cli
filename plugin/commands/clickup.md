---
allowed-tools: Bash(clickup:*)
description: Run any clickup CLI command
---

## Context

- Auth status: !`clickup auth status 2>&1 || echo "Not authenticated"`

## Your task

Run the clickup CLI command the user requested. Use `--output json` when processing results programmatically.

If the user is not authenticated, guide them to run `clickup auth login`.

Available top-level commands:
- `clickup auth` - Authentication management
- `clickup tasks` - Task operations (CRUD, dependencies, links, time, checklists, tags, attachments)
- `clickup spaces` - Space operations (CRUD, fields, tags, templates)
- `clickup folders` - Folder operations (CRUD, fields, guests, templates)
- `clickup lists` - List operations (CRUD, fields, members, guests, task move, templates)
- `clickup comments` - Comment operations (CRUD, threaded replies)
- `clickup views` - View operations (CRUD, tasks, comments)
- `clickup goals` - Goal operations
- `clickup time` - Time tracking (workspace-level)
- `clickup tags` - Tag operations
- `clickup webhooks` - Webhook operations
- `clickup custom-fields` - Custom field operations

Use `clickup <command> --help` to see available subcommands and options.
