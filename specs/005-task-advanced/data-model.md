# Data Model: Advanced Task Commands

既存の CLI にサブコマンドを追加する。新規のデータストアは不要。

## API レスポンスエンティティ（参照のみ）

| Entity | 主要フィールド | 取得元 |
|--------|-------------|--------|
| Dependency | task_id, depends_on, dependency_of, type | `POST/DELETE /task/{id}/dependency` |
| Task Link | task_id, links_to | `POST/DELETE /task/{id}/link/{links_to}` |
| Time Entry | id, task, wid, user, start, end, duration | `GET/POST /task/{id}/time` |
| Checklist | id, name, task_id, items[] | `POST /task/{id}/checklist` |
| Threaded Reply | id, comment_text, user, date, parent | `GET/POST /comment/{id}/reply` |
| Task Member | id, username, email, role | `GET /task/{id}/member` |
| Attachment | id, title, url, size, type | `POST /task/{id}/attachment` |
| Time In Status | status, total_time, orderindex | `GET /task/{id}/time_in_status` |

## バリデーションルール

- タスク ID は全コマンドで必須
- 依存関係: `--depends-on` または `--dependency-of` のいずれか必須
- 時間エントリ: `--duration` は正の整数（ミリ秒）
- 添付ファイル: `--file` はローカルファイルパス（存在確認）
- タグ名: 空文字不可
