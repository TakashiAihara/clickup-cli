# Feature Specification: Basic Task CRUD

**Feature Branch**: `001-basic-task-crud`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Implement basic task management CRUD operations (create, read, update, delete) with AI-friendly structured output, following monorepo architecture, schema-driven development, and functions-first principles."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticate and Configure ClickUp CLI (Priority: P1)

ユーザーは CLI をインストール後、初回実行時に ClickUp API トークンを設定し、認証状態を確認できる。

**Why this priority**: 認証なしでは如何なる操作もできないため、最優先

**Independent Test**: `clickup-cli auth login` でトークンを保存後、`clickup-cli auth status` で認証状態を確認できる。トークンは `~/.clickup-cli/config.json` に安全に保存される。

**Acceptance Scenarios**:

1. **Given** ユーザーが CLI を初めて実行した、**When** `clickup-cli auth login` を実行しプロンプトで有効な API トークンを入力した、**Then** トークンが暗号化されて保存され、`auth status` で「authenticated」と表示される
2. **Given** 認証済みの状態、**When** `clickup-cli auth status` を実行した、**Then** トークンの有効性が確認され、チーム情報が表示される
3. **Given** 無効なトークンを保存した状態、**When** API 呼び出しを試みた、**Then** 明確なエラーメッセージを表示し、401 エラーを返す

---

### User Story 2 - List Tasks with Filtering (Priority: P2)

ユーザーは特定のリスト内のタスクを一覧表示し、ステータスや担当者でフィルタリングできる。

**Why this priority**: タスクの確認は最も頻度の高い操作

**Independent Test**: `clickup-cli tasks list --list-id <id> --status "in progress"` でフィルタした結果が JSON/テーブル形式で表示される。

**Acceptance Scenarios**:

1. **Given** リスト ID が指定され、**When** `tasks list --list-id <LIST_ID>` を実行した、**Then** そのリストの全タスクがテーブル形式で表示される
2. **Given** ステータスでフィルタ指定し、**When** `tasks list --list-id <ID> --status "done"` を実行した、**Then** ステータスが "done" のタスクのみ表示される
3. **Given** `--output json` オプション指定、**When** コマンドを実行した、**Then** 構造化 JSON が stdout に出力され、ANSI カラーコードが含まれない

---

### User Story 3 - Create a New Task (Priority: P3)

ユーザーは CLI から新しいタスクを作成できる。インタラクティブモードと引数モードの両方をサポート。

**Why this priority**: タスク作成はコア操作

**Independent Test**: `clickup-cli tasks create --list-id <id> --name "タスク名" --description "説明"` で作成でき、`tasks show <id>` で確認できる。

**Acceptance Scenarios**:

1. **Given** 必須引数（list-id, name）を指定、**When** `tasks create` を実行した、**Then** タスクが作成され、作成されたタスクの詳細（ID, name, status など）が表示される
2. **Given** インタラクティブモード（`--interactive` フラグ）、**When** コマンドを実行し、プロンプトに従って値を入力した、**Then** 対話的にタスクを作成できる
3. **Given** 必須項目が不足、**When** `tasks create` を実行した、**Then** 使用法とエラー内容を表示し、終了コード 1 で失敗する

---

### User Story 4 - Update Task Details (Priority: P4)

ユーザーは既存タスクの名前、ステータス、担当者、期限などを更新できる。

**Why this priority**: タスクのメンテナンスに必要

**Independent Test**: `clickup-cli tasks update <TASK_ID> --status "in progress" --assignee <user_id>` で更新し、`tasks show <id>` で変更を確認できる。

**Acceptance Scenarios**:

1. **Given** タスク ID と更新フィールド、**When** `tasks update <id> --name "新名前"` を実行した、**Then** タスク名が更新され、変更後のタスク詳細が表示される
2. **Given** 存在しないタスク ID、**When** `tasks update` を実行した、**Then** "Task not found" エラーを表示する
3. **Given** 不正なステータス値、**When** `tasks update --status "invalid"` を実行した、**Then** 有効なステータスリストを示すエラーメッセージを表示する

---

### User Story 5 - Delete a Task (Priority: P5)

ユーザーはタスクを削除できる。確認プロンプト optional。

**Why this priority**: タスク削除は重大操作のため後回し可能

**Independent Test**: `clickup-cli tasks delete <TASK_ID>` または `--confirm` フラグ付きで削除実行後、`tasks list` にタスクが含まれないことを確認。

**Acceptance Scenarios**:

1. **Given** 存在するタスク ID、**When** `tasks delete <id> --confirm` を実行した、**Then** タスクが削除され、確認メッセージが表示される
2. **Given** 削除確認プロンプト有効時、**When** `tasks delete <id>` を実行しプロンプトで 'y' と入力した、**Then** 削除される
3. **Given** 削除確認プロンプトで 'n' と入力、**When** キャンセルした、**Then** タスクは削除されず、操作が中断される

---

### Edge Cases

- 認証トークンが有効期限切れの場合、再認証を促す
- API レート制限に達した場合、リトライ間隔を表示
- ネットワーク接続Failure時、タイムアウトと再試行の警告
- 不完全なタスク情報（必須フィールド欠如）での create はバリデーションエラー
- 大文字小文字の区別（ステータス値など）を統一
- 削除したタスク ID への后续操作は "not found" を返す
- フィルタ条件に合致するタスクがゼロ件の場合は明示的に「0件」と表示
- 非常に長いタスク名/説明は truncate せず、そのまま表示（ただし出力フォーマットで制限）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide `auth login` command to securely store ClickUp API token in `~/.clickup-cli/config.json` with file permissions 0600
- **FR-002**: System MUST provide `auth status` command to verify token validity and display workspace/team information
- **FR-003**: System MUST provide `tasks list` command accepting `--list-id` (required), `--status`, `--assignee`, `--due-date` filters
- **FR-004**: System MUST support dual output formats: human-friendly table (default) and `--output json` for machine consumption
- **FR-005**: System MUST implement `tasks create` supporting both CLI arguments (`--name`, `--description`, `--status`, etc.) and interactive mode (`--interactive`)
- **FR-006**: System MUST implement `tasks show <task-id>` displaying all task fields (name, description, status, assignee, due date, created/updated timestamps)
- **FR-007**: System MUST implement `tasks update <task-id>` with support for updating status, name, description, assignee, due date; partial updates allowed
- **FR-008**: System MUST implement `tasks delete <task-id>` with optional `--confirm` flag or interactive confirmation prompt
- **FR-009**: All CLI commands MUST validate user inputs using Zod schemas before API calls; invalid inputs produce clear error messages and exit code 1
- **FR-010**: System MUST handle API errors (401, 404, 429, 5xx) with user-friendly messages and appropriate exit codes
- **FR-011**: System MUST NOT log or display raw API tokens in any output or error messages (masking required)
- **FR-012**: JSON output MODE MUST produce clean, deterministic, ANSI-free output suitable for AI agent consumption
- **FR-013**: System structure MUST follow monorepo: `packages/clickup-api` (generated), `packages/clickup-cli-core` (commands), `apps/cli` (entry)
- **FR-014**: All command implementations MUST use functional composition (pure functions) with classes only for stateful services (e.g., APIClient)
- **FR-015**: API client layer MUST use generated OpenAPI types from orval and runtime Zod validation schemas for all inputs/responses

### Key Entities

- **Task**: Represents a ClickUp task with attributes:
  - `id` (string, unique identifier)
  - `name` (string, required, ≤ 500 chars)
  - `description` (string, optional, rich text markup)
  - `status` (string, enum: "open", "in progress", "review", "done", "closed")
  - `assignee` (object: `id`, `username`, `email`) or null
  - `due_date` (timestamp, optional)
  - `list_id` (string, parent list)
  - `created_at`, `updated_at` (timestamps, read-only)
  - `tags` (array of strings, optional)
  - `priority` (enum: "urgent", "high", "normal", "low", optional)

- **User**: Represents a ClickUp user (for assignee field)
  - `id`, `username`, `email`, `profile_picture` (optional)

- **List**: Container for tasks
  - `id`, `name`, `space_id`, `folder_id`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can list all tasks in a list with filters in under 2 seconds (from command start to output)
- **SC-002**: Users can create a new task in under 5 seconds (including interactive prompts)
- **SC-003**: Task CRUD operations achieve 100% success rate for valid inputs (network/API uptime assumed)
- **SC-004**: API token is stored securely; file permissions 0600 and never appears in logs
- **SC-005**: All CLI commands provide deterministic, parseable JSON output when `--output json` specified; suitable for LLM consumption
- **SC-006**: Test coverage ≥ 80% across core functions and API client operations
- **SC-007**: First-time users can complete authentication and list tasks without reading documentation (intuitive commands)
- **SC-008**: Error messages are clear, actionable, and include recovery suggestion 100% of the time
