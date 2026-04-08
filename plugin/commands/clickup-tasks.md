---
allowed-tools: Bash(clickup tasks:*)
description: List, create, update, or manage ClickUp tasks
---

## Context

- Auth status: !`clickup auth status 2>&1 || echo "Not authenticated"`

## Your task

Help the user manage ClickUp tasks. Parse their request and run the appropriate `clickup tasks` subcommand.

### Common operations

```bash
# List tasks
clickup tasks list --list-id <LIST_ID> --output json

# Create a task
clickup tasks create --list-id <LIST_ID> --name "Task name" --output json

# Show details
clickup tasks show <TASK_ID> --output json

# Update
clickup tasks update <TASK_ID> --name "..." --status "..." --output json

# Dependencies
clickup tasks add-dependency --task-id <ID> --depends-on <OTHER_ID>

# Time tracking
clickup tasks time --task-id <ID> --output json
clickup tasks track-time --task-id <ID> --duration <ms>

# Tags
clickup tasks add-tag --task-id <ID> --tag-name "tag"
```

Use `--output json` and parse the JSON to present results clearly to the user.
