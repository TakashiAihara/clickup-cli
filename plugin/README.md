# ClickUp CLI Plugin for Claude Code

Manage ClickUp workspaces, tasks, and projects directly from Claude Code.

## Features

- **Commands**: `/clickup`, `/clickup-tasks`, `/clickup-browse`
- **Skills**: Task management, hierarchy navigation, comments/time/tags reference
- **Hook**: Auto-checks CLI installation on session start

## Installation

### 1. Install the CLI

```bash
# Linux (x64)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-linux-x64 -o /usr/local/bin/clickup
chmod +x /usr/local/bin/clickup

# macOS (Apple Silicon)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-darwin-arm64 -o /usr/local/bin/clickup
chmod +x /usr/local/bin/clickup
```

### 2. Authenticate

```bash
clickup auth login
```

### 3. Install the plugin

Add to your project's `.claude/settings.json`:

```json
{
  "plugins": ["https://github.com/TakashiAihara/clickup-cli/tree/main/plugin"]
}
```

Or install via Claude Code:

```
/plugin install https://github.com/TakashiAihara/clickup-cli/tree/main/plugin
```

## Commands

| Command | Description |
|---------|-------------|
| `/clickup` | Run any clickup CLI command |
| `/clickup-tasks` | Manage tasks (create, update, dependencies, time tracking) |
| `/clickup-browse` | Browse workspace hierarchy interactively |

## Skills

The plugin provides contextual skills that Claude uses automatically:

- **clickup-tasks**: Task CRUD, dependencies, links, time tracking, checklists, tags, attachments
- **clickup-hierarchy**: Spaces, folders, lists, views management
- **clickup-comments-time**: Comments, time tracking, tags, goals, webhooks, custom fields, auth
