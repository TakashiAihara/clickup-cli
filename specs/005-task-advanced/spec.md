# Feature Specification: Advanced Task Commands

**Feature Branch**: `005-task-advanced`
**Created**: 2026-03-24
**Status**: Draft
**Input**: Add advanced task commands including dependencies, links, checklists, attachments, guests, members, merge, time tracking per task, time in status, and threaded comment replies

## User Scenarios & Testing *(mandatory)*

### User Story 1 - タスク間の依存関係・リンク管理 (Priority: P1)

ClickUp CLI ユーザーとして、タスク間の依存関係（waiting on / blocking）やリンクを CLI から設定・削除したい。プロジェクト管理でタスクの順序やブロッカーを明確にできる。

**Why this priority**: 依存関係はプロジェクト進行管理の核心。ブロッカーの可視化やガントチャートの正確性に直結する。

**Independent Test**: `clickup tasks add-dependency --task-id <ID> --depends-on <OTHER_ID>` で依存関係が設定される。`clickup tasks add-link --task-id <ID> --links-to <OTHER_ID>` でリンクが作成される。

**Acceptance Scenarios**:

1. **Given** 2つの既存タスク, **When** `tasks add-dependency --task-id <ID> --depends-on <OTHER_ID>` を実行, **Then** タスク間に依存関係が設定される
2. **Given** 依存関係のあるタスク, **When** `tasks remove-dependency --task-id <ID> --depends-on <OTHER_ID>` を実行, **Then** 依存関係が削除される
3. **Given** 2つの既存タスク, **When** `tasks add-link --task-id <ID> --links-to <OTHER_ID>` を実行, **Then** タスク間にリンクが作成される
4. **Given** リンクされたタスク, **When** `tasks remove-link --task-id <ID> --links-to <OTHER_ID>` を実行, **Then** リンクが削除される

---

### User Story 2 - タスク単位の時間トラッキング (Priority: P1)

ClickUp CLI ユーザーとして、タスクに記録された時間エントリを確認し、新規追加・編集・削除したい。作業時間の記録と分析に必要。

**Why this priority**: 時間トラッキングは日常的に使う機能。既存の `time` コマンドはワークスペース単位だが、タスク単位の操作が必要。

**Independent Test**: `clickup tasks time --task-id <ID>` でタスクの時間エントリ一覧が表示される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーとタスク, **When** `tasks time --task-id <ID>` を実行, **Then** そのタスクの時間エントリ一覧が表示される
2. **Given** 認証済みユーザー, **When** `tasks track-time --task-id <ID> --duration 3600000` を実行, **Then** タスクに時間エントリが追加される
3. **Given** 既存の時間エントリ, **When** `tasks edit-time --task-id <ID> --interval-id <IID> --duration 7200000` を実行, **Then** 時間エントリが更新される
4. **Given** 既存の時間エントリ, **When** `tasks delete-time --task-id <ID> --interval-id <IID>` を実行, **Then** 時間エントリが削除される

---

### User Story 3 - チェックリスト作成 (Priority: P2)

ClickUp CLI ユーザーとして、タスクにチェックリストを作成したい。サブタスクを作るまでもない細かいステップの管理に便利。

**Why this priority**: チェックリストはタスクの詳細管理で頻繁に使われるが、依存関係や時間管理より優先度は低い。

**Independent Test**: `clickup tasks create-checklist --task-id <ID> --name "Steps"` でチェックリストが作成される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーとタスク, **When** `tasks create-checklist --task-id <ID> --name "Steps"` を実行, **Then** タスクにチェックリストが作成される

---

### User Story 4 - コメントのスレッド返信 (Priority: P2)

ClickUp CLI ユーザーとして、既存コメントへのスレッド返信を取得・投稿したい。コメントでの議論をスレッド化して追跡できる。

**Why this priority**: スレッド返信はコメント機能の自然な拡張。チームコミュニケーションで必要。

**Independent Test**: `clickup comments replies --comment-id <ID>` でスレッド返信一覧が表示される。

**Acceptance Scenarios**:

1. **Given** 既存コメント, **When** `comments replies --comment-id <ID>` を実行, **Then** スレッド返信一覧が表示される
2. **Given** 既存コメント, **When** `comments reply --comment-id <ID> --body "返信内容"` を実行, **Then** スレッド返信が投稿される

---

### User Story 5 - タスクのメンバー・ゲスト管理 (Priority: P2)

ClickUp CLI ユーザーとして、タスクのメンバー一覧確認やゲストの追加・削除を行いたい。

**Why this priority**: タスク単位のアクセス管理。頻度は低いが、コラボレーションで必要。

**Independent Test**: `clickup tasks members --task-id <ID>` でメンバー一覧が表示される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーとタスク, **When** `tasks members --task-id <ID>` を実行, **Then** タスクのメンバー一覧が表示される
2. **Given** 認証済みユーザー, **When** `tasks add-guest --task-id <ID> --guest-id <GID>` を実行, **Then** ゲストがタスクに追加される
3. **Given** タスクにアクセス権のあるゲスト, **When** `tasks remove-guest --task-id <ID> --guest-id <GID>` を実行, **Then** ゲストのアクセスが削除される

---

### User Story 6 - タスクのタグ操作 (Priority: P2)

ClickUp CLI ユーザーとして、タスクへのタグ付与・削除を行いたい。

**Why this priority**: タグによるタスクの分類・フィルタリングは日常的な操作。

**Independent Test**: `clickup tasks add-tag --task-id <ID> --tag-name "urgent"` でタグが付与される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーとタスク, **When** `tasks add-tag --task-id <ID> --tag-name "urgent"` を実行, **Then** タスクにタグが付与される
2. **Given** タグ付きタスク, **When** `tasks remove-tag --task-id <ID> --tag-name "urgent"` を実行, **Then** タスクからタグが削除される

---

### User Story 7 - 添付ファイル・タスクマージ・ステータス滞在時間 (Priority: P3)

ClickUp CLI ユーザーとして、タスクへの添付ファイルアップロード、タスクのマージ、ステータス滞在時間の確認を行いたい。

**Why this priority**: 利用頻度が低い or 特殊なユースケース向けの機能。

**Independent Test**: 各コマンドが個別に動作する。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーとタスク, **When** `tasks attach --task-id <ID> --file ./report.pdf` を実行, **Then** ファイルがタスクに添付される
2. **Given** 2つの既存タスク, **When** `tasks merge --task-id <ID> --merge-with <OTHER_ID>` を実行, **Then** タスクがマージされる
3. **Given** 認証済みユーザーとタスク, **When** `tasks time-in-status --task-id <ID>` を実行, **Then** 各ステータスでの滞在時間が表示される
4. **Given** 複数のタスク ID, **When** `tasks bulk-time-in-status --task-ids <ID1>,<ID2>` を実行, **Then** 各タスクのステータス滞在時間が一括表示される

---

### Edge Cases

- 循環依存を設定しようとした場合（A→B→A）のエラーハンドリング
- 存在しないタスク ID で依存関係やリンクを設定した場合のエラー
- 添付ファイルが大きすぎる場合（ClickUp API の制限に従う）
- マージ先タスクが既に削除されている場合
- 時間エントリの duration が 0 や負の値の場合
- スレッド返信のないコメントで replies を取得した場合（空リスト）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow adding and removing task dependencies (waiting on / blocking)
- **FR-002**: System MUST allow adding and removing task links
- **FR-003**: System MUST display tracked time entries for a specific task
- **FR-004**: System MUST allow adding, editing, and deleting time entries on a task
- **FR-005**: System MUST allow creating checklists on tasks
- **FR-006**: System MUST allow retrieving and posting threaded comment replies
- **FR-007**: System MUST display task members
- **FR-008**: System MUST allow adding and removing guests from tasks
- **FR-009**: System MUST allow adding and removing tags on tasks
- **FR-010**: System MUST allow uploading file attachments to tasks
- **FR-011**: System MUST allow merging two tasks
- **FR-012**: System MUST display time spent in each status for a task
- **FR-013**: System MUST support bulk time-in-status queries for multiple tasks
- **FR-014**: All new commands MUST support `--output json|table` dual output format
- **FR-015**: All new commands MUST show appropriate error messages for invalid inputs or API errors

### Key Entities

- **Dependency**: タスク間の「待ち」関係。タイプ（waiting_on / blocking）と対象タスク ID を持つ
- **Task Link**: タスク間の関連付け。依存関係とは異なり順序や方向性を持たない
- **Checklist**: タスク内のチェック項目リスト。名前と項目の配列を持つ
- **Time Entry**: タスクへの時間記録。開始時刻、終了時刻、持続時間を持つ
- **Attachment**: タスクに添付されたファイル。ファイル名、サイズ、URL を持つ
- **Threaded Reply**: コメントへの返信。親コメント ID と本文を持つ

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 全 22 エンドポイントに対応する CLI コマンドが実装され、正常に動作する
- **SC-002**: 全コマンドで JSON 出力と Table 出力の両方が利用可能
- **SC-003**: 既存コマンド（tasks, comments, time）との一貫したインターフェースが維持される
- **SC-004**: エラー時に ClickUp API のエラーメッセージがユーザーに伝わる

## Assumptions

- ClickUp API v2 の認証・接続は既存の仕組みをそのまま利用する
- タスクの依存関係タイプは ClickUp API がサポートする `waiting_on` と `blocking` の2種類
- 添付ファイルのアップロードは multipart/form-data で送信（ClickUp API 仕様に準拠）
- タスクマージは ClickUp API の仕様に従い、マージ元タスクは削除される
