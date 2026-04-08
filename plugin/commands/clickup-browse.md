---
allowed-tools: Bash(clickup:*)
description: Browse ClickUp workspace hierarchy (spaces → folders → lists → tasks)
---

## Context

- Auth status: !`clickup auth status 2>&1 || echo "Not authenticated"`

## Your task

Help the user explore their ClickUp workspace hierarchy. Start from the top and drill down:

1. First, list workspaces if team-id is unknown
2. Then list spaces in a workspace
3. Then list folders/lists in a space
4. Then list tasks in a list

Use `--output json` for all commands and present results as formatted tables.

```bash
# Step 1: Get workspaces (user needs to provide team-id or check auth status)
clickup auth status --output json

# Step 2: List spaces
clickup spaces list --team-id <TEAM_ID> --output json

# Step 3: List folders in a space
clickup folders list --space-id <SPACE_ID> --output json

# Step 4: List lists in a folder (or folderless)
clickup lists list --folder-id <FOLDER_ID> --output json
clickup lists folderless --space-id <SPACE_ID> --output json

# Step 5: List tasks
clickup tasks list --list-id <LIST_ID> --output json
```

Guide the user through each level, showing IDs they can use for the next step.
