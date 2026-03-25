# Contract: CLI Commands (005-task-advanced)

## Tasks コマンド追加

### 依存関係・リンク

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks add-dependency` | `--task-id <id>` `--depends-on <id>` `--output <format>` | `POST /v2/task/{id}/dependency` |
| `tasks remove-dependency` | `--task-id <id>` `--depends-on <id>` | `DELETE /v2/task/{id}/dependency` |
| `tasks add-link` | `--task-id <id>` `--links-to <id>` `--output <format>` | `POST /v2/task/{id}/link/{links_to}` |
| `tasks remove-link` | `--task-id <id>` `--links-to <id>` | `DELETE /v2/task/{id}/link/{links_to}` |

### 時間トラッキング（タスク単位）

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks time` | `--task-id <id>` `--output <format>` | `GET /v2/task/{id}/time` |
| `tasks track-time` | `--task-id <id>` `--duration <ms>` `--output <format>` | `POST /v2/task/{id}/time` |
| `tasks edit-time` | `--task-id <id>` `--interval-id <id>` `--duration <ms>` `--output <format>` | `PUT /v2/task/{id}/time/{interval_id}` |
| `tasks delete-time` | `--task-id <id>` `--interval-id <id>` | `DELETE /v2/task/{id}/time/{interval_id}` |

### チェックリスト

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks create-checklist` | `--task-id <id>` `--name <name>` `--output <format>` | `POST /v2/task/{id}/checklist` |

### メンバー・ゲスト

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks members` | `--task-id <id>` `--output <format>` | `GET /v2/task/{id}/member` |
| `tasks add-guest` | `--task-id <id>` `--guest-id <gid>` `--output <format>` | `POST /v2/task/{id}/guest/{gid}` |
| `tasks remove-guest` | `--task-id <id>` `--guest-id <gid>` | `DELETE /v2/task/{id}/guest/{gid}` |

### タグ

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks add-tag` | `--task-id <id>` `--tag-name <name>` `--output <format>` | `POST /v2/task/{id}/tag/{tag_name}` |
| `tasks remove-tag` | `--task-id <id>` `--tag-name <name>` | `DELETE /v2/task/{id}/tag/{tag_name}` |

### 添付・マージ・ステータス滞在時間

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `tasks attach` | `--task-id <id>` `--file <path>` `--output <format>` | `POST /v2/task/{id}/attachment` |
| `tasks merge` | `--task-id <id>` `--merge-with <id>` `--output <format>` | `POST /v2/task/{id}/merge` |
| `tasks time-in-status` | `--task-id <id>` `--output <format>` | `GET /v2/task/{id}/time_in_status` |
| `tasks bulk-time-in-status` | `--task-ids <id1,id2,...>` `--output <format>` | `GET /v2/task/bulk_time_in_status/task_ids` |

## Comments コマンド追加

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `comments replies` | `--comment-id <id>` `--output <format>` | `GET /v2/comment/{id}/reply` |
| `comments reply` | `--comment-id <id>` `--body <text>` `--output <format>` | `POST /v2/comment/{id}/reply` |
