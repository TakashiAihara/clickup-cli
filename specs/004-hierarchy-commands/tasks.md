# Tasks: Hierarchy Commands Expansion

**Input**: Design documents from `/specs/004-hierarchy-commands/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/commands.md

**Tests**: Not requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify generated API functions exist and confirm existing patterns.

- [ ] T001 Verify generated API functions exist for all 20 endpoints in `packages/clickup-api/src/generated/api.ts` (getSpaceAvailableFields, GetSpaceTags, CreateSpaceTag, EditSpaceTag, DeleteSpaceTag, getFolderAvailableFields, GetAccessibleCustomFields, GetListMembers, AddGuestToFolder, RemoveGuestFromFolder, AddGuestToList, RemoveGuestFromList, AddTaskToList, RemoveTaskFromList, CreateFolderFromTemplate, CreateSpaceListFromTemplate, CreateFolderListFromTemplate, CreateTaskFromTemplate, GetChatViewComments, CreateChatViewComment)
- [ ] T002 Read existing patterns in `apps/cli/src/commands/spaces.ts`, `apps/cli/src/commands/folders.ts`, `apps/cli/src/commands/lists.ts`, `apps/cli/src/commands/views.ts` to confirm ensureAuth + API call + json/table output pattern

---

## Phase 2: User Story 1 - リソースのカスタムフィールド・メンバー確認 (Priority: P1) 🎯 MVP

**Goal**: スペース・フォルダ・リストのカスタムフィールドとメンバーを確認できる

**Independent Test**: `clickup spaces fields --space-id <ID>` でカスタムフィールド一覧が表示される

### Implementation

- [ ] T003 [P] [US1] Add `spaces fields` subcommand (--space-id, --output) calling `getSpaceAvailableFields` in `apps/cli/src/commands/spaces.ts`
- [ ] T004 [P] [US1] Add `folders fields` subcommand (--folder-id, --output) calling `getFolderAvailableFields` in `apps/cli/src/commands/folders.ts`
- [ ] T005 [P] [US1] Add `lists fields` subcommand (--list-id, --output) calling `GetAccessibleCustomFields` in `apps/cli/src/commands/lists.ts`
- [ ] T006 [P] [US1] Add `lists members` subcommand (--list-id, --output) calling `GetListMembers` in `apps/cli/src/commands/lists.ts`

**Checkpoint**: カスタムフィールド一覧とメンバー一覧が各リソースで表示される

---

## Phase 3: User Story 2 - スペースタグ管理 (Priority: P2)

**Goal**: スペースレベルのタグを一覧・作成・編集・削除できる

**Independent Test**: `clickup spaces tags --space-id <ID>` でタグ一覧が表示される

### Implementation

- [ ] T007 [P] [US2] Add `spaces tags` subcommand (--space-id, --output) calling `GetSpaceTags` in `apps/cli/src/commands/spaces.ts`
- [ ] T008 [P] [US2] Add `spaces create-tag` subcommand (--space-id, --name, --output) calling `CreateSpaceTag` in `apps/cli/src/commands/spaces.ts`
- [ ] T009 [P] [US2] Add `spaces edit-tag` subcommand (--space-id, --name, --new-name, --output) calling `EditSpaceTag` in `apps/cli/src/commands/spaces.ts`
- [ ] T010 [P] [US2] Add `spaces delete-tag` subcommand (--space-id, --name) calling `DeleteSpaceTag` in `apps/cli/src/commands/spaces.ts`

**Checkpoint**: スペースタグの CRUD が動作する

---

## Phase 4: User Story 3 - リストのタスク移動 (Priority: P2)

**Goal**: タスクをリストに追加・削除できる

**Independent Test**: `clickup lists add-task --list-id <ID> --task-id <TID>` でタスクがリストに追加される

### Implementation

- [ ] T011 [P] [US3] Add `lists add-task` subcommand (--list-id, --task-id, --output) calling `AddTaskToList` in `apps/cli/src/commands/lists.ts`
- [ ] T012 [P] [US3] Add `lists remove-task` subcommand (--list-id, --task-id) calling `RemoveTaskFromList` in `apps/cli/src/commands/lists.ts`

**Checkpoint**: タスクのリスト間移動が動作する

---

## Phase 5: User Story 4 - ゲスト管理 (Priority: P3)

**Goal**: フォルダやリストへのゲストの追加・削除ができる

**Independent Test**: `clickup folders add-guest --folder-id <ID> --guest-id <GID>` でゲストがフォルダに追加される

### Implementation

- [ ] T013 [P] [US4] Add `folders add-guest` subcommand (--folder-id, --guest-id, --output) calling `AddGuestToFolder` in `apps/cli/src/commands/folders.ts`
- [ ] T014 [P] [US4] Add `folders remove-guest` subcommand (--folder-id, --guest-id) calling `RemoveGuestFromFolder` in `apps/cli/src/commands/folders.ts`
- [ ] T015 [P] [US4] Add `lists add-guest` subcommand (--list-id, --guest-id, --output) calling `AddGuestToList` in `apps/cli/src/commands/lists.ts`
- [ ] T016 [P] [US4] Add `lists remove-guest` subcommand (--list-id, --guest-id) calling `RemoveGuestFromList` in `apps/cli/src/commands/lists.ts`

**Checkpoint**: フォルダ・リストのゲスト管理が動作する

---

## Phase 6: User Story 5 - テンプレートからの作成 (Priority: P3)

**Goal**: テンプレートからフォルダ・リスト・タスクを作成できる

**Independent Test**: `clickup spaces create-folder-from-template --space-id <ID> --template-id <TID>` でテンプレートからフォルダが作成される

### Implementation

- [ ] T017 [P] [US5] Add `spaces create-folder-from-template` subcommand (--space-id, --template-id, --output) calling `CreateFolderFromTemplate` in `apps/cli/src/commands/spaces.ts`
- [ ] T018 [P] [US5] Add `spaces create-list-from-template` subcommand (--space-id, --template-id, --output) calling `CreateSpaceListFromTemplate` in `apps/cli/src/commands/spaces.ts`
- [ ] T019 [P] [US5] Add `folders create-list-from-template` subcommand (--folder-id, --template-id, --output) calling `CreateFolderListFromTemplate` in `apps/cli/src/commands/folders.ts`
- [ ] T020 [P] [US5] Add `lists create-task-from-template` subcommand (--list-id, --template-id, --output) calling `CreateTaskFromTemplate` in `apps/cli/src/commands/lists.ts`

**Checkpoint**: テンプレートからの作成が全リソースで動作する

---

## Phase 7: User Story 6 - ビューコメント (Priority: P3)

**Goal**: ビュー（チャットビュー）のコメントを取得・投稿できる

**Independent Test**: `clickup views comments --view-id <ID>` でコメント一覧が取得できる

### Implementation

- [ ] T021 [P] [US6] Add `views comments` subcommand (--view-id, --output) calling `GetChatViewComments` in `apps/cli/src/commands/views.ts`
- [ ] T022 [P] [US6] Add `views create-comment` subcommand (--view-id, --body, --output) calling `CreateChatViewComment` in `apps/cli/src/commands/views.ts`

**Checkpoint**: ビューコメントの取得・投稿が動作する

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 全コマンドの一貫性確認と最終検証

- [ ] T023 Register all new subcommands in `apps/cli/src/index.ts` if needed (verify Commander auto-registers from command files)
- [ ] T024 Verify `--output json` produces valid JSON for all 20 new subcommands
- [ ] T025 Verify error handling for invalid IDs, missing required options across all new subcommands
- [ ] T026 Run typecheck (`bun run typecheck`) and fix any type errors
- [ ] T027 Run CI build (`bun build apps/cli/src/index.ts --compile --outfile clickup`) and verify binary includes new commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1-US6 (Phases 2-7)**: Depend on Phase 1 (pattern confirmation)
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

- **US1 (Fields/Members)**: Independent — touches spaces.ts, folders.ts, lists.ts
- **US2 (Space Tags)**: Independent — touches spaces.ts only
- **US3 (Task Move)**: Independent — touches lists.ts only
- **US4 (Guests)**: Independent — touches folders.ts, lists.ts
- **US5 (Templates)**: Independent — touches spaces.ts, folders.ts, lists.ts
- **US6 (View Comments)**: Independent — touches views.ts only

US2 and US6 can be fully parallelized with any other story (different files or non-overlapping areas).

### Parallel Opportunities

- T003, T004, T005, T006 (US1) can all run in parallel (different files)
- T007, T008, T009, T010 (US2) can all run in parallel (same file but independent subcommands)
- T011, T012 (US3) can run in parallel
- T013, T014 (US4 folders) and T015, T016 (US4 lists) can run in parallel (different files)
- T017, T018, T019, T020 (US5) can run in parallel (different files)
- T021, T022 (US6) can run in parallel

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: US1 Fields/Members (T003-T006)
3. **STOP and VALIDATE**: `clickup spaces fields --help` and `clickup lists members --help` work
4. Proceed to remaining user stories

### Summary

| Phase | Story | Tasks | Files touched |
|-------|-------|-------|--------------|
| Setup | — | T001-T002 | Read-only |
| US1 | Fields/Members | T003-T006 | spaces.ts, folders.ts, lists.ts |
| US2 | Space Tags | T007-T010 | spaces.ts |
| US3 | Task Move | T011-T012 | lists.ts |
| US4 | Guests | T013-T016 | folders.ts, lists.ts |
| US5 | Templates | T017-T020 | spaces.ts, folders.ts, lists.ts |
| US6 | View Comments | T021-T022 | views.ts |
| Polish | — | T023-T027 | index.ts, verification |

**Total: 27 tasks, 20 subcommands across 4 files**

---

## Notes

- 全サブコマンドは既存パターン（ensureAuth → API呼び出し → json/table出力）に従う
- 4 ファイル（spaces.ts, folders.ts, lists.ts, views.ts）への追加
- テンプレート系コマンドはテンプレート ID の事前取得が必要（CLI からは取得不可、ClickUp UI から取得）
- Commit after each user story phase
