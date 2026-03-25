# Research: Advanced Task Commands

**Date**: 2026-03-24

## R-1: 既存コマンド実装パターン

**Decision**: 既存パターンに完全準拠（004 と同一）

**Pattern**: `ensureAuth()` → generated API 関数呼び出し → json/table 分岐出力

## R-2: 添付ファイルアップロード

**Decision**: multipart/form-data で送信

**Rationale**: ClickUp API の `POST /task/{id}/attachment` は `multipart/form-data` を期待。Orval 生成関数が FormData を扱うコードを出力済み。CLI 側では `--file <path>` オプションでローカルファイルパスを受け取り、`fs.readFile` + FormData で送信。

**Alternatives considered**:
- Base64 エンコード送信: ClickUp API が対応していないため不可

## R-3: 依存関係のタイプ

**Decision**: ClickUp API がサポートする 2 種類を提供

**Types**:
- `waiting_on`: このタスクは指定タスクの完了を待っている
- `blocking`: このタスクは指定タスクをブロックしている

API の `POST /task/{id}/dependency` は `depends_on` または `dependency_of` パラメータでタイプを制御。

## R-4: 時間トラッキング（タスク単位 vs ワークスペース単位）

**Decision**: タスク単位のエンドポイントを tasks コマンドに追加

**Rationale**: 既存の `time` コマンドはワークスペース単位（`GET /team/{id}/time_entries`）。タスク単位（`GET /task/{id}/time`, `POST /task/{id}/time`）は tasks コマンドのサブコマンドとして追加するのが自然。

## R-5: Generated API 関数の利用可否

**Decision**: 全対象関数が Orval 生成済み

**対象関数**:
- `AddDependency`, `DeleteDependency`, `AddTaskLink`, `DeleteTaskLink`
- `Gettrackedtime`, `Tracktime`, `Edittimetracked`, `Deletetimetracked`
- `CreateChecklist`
- `GetThreadedComments`, `CreateThreadedComment`
- `GetTaskMembers`, `AddGuestToTask`, `RemoveGuestFromTask`
- `AddTagToTask`, `RemoveTagFromTask`
- `CreateTaskAttachment`, `mergeTasks`
- `GetTask'sTimeinStatus`, `GetBulkTasks'TimeinStatus`
