# Quickstart: Basic Task CRUD

**Feature**: 001-basic-task-crud
**Date**: 2026-03-16

This guide helps developers (and AI agents) get started with the task management commands quickly.

---

## Prerequisites

- Node.js 18+ or Bun 1.0+
- ClickUp API token (get from https://app.clickup.com/settings/profile → Apps → API)
- Repository cloned and dependencies installed: `npm install`

---

## Build & Setup

```bash
# From repo root
npm run build
# Output: packages/clickup-cli-core/dist/, packages/clickup-api/dist/, apps/cli/dist/
```

**Note**: For developer convenience, you can also run in watch mode:
```bash
npm run dev  # Turbo watches all packages
```

---

## Authentication

```bash
# Interactive login (recommended first time)
node apps/cli/dist/index.js auth login

# You'll be prompted for your API token. It will be saved to:
# ~/.clickup-cli/config.json (permissions 0600)
```

Verify:
```bash
node apps/cli/dist/index.js auth status
# Expected output (table):
# Team: My Workspace
# User: john.doe@example.com
# Authenticated: true
```

---

## Task Operations

### 1. List Tasks

```bash
# First, get your list ID from ClickUp UI or via spaces/lists commands
node apps/cli/dist/index.js tasks list --list-id <LIST_ID> --output table
```

Example output (table):
```
┌──────────────────────┬─────────────────────┬──────────┬──────────────┬────────────┐
│ ID                   │ Name                │ Status   │ Assignee     │ Due Date   │
├──────────────────────┼─────────────────────┼──────────┼──────────────┼────────────┤
│ 9x8y7z               │ Implement login     │ in progress │ alice       │ 2026-03-20 │
│ a1b2c3               │ Write documentation │ open        │ -           │ -          │
└──────────────────────┴─────────────────────┴──────────┴──────────────┴────────────┘
```

JSON output (AI-friendly):
```bash
node apps/cli/dist/index.js tasks list --list-id <LIST_ID> --output json
```
```json
[
  {
    "id": "9x8y7z",
    "name": "Implement login",
    "status": "in progress",
    "assignee": { "id": "...", "username": "alice" },
    "due_date": 1745000000000,
    "list_id": "..."
  },
  { ... }
]
```

---

### 2. Create Task

```bash
# Minimal (required only)
node apps/cli/dist/index.js tasks create --list-id <LIST_ID> --name "New task"

# Full args
node apps/cli/dist/index.js tasks create \
  --list-id <LIST_ID> \
  --name "Fix bug #123" \
  --description "User cannot login on Safari" \
  --status "open" \
  --priority "high" \
  --tags "bug", "login"
```

Interactive mode (guided prompts):
```bash
node apps/cli/dist/index.js tasks create --interactive
```

---

### 3. Show Task Details

```bash
node apps/cli/dist/index.js tasks show <TASK_ID> --output json
```

JSON output is deterministic; AI agents can reliably parse.

---

### 4. Update Task

```bash
# Change status
node apps/cli/dist/index.js tasks update <TASK_ID> --status "done"

# Change multiple fields
node apps/cli/dist/index.js tasks update <TASK_ID> \
  --name "New title" \
  --priority "high" \
  --assignee <USER_ID>

# Clear due date (use "null")
node apps/cli/dist/index.js tasks update <TASK_ID> --due-date null
```

---

### 5. Delete Task

```bash
# With confirmation prompt
node apps/cli/dist/index.js tasks delete <TASK_ID>

# Non-interactive (CI/CD)
node apps/cli/dist/index.js tasks delete <TASK_ID> --confirm
```

---

## Tips for AI Agents

1. **Always use `--output json`** for programmatic consumption
2. **Check exit codes**: 0=success, non-zero=error (see contracts)
3. **Validate inputs** before API calls using Zod schemas (if inside codebase)
4. **Error structure**: On failure, stderr contains human-readable; stdout contains `{ "error": { "code": "...", "message": "..." } }`
5. **Authentication**: Call `auth status` first; if exit 2, run `auth login`

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Authentication required" (exit 2) | No token saved | Run `auth login` |
| "Invalid token" (exit 3) | Token revoked/expired | Re-authenticate |
| "List not found" (exit 4) | Wrong `--list-id` | Verify in ClickUp UI |
| "Validation error" (exit 1) | Invalid input (status, date) | Check allowed enums in spec |
| Network timeout (exit 8) | Connection issue | Retry with exponential backoff |

For more details, see `research.md` and `contracts/commands.md`.
