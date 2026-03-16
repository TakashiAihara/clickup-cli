# Research Notes: Basic Task CRUD

**Date**: 2026-03-16
**Feature**: 001-basic-task-crud

This document consolidates research findings and design decisions made during planning phase.

## Technical Decisions

### 1. Zod Validation Strategy

**Decision**: Define Zod schemas for:
- CLI input arguments (tasks create/update)
- API request/response payloads (wrappers around generated types)
- Configuration file structure

**Rationale**: Constitution requires Schema-Driven Development with double-layer validation:
1. Compile-time: OpenAPI-generated TypeScript types (from orval)
2. Runtime: Zod schemas validate actual data, guard against spec drift

**Alternatives Considered**:
- Using only TypeScript types: rejected (no runtime validation)
- Using Yup/Joi: rejected (Zod already in dependencies, simpler API)

**Implementation**:
```typescript
// Example: task creation input
const createTaskSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(['open', 'in progress', 'review', 'done', 'closed']).optional(),
  assignee: z.string().uuid().optional(),
  due_date: z.number().int().positive().optional(),
});
```

---

### 2. Dual Output Format Design

**Decision**: Implement `--output <format>` flag with options:
- `table` (default): Human-friendly aligned columns, colors (chalk)
- `json`: Structured JSON, deterministic order, NO ANSI codes, suitable for AI/scripts

**Rationale**: Constitution IV. CLI-First Interface mandates both modes. AI agents require stable parseable output.

**Implementation**:
```typescript
type OutputFormat = 'table' | 'json';

function formatTask(task: Task, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(task, null, 2); // deterministic
  }
  // table format with chalk colors
}
```

---

### 3. Authentication Flow

**Decision**: Reuse existing `config.ts` module (if exists) or implement:
- `auth login`: Prompt for token, save to `~/.clickup-cli/config.json` with 0600
- `auth status`: Validate token via `/user` endpoint, show team info
- Token stored in memory only, cleared after use

**Rationale**: Constitution V. Configuration & Security requires secure storage.

**Edge Cases**:
- Invalid token: Clear stored config, prompt re-login
- Config file missing/ corrupted: Create fresh with proper permissions

---

### 4. Error Handling Standardization

**Decision**: Define error codes and messages:

| Code | Meaning | User Message | Exit Code |
|------|---------|--------------|-----------|
| AUTH_REQUIRED | No token configured | "Authentication required. Run: clickup-cli auth login" | 2 |
| INVALID_TOKEN | Token invalid/expired | "Invalid or expired token. Please re-authenticate." | 3 |
| NOT_FOUND | Resource not found | "Task not found (ID: …)" | 4 |
| VALIDATION_ERROR | Input validation failed | "Invalid input: …" | 5 |
| API_ERROR | API call failed (5xx) | "ClickUp API error: …" | 6 |
| RATE_LIMITED | 429 response | "Rate limit reached. Retry after X seconds." | 7 |
| NETWORK_ERROR | Network failure | "Network error: …" | 8 |

**Rationale**: Constitution VI. Test Discipline & CI/CD requires deterministic behavior. Exit codes enable scripting/AI recovery.

---

### 5. Command Structure

**Decision**: Follow Commander pattern:

```bash
clickup-cli <command> [subcommand] [options]

Commands:
  auth <login|status|logout>   Authentication
  tasks <list|create|show|update|delete>  Task operations

Global options:
  --output <table|json>       Output format (default: table)
  --config <path>            Custom config file
  -h, --help                Show help
```

---

### 6. Testing Strategy

**Unit Tests** (vitest):
- Pure functions: `formatTask()`, `parseFilters()`, `validateInput()`
- Zod schema validation logic edge cases

**Integration Tests**:
- Mock ClickUp API responses (using fixtures from `test/fixtures/`)
- Test full command execution with `bun run` or commander programmatic API
- Test auth flow, CRUD ops with simulated API

**CLI Tests** (end-to-end):
- Run compiled binary with various args, capture stdout/stderr
- Test JSON output parsing by AI agent

**Coverage Target**: ≥80% (per SC-006)

---

### 7. Stateful Service: APIClient Class

**Allowable Class Use** (Constitution III): Stateful service with authentication token.

```typescript
class ClickUpAPIClient {
  private token: string;
  private axiosInstance: Axios;

  constructor(token: string) {
    this.token = token;
    this.axiosInstance = axios.create({ baseURL: 'https://api.clickup.com/api/v2' });
    this.axiosInstance.defaults.headers.common['Authorization'] = token;
  }

  // Methods: getTask(), createTask(), updateTask(), deleteTask(), etc.
}
```

**Rationale**: Maintains token state and HTTP client configuration. Single class acceptable per Constitution.

---

### 8. Configuration File Format

**Decision**: JSON format:

```json
{
  "token": "pk_xxxxxxxx",
  "team_id": "12345",
  "default_list_id": null,
  "output_format": "table",
  "locale": "en"
}
```

File permissions enforced 0600. On Windows, use best-effort (no chmod).

---

## Open Questions (Resolved)

All questions resolved. No NEEDS CLARIFICATION markers remain.

---

## References

- Current codebase: `packages/clickup-cli-core/src/commands/` (auth, spaces, lists exist as examples)
- ClickUp API v2 docs (OpenAPI spec in `packages/clickup-api/openapi/`)
- Zod docs: https://zod.dev/
- Commander docs: https://github.com/tj/commander.js/
