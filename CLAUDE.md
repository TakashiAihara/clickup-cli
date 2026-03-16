# ClickUp CLI Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-16

## Active Technologies

- **Language**: TypeScript 5.3+ (strict mode)
- **Runtime**: Bun (for building single binary)
- **CLI Framework**: Commander
- **API Client**: Generated via Orval from ClickUp OpenAPI spec
- **Validation**: Zod (runtime schemas)
- **Styling**: Chalk (interactive mode only; JSON mode no color)
- **Testing**: Vitest
- **Build**: Turbo monorepo

## Project Structure

```text
packages/
├── clickup-api/              # Generated client (do not edit manually)
│   ├── src/generated/
│   └── openapi/
└── clickup-cli-core/         # Core CLI commands and business logic
    ├── src/
    │   ├── commands/         # Command implementations (auth, tasks, etc.)
    │   ├── config.ts         # Configuration management
    │   ├── validation/       # Zod schemas
    │   └── utils/            # Formatters, error handling
    └── tests/
apps/
└── cli/                      # Main entry point
    └── src/index.ts          # Commander program setup
```

## Commands

### Authentication
- `auth login` - Store API token (interactive)
- `auth status` - Check auth status
- `auth logout` - Remove token

### Tasks
- `tasks list --list-id <id>` - List tasks (supports `--output json|table`)
- `tasks create` - Create new task (CLI args or `--interactive`)
- `tasks show <id>` - Show task details
- `tasks update <id>` - Update task fields
- `tasks delete <id> --confirm` - Delete task

Global options:
- `--output <json|table>` - Output format (default table)
- `--config <path>` - Override config file
- `--verbose` - Debug logging

## Code Style

**TypeScript**:
- Strict mode enabled
- No `any` types (except test fixtures)
- Functions ≤ 50 lines; prefer pure functions over classes
- Classes only for stateful services (e.g., API client)
- Explicit return types for public functions

**Imports**: Use absolute imports from package root (`@clickup/cli-core/...`)

**Error Handling**: Throw typed errors; catch at command boundary; set proper exit codes.

**Constitution Compliance**:
- Schema-Driven: Use generated API types + Zod validation
- CLI-First: Dual output (JSON deterministic, no ANSI)
- Configuration: 0600, token masking
- Test Discipline: Target ≥80% coverage

## Recent Changes

### 001-basic-task-crud (2026-03-16)
- Implemented core task CRUD operations
- Added authentication command (secure token storage)
- Dual output format (table/JSON for AI)
- Zod validation for all inputs
- Functions-first code architecture

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific notes here (they persist across updates) -->
<!-- MANUAL ADDITIONS END -->
