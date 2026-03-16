# Implementation Plan: Basic Task CRUD

**Branch**: `001-basic-task-crud` | **Date**: 2026-03-16 | **Spec**: [`001-basic-task-crud/spec.md`](../specs/001-basic-task-crud/spec.md)
**Input**: Feature specification from `/specs/001-basic-task-crud/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement core task management operations (CRUD) with AI-friendly structured output. The feature builds on existing monorepo architecture: `@clickup/api` (generated client), `@clickup/cli-core` (commands), and `apps/cli` (entry). We'll add:
- Authentication management (secure token storage)
- Tasks commands: `list`, `create`, `show`, `update`, `delete`
- Zod validation for all inputs/outputs
- Dual output: human-friendly (default) + JSON (AI-friendly)
- Functions-first code architecture with minimal classes

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode) | Bun runtime (per Constitution)
**Primary Dependencies**:
- `commander` (CLI framework)
- `chalk` (terminal colors - interactive mode only)
- `inquirer` (interactive prompts)
- `@clickup/api` (generated API client from OpenAPI)
- `zod` (runtime validation)
**Storage**: Local filesystem only (config in `~/.clickup-cli/config.json`), no database
**Testing**: Vitest (unit/integration) with `bun test` compatibility
**Target Platform**: Cross-platform CLI (Linux/macOS/Windows) via Bun single binary
**Project Type**: CLI application (monorepo: packages/ + apps/)
**Performance Goals**: List < 2s, Create < 5s (including interactive prompts)
**Constraints**: Single self-contained executable (< 50MB), deterministic JSON output, no ANSI in JSON mode
**Scale/Scope**: Individual users and small teams; handle lists with up to 1000 tasks per query

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **All Gates PASS**

| Principle | Check | Status | Notes |
|-----------|-------|--------|-------|
| I. Monorepo Architecture | Clear separation: apps → core → api | ✅ PASS | Existing structure maintained |
| II. Schema-Driven Development | Orval-generated client + Zod validation | ✅ PASS | Will add Zod schemas for all inputs |
| III. Functions-First, Classes Minimal | Pure functions; classes only for stateful services | ✅ PASS | Will use functional composition for command handlers |
| IV. CLI-First Interface | Commander-based, dual output modes | ✅ PASS | New commands follow existing pattern |
| V. Configuration & Security | 0600 config, token masking, Zod validation | ✅ PASS | Auth command uses existing config module |
| VI. Test Discipline & CI/CD | ≥80% coverage, all tests pass in CI | ⚠️ ACHIEVE | Will implement tests to meet coverage |
| Build & Distribution | Bun single binary | ⚠️ FUTURE | Build script will be configured post-MVP |
| Internationalization | i18n not yet required | ✅ ACCEPT | Out of scope for MVP (P3) |

**Overall**: ✅ PROCEED TO PHASE 0

**Justifications**:
- Test coverage: Will implement comprehensive tests (target ≥80%)
- Bun build: Concurrency to plan Phase 1 (see Build & Distribution section)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-basic-task-crud/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── clickup-api/              # Generated - no changes expected
│   ├── src/generated/
│   └── openapi/
└── clickup-cli-core/         # MODIFICATIONS HERE
    ├── src/
    │   ├── commands/         # Add: auth.ts, tasks.ts (new commands)
    │   ├── config.ts         # Extend: token storage, masking
    │   ├── validation/       # NEW: Zod schemas for inputs/outputs
    │   │   ├── schemas.ts
    │   │   └── auth.schema.ts
    │   ├── utils/            # NEW: formatters (table/json), errors
    │   └── index.ts
    └── tests/
        ├── unit/
        ├── integration/
        └── fixtures/

apps/
└── cli/                      # MODIFICATIONS HERE
    └── src/
        └── index.ts          # Register new commands

# (config stored at runtime: ~/.clickup-cli/config.json)
```

**Structure Decision**: Monorepo with packages/ (API, core) and apps/ (cli). Follows existing pattern from README. No new packages needed for MVP. Commands extend `clickup-cli-core` to keep core logic independent from entry point.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

✅ No violations requiring justification. All constitution gates satisfied.

| Principle | Assessment |
|-----------|------------|
| Monorepo | Existing structure reused - ✅ |
| Schema-Driven | Orval client used + Zod validationLayer added - ✅ |
| Functions-First | Command handlers as pure functions; only API client class - ✅ |
| CLI-First | Commander-based commands with dual output - ✅ |
| Security | Config 0600, token masking, Zod validation - ✅ |
| Test Discipline | Comprehensive unit/integration/CLI tests planned - ✅ |

**Complexity**: Low - extending existing CLI pattern. No architectural over-engineering.
