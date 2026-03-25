# Data Model: Hierarchy Commands Expansion

この機能は既存の CLI コマンド群にサブコマンドを追加する。新規のデータストアやエンティティ定義は不要。

## API レスポンスエンティティ（参照のみ）

| Entity | 主要フィールド | 取得元 |
|--------|-------------|--------|
| Custom Field | id, name, type, type_config, required | `GET /space|folder|list/{id}/field` |
| Space Tag | name, tag_fg, tag_bg | `GET /space/{id}/tag` |
| List Member | id, username, email, role | `GET /list/{id}/member` |
| Guest | id, email, username | `POST/DELETE /folder|list/{id}/guest/{gid}` |
| View Comment | id, comment_text, user, date | `GET/POST /view/{id}/comment` |

## バリデーションルール

- Space/Folder/List/View の ID は必須パラメータ
- タグ名は必須（create/edit/delete）
- ゲスト ID は必須（add/remove）
- テンプレート ID は必須（create-from-template）
