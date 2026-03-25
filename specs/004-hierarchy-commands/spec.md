# Feature Specification: Hierarchy Commands Expansion

**Feature Branch**: `004-hierarchy-commands`
**Created**: 2026-03-24
**Status**: Draft
**Input**: Add missing CLI commands for spaces, folders, lists, and views covering custom fields, tags, templates, guests, members, and view comments

## User Scenarios & Testing *(mandatory)*

### User Story 1 - リソースのカスタムフィールド・メンバー確認 (Priority: P1)

ClickUp CLI ユーザーとして、スペース・フォルダ・リストで利用可能なカスタムフィールドやメンバーを確認したい。タスク作成や更新時にどのフィールドが使えるか事前に把握できる。

**Why this priority**: カスタムフィールドはタスク管理の基盤。フィールド一覧が取得できないと、タスクへのフィールド設定が手探りになる。メンバー確認はアサイン操作の前提。

**Independent Test**: `clickup spaces fields --space-id <ID>` でカスタムフィールド一覧が表示される。`clickup lists members --list-id <ID>` でメンバー一覧が表示される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザー, **When** `spaces fields --space-id <ID>` を実行, **Then** そのスペースで利用可能なカスタムフィールド一覧が表示される
2. **Given** 認証済みユーザー, **When** `folders fields --folder-id <ID>` を実行, **Then** そのフォルダで利用可能なカスタムフィールド一覧が表示される
3. **Given** 認証済みユーザー, **When** `lists fields --list-id <ID>` を実行, **Then** そのリストで利用可能なカスタムフィールド一覧が表示される
4. **Given** 認証済みユーザー, **When** `lists members --list-id <ID>` を実行, **Then** そのリストのメンバー一覧が表示される

---

### User Story 2 - スペースタグ管理 (Priority: P2)

ClickUp CLI ユーザーとして、スペースレベルのタグを CRUD 操作したい。タグはタスクの分類やフィルタリングに使われるため、CLI から管理できると効率的。

**Why this priority**: タグはタスク整理の重要な手段。現在タスクへのタグ付与は対応済みだが、スペースレベルのタグ管理（作成・編集・削除）が未対応。

**Independent Test**: `clickup spaces tags --space-id <ID>` でタグ一覧表示、`clickup spaces create-tag --space-id <ID> --name "bug"` でタグ作成ができる。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザー, **When** `spaces tags --space-id <ID>` を実行, **Then** スペースのタグ一覧が表示される
2. **Given** 認証済みユーザー, **When** `spaces create-tag --space-id <ID> --name "bug"` を実行, **Then** 新しいタグが作成される
3. **Given** 認証済みユーザー, **When** `spaces edit-tag --space-id <ID> --name "bug" --new-name "defect"` を実行, **Then** タグ名が変更される
4. **Given** 認証済みユーザー, **When** `spaces delete-tag --space-id <ID> --name "bug"` を実行, **Then** タグが削除される

---

### User Story 3 - リストのタスク移動 (Priority: P2)

ClickUp CLI ユーザーとして、タスクを別のリストに追加・削除したい。ClickUp ではタスクは複数のリストに所属できるため、CLI からの操作が必要。

**Why this priority**: タスクの整理やワークフロー管理で頻繁に使う操作。現在は UI からしかできない。

**Independent Test**: `clickup lists add-task --list-id <ID> --task-id <TID>` でタスクをリストに追加できる。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーと既存タスク, **When** `lists add-task --list-id <ID> --task-id <TID>` を実行, **Then** タスクがそのリストに追加される
2. **Given** リストに所属するタスク, **When** `lists remove-task --list-id <ID> --task-id <TID>` を実行, **Then** タスクがそのリストから削除される

---

### User Story 4 - ゲスト管理 (Priority: P3)

ClickUp CLI ユーザーとして、フォルダやリストへのゲストの追加・削除を行いたい。外部コラボレーターのアクセス管理に必要。

**Why this priority**: ゲスト管理は頻度は低いが、チーム運営で必要になる場面がある。

**Independent Test**: `clickup folders add-guest --folder-id <ID> --guest-id <GID>` でゲストをフォルダに追加できる。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザー, **When** `folders add-guest --folder-id <ID> --guest-id <GID>` を実行, **Then** ゲストがフォルダに追加される
2. **Given** フォルダにアクセス権のあるゲスト, **When** `folders remove-guest --folder-id <ID> --guest-id <GID>` を実行, **Then** ゲストのアクセスが削除される
3. **Given** 認証済みユーザー, **When** `lists add-guest --list-id <ID> --guest-id <GID>` を実行, **Then** ゲストがリストに追加される
4. **Given** リストにアクセス権のあるゲスト, **When** `lists remove-guest --list-id <ID> --guest-id <GID>` を実行, **Then** ゲストのアクセスが削除される

---

### User Story 5 - テンプレートからの作成 (Priority: P3)

ClickUp CLI ユーザーとして、テンプレートからフォルダ・リスト・タスクを作成したい。定型的なプロジェクト構造を素早く複製できる。

**Why this priority**: テンプレート機能はプロジェクト立ち上げ時に便利だが、利用頻度は他の操作より低い。

**Independent Test**: `clickup spaces create-folder-from-template --space-id <ID> --template-id <TID>` でテンプレートからフォルダが作成される。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーと既存テンプレート, **When** `spaces create-folder-from-template --space-id <ID> --template-id <TID>` を実行, **Then** テンプレートからフォルダが作成される
2. **Given** 認証済みユーザーと既存テンプレート, **When** `spaces create-list-from-template --space-id <ID> --template-id <TID>` を実行, **Then** テンプレートからリストが作成される
3. **Given** 認証済みユーザーと既存テンプレート, **When** `folders create-list-from-template --folder-id <ID> --template-id <TID>` を実行, **Then** テンプレートからリストが作成される
4. **Given** 認証済みユーザーと既存テンプレート, **When** `lists create-task-from-template --list-id <ID> --template-id <TID>` を実行, **Then** テンプレートからタスクが作成される

---

### User Story 6 - ビューコメント (Priority: P3)

ClickUp CLI ユーザーとして、ビュー（チャットビュー）のコメントを取得・投稿したい。

**Why this priority**: ビューコメントは Chat ビュー向けの機能で、利用シーンが限定的。

**Independent Test**: `clickup views comments --view-id <ID>` でコメント一覧が取得できる。

**Acceptance Scenarios**:

1. **Given** 認証済みユーザーと Chat ビュー, **When** `views comments --view-id <ID>` を実行, **Then** ビューのコメント一覧が表示される
2. **Given** 認証済みユーザーと Chat ビュー, **When** `views create-comment --view-id <ID> --body "message"` を実行, **Then** コメントが投稿される

---

### Edge Cases

- 存在しないリソース ID を指定した場合、ClickUp API のエラーメッセージをそのまま表示する
- 権限のないリソースにアクセスした場合、適切なエラーメッセージを表示する
- ゲスト追加時に既にアクセス権がある場合のハンドリング
- テンプレート ID が無効な場合のエラーハンドリング
- タスクを最後のリストから削除しようとした場合（ClickUp は最低 1 リスト所属が必要）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display available custom fields for a given space, folder, or list
- **FR-002**: System MUST support full CRUD operations for space-level tags (list, create, edit, delete)
- **FR-003**: System MUST allow adding and removing tasks from lists
- **FR-004**: System MUST display members of a list
- **FR-005**: System MUST allow adding and removing guests from folders and lists
- **FR-006**: System MUST support creating folders, lists, and tasks from templates
- **FR-007**: System MUST support retrieving and posting comments on chat views
- **FR-008**: All new commands MUST support `--output json|table` dual output format
- **FR-009**: All new commands MUST show appropriate error messages for invalid inputs or API errors

### Key Entities

- **Custom Field**: フィールド名、型、設定値を持つスペース/フォルダ/リスト単位のメタデータ定義
- **Space Tag**: スペース内でタスクに付与可能なラベル。名前と色（任意）を持つ
- **Guest**: ワークスペース外部のコラボレーター。メールアドレスで招待される
- **Template**: フォルダ・リスト・タスクの雛形。構造と設定を複製可能

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 全 20 エンドポイントに対応する CLI コマンドが実装され、正常に動作する
- **SC-002**: 全コマンドで JSON 出力と Table 出力の両方が利用可能
- **SC-003**: 既存コマンドとの一貫したインターフェース（オプション名、出力形式）が維持される
- **SC-004**: エラー時に ClickUp API のエラーメッセージがユーザーに伝わる

## Assumptions

- ClickUp API v2 の認証・接続は既存の仕組みをそのまま利用する
- コマンド名とサブコマンド名は既存のパターン（`resources action`）に従う
- テンプレート ID はユーザーが ClickUp UI から取得する前提（テンプレート一覧 API は未提供）
