# Tasks: Advanced Task Commands

**Input**: Design documents from `/specs/005-task-advanced/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/commands.md

**Tests**: Not requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new files or infrastructure needed. All changes go into existing command files.

- [ ] T001 Verify generated API functions exist for all 22 endpoints in `packages/clickup-api/src/generated/api.ts` (AddDependency, DeleteDependency, AddTaskLink, DeleteTaskLink, Gettrackedtime, Tracktime, Edittimetracked, Deletetimetracked, CreateChecklist, GetThreadedComments, CreateThreadedComment, GetTaskMembers, AddGuestToTask, RemoveGuestFromTask, AddTagToTask, RemoveTagFromTask, CreateTaskAttachment, mergeTasks, GetTasksTimeinStatus, GetBulkTasksTimeinStatus)
- [ ] T002 Read existing patterns in `apps/cli/src/commands/tasks.ts` and `apps/cli/src/commands/comments.ts` to confirm ensureAuth + API call + json/table output pattern

---

## Phase 2: User Story 1 - タスク間の依存関係・リンク管理 (Priority: P1) 🎯 MVP

**Goal**: タスク間の依存関係とリンクを CLI から追加・削除できる

**Independent Test**: `clickup tasks add-dependency --task-id <ID> --depends-on <OTHER_ID>` で依存関係が設定される

### Implementation

- [ ] T003 [P] [US1] Add `tasks add-dependency` subcommand (--task-id, --depends-on, --output) calling `AddDependency` in `apps/cli/src/commands/tasks.ts`
- [ ] T004 [P] [US1] Add `tasks remove-dependency` subcommand (--task-id, --depends-on) calling `DeleteDependency` in `apps/cli/src/commands/tasks.ts`
- [ ] T005 [P] [US1] Add `tasks add-link` subcommand (--task-id, --links-to, --output) calling `AddTaskLink` in `apps/cli/src/commands/tasks.ts`
- [ ] T006 [P] [US1] Add `tasks remove-link` subcommand (--task-id, --links-to) calling `DeleteTaskLink` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: 依存関係とリンクの追加・削除が動作する

---

## Phase 3: User Story 2 - タスク単位の時間トラッキング (Priority: P1)

**Goal**: タスクに記録された時間エントリの確認・追加・編集・削除ができる

**Independent Test**: `clickup tasks time --task-id <ID>` でタスクの時間エントリ一覧が表示される

### Implementation

- [ ] T007 [P] [US2] Add `tasks time` subcommand (--task-id, --output) calling `Gettrackedtime` in `apps/cli/src/commands/tasks.ts`
- [ ] T008 [P] [US2] Add `tasks track-time` subcommand (--task-id, --duration, --output) calling `Tracktime` in `apps/cli/src/commands/tasks.ts`
- [ ] T009 [P] [US2] Add `tasks edit-time` subcommand (--task-id, --interval-id, --duration, --output) calling `Edittimetracked` in `apps/cli/src/commands/tasks.ts`
- [ ] T010 [P] [US2] Add `tasks delete-time` subcommand (--task-id, --interval-id) calling `Deletetimetracked` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: タスク単位の時間トラッキング CRUD が動作する

---

## Phase 4: User Story 3 - チェックリスト作成 (Priority: P2)

**Goal**: タスクにチェックリストを作成できる

**Independent Test**: `clickup tasks create-checklist --task-id <ID> --name "Steps"` でチェックリストが作成される

### Implementation

- [ ] T011 [US3] Add `tasks create-checklist` subcommand (--task-id, --name, --output) calling `CreateChecklist` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: チェックリスト作成が動作する

---

## Phase 5: User Story 4 - コメントのスレッド返信 (Priority: P2)

**Goal**: 既存コメントへのスレッド返信を取得・投稿できる

**Independent Test**: `clickup comments replies --comment-id <ID>` でスレッド返信一覧が表示される

### Implementation

- [ ] T012 [P] [US4] Add `comments replies` subcommand (--comment-id, --output) calling `GetThreadedComments` in `apps/cli/src/commands/comments.ts`
- [ ] T013 [P] [US4] Add `comments reply` subcommand (--comment-id, --body, --output) calling `CreateThreadedComment` in `apps/cli/src/commands/comments.ts`

**Checkpoint**: スレッド返信の取得・投稿が動作する

---

## Phase 6: User Story 5 - タスクのメンバー・ゲスト管理 (Priority: P2)

**Goal**: タスクのメンバー一覧確認やゲストの追加・削除ができる

**Independent Test**: `clickup tasks members --task-id <ID>` でメンバー一覧が表示される

### Implementation

- [ ] T014 [P] [US5] Add `tasks members` subcommand (--task-id, --output) calling `GetTaskMembers` in `apps/cli/src/commands/tasks.ts`
- [ ] T015 [P] [US5] Add `tasks add-guest` subcommand (--task-id, --guest-id, --output) calling `AddGuestToTask` in `apps/cli/src/commands/tasks.ts`
- [ ] T016 [P] [US5] Add `tasks remove-guest` subcommand (--task-id, --guest-id) calling `RemoveGuestFromTask` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: メンバー確認・ゲスト管理が動作する

---

## Phase 7: User Story 6 - タスクのタグ操作 (Priority: P2)

**Goal**: タスクへのタグ付与・削除ができる

**Independent Test**: `clickup tasks add-tag --task-id <ID> --tag-name "urgent"` でタグが付与される

### Implementation

- [ ] T017 [P] [US6] Add `tasks add-tag` subcommand (--task-id, --tag-name, --output) calling `AddTagToTask` in `apps/cli/src/commands/tasks.ts`
- [ ] T018 [P] [US6] Add `tasks remove-tag` subcommand (--task-id, --tag-name) calling `RemoveTagFromTask` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: タグの付与・削除が動作する

---

## Phase 8: User Story 7 - 添付ファイル・タスクマージ・ステータス滞在時間 (Priority: P3)

**Goal**: 添付ファイルアップロード、タスクマージ、ステータス滞在時間の確認ができる

**Independent Test**: 各コマンドが個別に動作する

### Implementation

- [ ] T019 [P] [US7] Add `tasks attach` subcommand (--task-id, --file, --output) with multipart/form-data upload calling `CreateTaskAttachment` in `apps/cli/src/commands/tasks.ts`
- [ ] T020 [P] [US7] Add `tasks merge` subcommand (--task-id, --merge-with, --output) calling `mergeTasks` in `apps/cli/src/commands/tasks.ts`
- [ ] T021 [P] [US7] Add `tasks time-in-status` subcommand (--task-id, --output) calling `GetTasksTimeinStatus` in `apps/cli/src/commands/tasks.ts`
- [ ] T022 [P] [US7] Add `tasks bulk-time-in-status` subcommand (--task-ids, --output) calling `GetBulkTasksTimeinStatus` in `apps/cli/src/commands/tasks.ts`

**Checkpoint**: 添付・マージ・ステータス滞在時間の全コマンドが動作する

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 全コマンドの一貫性確認と最終検証

- [ ] T023 Register all new subcommands in `apps/cli/src/index.ts` if needed (verify Commander auto-registers from command files)
- [ ] T024 Verify `--output json` produces valid JSON for all 22 new subcommands
- [ ] T025 Verify error handling for invalid task IDs, missing required options across all new subcommands
- [ ] T026 Run typecheck (`bun run typecheck`) and fix any type errors
- [ ] T027 Run CI build (`bun build apps/cli/src/index.ts --compile --outfile clickup`) and verify binary includes new commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1-US7 (Phases 2-8)**: Depend on Phase 1 (pattern confirmation)
- **Polish (Phase 9)**: Depends on all previous phases

### User Story Dependencies

- **US1 (Dependencies/Links)**: Independent
- **US2 (Time Tracking)**: Independent
- **US3 (Checklist)**: Independent
- **US4 (Thread Replies)**: Independent — different file (`comments.ts`)
- **US5 (Members/Guests)**: Independent
- **US6 (Tags)**: Independent
- **US7 (Attach/Merge/Status)**: Independent

All user stories modify `apps/cli/src/commands/tasks.ts` (except US4 which modifies `comments.ts`). When implementing in parallel, be aware of merge conflicts in tasks.ts.

### Parallel Opportunities

- T003, T004, T005, T006 (US1) can all run in parallel
- T007, T008, T009, T010 (US2) can all run in parallel
- T012, T013 (US4) can run in parallel with US1-US3 (different file)
- T014, T015, T016 (US5) can all run in parallel
- T017, T018 (US6) can all run in parallel
- T019, T020, T021, T022 (US7) can all run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: US1 Dependencies/Links (T003-T006)
3. Complete Phase 3: US2 Time Tracking (T007-T010)
4. **STOP and VALIDATE**: `clickup tasks add-dependency --help` and `clickup tasks time --help` work
5. Proceed to remaining user stories

### Summary

| Phase | Story | Tasks | Parallel? |
|-------|-------|-------|-----------|
| Setup | — | T001-T002 | Sequential |
| US1 | Dependencies/Links | T003-T006 | All parallel |
| US2 | Time Tracking | T007-T010 | All parallel |
| US3 | Checklist | T011 | Single task |
| US4 | Thread Replies | T012-T013 | Both parallel (different file) |
| US5 | Members/Guests | T014-T016 | All parallel |
| US6 | Tags | T017-T018 | Both parallel |
| US7 | Attach/Merge/Status | T019-T022 | All parallel |
| Polish | — | T023-T027 | Sequential |

**Total: 27 tasks, 22 subcommands across 2 files**

---

## Notes

- 全サブコマンドは既存パターン（ensureAuth → API呼び出し → json/table出力）に従う
- `tasks.ts` への追加が大半。US4（comments）のみ `comments.ts` を変更
- 添付ファイル（T019）のみ multipart/form-data が必要で、他とパターンが異なる
- Commit after each user story phase
