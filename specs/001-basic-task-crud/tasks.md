# Tasks: Basic Task CRUD

**Input**: Design documents from `/specs/001-basic-task-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create feature branch and verify environment (Node.js 18+, Bun)
- [x] T002 Install dependencies (npm install) and verify build (npm run build)
- [x] T003 [P] Configure project structure: create directories in `packages/clickup-cli-core/src/`
  - `commands/`, `validation/`, `utils/`
- [x] T004 [P] Set up test configuration (vitest.config.ts extensions if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create configuration module (`packages/clickup-cli-core/src/config.ts`)
  - Token storage in `~/.clickup-cll/config.json` with 0600
  - Load/save functions, environment override support
- [x] T006 [P] Define Zod schemas for configuration (config.schema.ts)
- [x] T007 [P] Implement error handling infrastructure
  - Define error types (AuthError, ValidationError, APIError, etc.)
  - Exit code mapping
- [x] T008 [P] Implement output formatting utilities
  - `formatOutput(data, format: 'table'|'json')`
  - Table rendering (chalk, borders) and JSON deterministic serialization
- [x] T009 Create base API client class (`packages/clickup-cli-core/src/api/client.ts`)
  - Constructor accepts token
  - Axios instance with baseURL and Authorization header
  - Request/response interceptors for error handling
- [x] T010 [P] Create validation utility functions ( Zod integration )
  - `validate(schema, data)` wrapper with error formatting
- [x] T011 [US1] Implement `auth` command skeleton (commander structure)
  - Subcommands: `login`, `status`, `logout`
  - Wire to placeholder handlers

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authentication & Configuration (Priority: P1) 🎯 MVP

**Goal**: Users can securely authenticate, store token locally, and verify status. Auth must succeed before any task operations.

**Independent Test**: `clickup-cli auth login` → store token → `clickup-cli auth status` shows team info. Token appears in config file with 0600. Subsequent task commands recognize authentication.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US1] Unit test: Config module (load/save/validate)
- [x] T013 [P] [US1] Integration test: Auth flow with mocked API (`/user` endpoint)
- [x] T014 [P] [US1] CLI test: `auth status` output parsing

### Implementation for User Story 1

- [x] T015 [US1] Implement `auth login` interactive flow (inquirer hidden input)
  - Prompt for token, validate format (non-empty), save via config module
- [x] T016 [US1] Implement `auth status` - read token, call `/user` API, display team/email
- [x] T017 [US1] Implement `auth logout` - remove config file (with confirmation)
- [x] T018 [US1] Add token masking: never log raw token; mask in errors
- [x] T019 [US1] Wire `auth` command in `apps/cli/src/index.ts`
- [x] T020 [US1] Test end-to-end: login → status → logout flow

**Checkpoint**: At this point, authentication works independently. MVP foundation complete.

---

## Phase 4: User Story 2 - List Tasks (Priority: P2)

**Goal**: Users can list tasks in a given list with optional filters (status, assignee). Output in table or JSON.

**Independent Test**: `clickup-cli tasks list --list-id <LIST_ID>` displays table with columns ID, Name, Status, Assignee, Due Date. `--output json` gives array of task objects.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [x] T021 [P] [US2] Unit test: filter parsing and validation (Zod)
- [x] T022 [P] [US2] Integration test: `tasks list` with mocked API responses
- [x] T023 [P] [US2] CLI test: output format selection (table vs JSON)

### Implementation for User Story 2

- [x] T024 [US2] Define Zod schema for list filters (listId required)
- [x] T025 [US2] Implement `tasks list` command
  - Parse options, validate via Zod
  - Call API client: `GET /list/{list_id}/task` with query params
  - Format output based on `--output` flag
- [x] T026 [US2] Add `--status`, `--assignee`, `--due-date` filter support
- [x] T027 [US2] Ensure JSON mode: No ANSI colors, deterministic key order
- [x] T028 [US2] Handle API errors (404 list, 429 rate limit) with proper exit codes
- [x] T029 [US2] Wire `tasks` command group in `apps/cli/src/index.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Auth + List.

---

## Phase 5: User Story 3 - Create Task (Priority: P3)

**Goal**: Users can create new tasks via CLI arguments or interactive mode.

**Independent Test**: `clickup-cli tasks create --list-id X --name "Foo"` creates task and returns details with ID. Interactive mode (`--interactive`) prompts for all fields.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [x] T030 [P] [US3] Unit test: createTask input validation (Zod)
- [x] T031 [P] [US3] Integration test: create task with mocked API, verify payload
- [x] T032 [P] [US3] CLI test: interactive mode flow simulation

### Implementation for User Story 3

- [x] T033 [US3] Define Zod schema for `createTask` input (name required, others optional)
- [x] T034 [US3] Implement `tasks create` command (args mode)
  - Validate inputs, call `POST /list/{list_id}/task`
  - Display created task (JSON or table)
- [x] T035 [US3] Add `--interactive` mode using inquirer
  - Prompt: list_id, name, description, status, assignee, due_date, tags, priority
  - Validate each step
- [x] T036 [US3] Handle validation errors (missing required, invalid enum) with clear messages
- [x] T037 [US3] Ensure created task output includes generated ID and timestamps

**Checkpoint**: All three stories (Auth, List, Create) independently functional.

---

## Phase 6: User Story 4 - Update Task (Priority: P4)

**Goal**: Users can update task fields (name, status, assignee, due_date, tags, priority) with partial updates.

**Independent Test**: `clickup-cli tasks update <ID> --status "done"` updates status. Multiple flags update multiple fields. Verify via `tasks show`.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [x] T038 [P] [US4] Unit test: updateTask input validation (partial schema)
- [x] T039 [P] [US4] Integration test: update task fields, verify API payload
- [x] T040 [P] [US4] CLI test: multiple simultaneous flags

### Implementation for User Story 4

- [x] T041 [US4] Define Zod schema for `updateTask` input (partial, excludes id/list_id/readonly)
- [x] T042 [US4] Implement `tasks update <id>` command
  - Parse options, validate, call `PUT /task/{task_id}`
  - Support clearing fields (e.g., `--due-date null`)
- [x] T043 [US4] Handle 404 (task not found), 422 (validation) with user-friendly messages
- [x] T044 [US4] Display updated task in selected output format

**Checkpoint**: Stories 1-4 independently functional.

---

## Phase 7: User Story 5 - Delete Task (Priority: P5)

**Goal**: Users can delete tasks with confirmation (interactive or `--confirm`).

**Independent Test**: `clickup-cli tasks delete <ID> --confirm` deletes task. Without `--confirm`, prompts for 'y/N'.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [x] T045 [P] [US5] Unit test: delete confirmation logic
- [x] T046 [P] [US5] Integration test: delete task with mocked API, verify DELETE call
- [x] T047 [P] [US5] CLI test: cancellation flow

### Implementation for User Story 5

- [x] T048 [US5] Implement `tasks delete <id>` command
  - If `--confirm`: immediate DELETE call
  - Else: prompt "Delete task <id>? (y/N)"
  - On confirmation, call `DELETE /task/{task_id}`
- [x] T049 [US5] Handle 404 (already deleted), 403 (forbidden), network errors
- [x] T050 [US5] On success, print confirmation (JSON: `{deleted: true, id}`)

**Checkpoint**: All user stories (1-5) independently functional - MVP complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T051 [P] Add `--verbose` flag across all commands (debug logging to stderr)
- [x] T052 [P] Implement global error handler: catch unhandled rejections, print friendly message, exit 1
- [x] T053 [P] Add `--help` examples for each command (show common usage)
- [x] T054 [P] Ensure all error messages are user-friendly, include recovery suggestion
- [x] T055 [P] Add exit code documentation to README or `--help`
- [x] T056 [P] Run `npm run lint` and `npm run typecheck`; fix all warnings
- [x] T057 [P] Write unit tests to reach ≥80% coverage target (SC-006)
- [x] T058 [P] Write end-to-end CLI tests covering all commands and error paths
- [x] T059 [P] Update `quickstart.md` with actual examples from implemented commands
- [ ] T060 [P] Verify JSON output is deterministic (run multiple times, compare hashes)
- [ ] T061 [P] Test with large task lists (>100 items) for performance (per SC-001)
- [ ] T062 [P] Security audit: ensure no token leaks in logs, config file perms 0600

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on US2/US3
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Skeletons (command wiring) before business logic
- Validation schemas before command handlers
- Core implementation before polish/error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All Foundational tasks (T005-T011) marked [P] can run in parallel (different files)
- Once Foundational phase completes, all user stories (T015-T050) can start in parallel (if team capacity allows)
- Each user story's tests (if included) marked [P] can run in parallel
- Models/validation within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Polish tasks (T051-T062) marked [P] can run in parallel

---

## Parallel Example: User Story 2 (List Tasks)

```bash
# Launch all tests for List Tasks together (if tests requested):
Task: "Unit test: filter parsing (T021)"
Task: "Integration test: tasks list (T022)"
Task: "CLI test: output formats (T023)"

# Launch all validation/scheme tasks for US2 together:
Task: "Define Zod schema for filters (T024)" [P]
Task: "Implement tasks list command (T025)" [US2]

# These can all be done concurrently if separate files:
# - T024, T025, T026, T027 operate on different modules
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Auth)
4. **STOP and VALIDATE**: Test auth flow independently (login → status → logout)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test independently → MVP milestone
3. Add User Story 2 (List) → Test independently → MVP milestone
4. Add User Story 3 (Create) → Test independently → MVP milestone
5. Add User Story 4 (Update) → Test independently → MVP milestone
6. Add User Story 5 (Delete) → Test independently → Full CRUD complete
7. Polish → Final validation

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auth)
   - Developer B: User Story 2 (List)
   - Developer C: User Story 3 (Create)
   - Developer D: User Story 4 (Update)
   - Developer E: User Story 5 (Delete)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on other incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (if testing is requested)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths must be exact and relative to repo root
- Task IDs are sequential T001, T002, ... across all phases