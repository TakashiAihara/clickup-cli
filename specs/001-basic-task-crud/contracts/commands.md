# CLI Command Contracts

**Feature**: 001-basic-task-crud
**Date**: 2026-03-16

This document defines the public interface contracts exposed by the ClickUp CLI for task management.

## Contract Philosophy

Per Constitution IV. CLI-First Interface, all functionality is accessible via Commander-based commands with consistent argument/option handling and dual output modes.

---

## Command: `auth`

### Subcommands

#### `auth login`

**Purpose**: Store ClickUp API token securely.

**Arguments**: None

**Options**:
- `--token <string>`: Provide token via CLI (not recommended; use interactive)

**Interaction**: If no `--token`, prompt user for token (hidden input).

**Output (success)**:
- Table: "Authentication successful. Team: [Team Name]"
- JSON: `{ "authenticated": true, "team": { "id": "...", "name": "..." } }`

**Exit Codes**:
- 0: Success
- 1: Validation/API error (token invalid)

**Side Effects**: Write `~/.clickup-cli/config.json` with mode 0600.

---

#### `auth status`

**Purpose**: Check current authentication status.

**Arguments**: None

**Options**: None

**Output**:
- If authenticated: Team name, user email, token validity
- If not: "Not authenticated. Run: clickup-cli auth login"

**Exit Codes**:
- 0: Authenticated
- 2: Not authenticated
- 3: Config file error

---

#### `auth logout`

**Purpose**: Remove stored token.

**Arguments**: None

**Options**:
- `--confirm`: Skip confirmation prompt (non-interactive)

**Output**: "Logged out. Token removed."

**Exit Codes**:
- 0: Success
- 1: Cancelled or error

---

## Command: `tasks`

All `tasks` commands accept `--output <table|json>` and `--config <path>`.

#### `tasks list`

**Purpose**: List tasks in a list with optional filters.

**Arguments**: None

**Required Options**:
- `--list-id <uuid>`: ClickUp list identifier

**Optional Options**:
- `--status <string>`: Filter by status (e.g., "open", "in progress", "done")
- `--assignee <uuid>`: Filter by assignee user ID
- `--due-date <date>`: Filter by due date (YYYY-MM-DD or relative: "today", "tomorrow")
- `--limit <number>`: Max results (default: 100, max: 500)
- `--page <number>`: Pagination (if API supports)

**Output**:
- `table`: Columns: ID | Name | Status | Assignee | Due Date
- `json`: Array of full Task objects (as per data-model.md)

**Exit Codes**:
- 0: Success
- 4: List not found
- 8: Network error
- 9: API error

---

#### `tasks create`

**Purpose**: Create a new task.

**Arguments**: None

**Required Options** (at least `--name` or interactive):
- `--name <string>`: Task title (1-500 chars)
- `--list-id <uuid>`: Parent list

**Optional Options**:
- `--description <string>`: Task description (rich text)
- `--status <string>`: Default: "open"
- `--assignee <uuid>`: Assign to user
- `--due-date <date>`: Due date
- `--tags <string[]>`: Up to 10 tags
- `--priority <string>`: "urgent"/"high"/"normal"/"low"
- `--interactive`: Launch inquirer prompts for all fields

**Interactive Prompts** (when `--interactive` or no required args):
1. List ID (text input, validated as UUID)
2. Task name (text, required)
3. Description (multiline, optional)
4. Status (select from 5 enum)
5. Assignee (optional, username/uuid lookup)
6. Due date (date picker)
7. Tags (comma-separated)
8. Priority (select)

**Output**: Created task object (full details including ID).

**Exit Codes**:
- 0: Success
- 1: Validation error
- 5: API error (400/422)
- 6: API error (500+)

---

#### `tasks show <task-id>`

**Purpose**: Display full task details.

**Arguments**:
- `<task-id>`: Task UUID (required)

**Options**:
- `--raw`: Output raw API response (no formatting)

**Output**:
- `table`: Key-value pairs of all fields
- `json`: Full Task object
- `--raw`: Exactly as API returns

**Exit Codes**:
- 0: Success
- 4: Task not found
- 8: Network error

---

#### `tasks update <task-id>`

**Purpose**: Modify existing task.

**Arguments**:
- `<task-id>`: Task UUID (required)

**Options** (any combination, partial update):
- `--name <string>`: New name
- `--description <string>`: New description
- `--status <string>`: New status
- `--assignee <uuid>`: New assignee (use `null` to unassign)
- `--due-date <date|null>`: Set or clear due date
- `--tags <string[]>`: Replace tags entirely
- `--priority <string>`: New priority

**Output**: Updated task object.

**Exit Codes**:
- 0: Success
- 1: Validation error
- 4: Task not found
- 5: API error (400/422)
- 6: API error (500+)

---

#### `tasks delete <task-id>`

**Purpose**: Delete a task permanently.

**Arguments**:
- `<task-id>`: Task UUID (required)

**Options**:
- `--confirm`: Skip confirmation (non-interactive)

**Interactive**: If no `--confirm`, prompt "Delete task <id>? (y/N)"

**Output**: Confirmation message (unless `--json` for machine parsing: `{ "deleted": true, "id": "..." }`)

**Exit Codes**:
- 0: Success
- 4: Task not found
- 5: API error (403 forbidden)
- User cancel (N at prompt): exit 1

---

## Common Options (all commands)

- `--output <format>`: Output format (`table` default, `json` for AI)
- `--config <path>`: Override config file location
- `--verbose`: Debug logging (stderr)
- `-h, --help`: Show help

---

## Output Contract (AI-oriented)

When `--output json` is used:

1. **No ANSI escape codes** in stdout (colors/styling only in stderr if verbose)
2. **Deterministic key order**: JSON.stringify with sorted keys or explicit order (id, name, status, assignee, due_date, etc.)
3. **Timestamps**: Unix milliseconds (number), never ISO string or relative
4. **Nullability**: Explicit `null` for absent optional fields (no field omission)
5. **Error payload** (on failure): `{ "error": { "code": "STRING", "message": "...", "details": {...} } }` with exit code 1

---

## Implementation Notes

- Commands implemented in `packages/clickup-cli-core/src/commands/`
- Each command as pure function: `(context: CommandContext, options: Options) => Promise<Result>`
- API client instantiated once per command execution (not singleton)
- All input validation via Zod before any network call
- Errors caught at top-level, formatted, exit code set appropriately
