# ClickUp CLI

TypeScript + monorepo構成のClickUp CLIツールです。コマンドラインからClickUpのワークスペースを管理できます。

## アーキテクチャ

- **monorepo構成**: Turboを使った効率的なビルドとタスク管理
- **TypeScript**: 型安全な開発環境
- **モジュラー設計**: パッケージごとに分離された機能

### パッケージ構成

```
├── packages/
│   ├── clickup-api/          # ClickUp API クライアントライブラリ
│   └── clickup-cli-core/     # CLIコマンドのコア機能
└── apps/
    └── cli/                  # メインのCLIアプリケーション
```

## インストール

```bash
# 依存関係をインストール
npm install

# すべてのパッケージをビルド
npm run build
```

## 使用方法

### 認証

```bash
# ClickUpにログイン（アクセストークンが必要）
node apps/cli/dist/index.js auth login

# 認証状態を確認
node apps/cli/dist/index.js auth status

# ログアウト
node apps/cli/dist/index.js auth logout
```

### Spaces管理

```bash
# チーム内のスペース一覧を表示
node apps/cli/dist/index.js spaces list --team-id <TEAM_ID>
```

### Lists管理

```bash
# スペース内のリスト一覧を表示
node apps/cli/dist/index.js lists list --space-id <SPACE_ID>
```

### Tasks管理

```bash
# リスト内のタスク一覧を表示
node apps/cli/dist/index.js tasks list --list-id <LIST_ID>

# 新しいタスクを作成
node apps/cli/dist/index.js tasks create --list-id <LIST_ID> --name "タスク名"

# タスクの詳細を表示
node apps/cli/dist/index.js tasks show <TASK_ID>

# タスクを更新
node apps/cli/dist/index.js tasks update <TASK_ID> --name "新しい名前" --status "完了"

# タスクを削除
node apps/cli/dist/index.js tasks delete <TASK_ID>
```

## 設定

設定ファイルは `~/.clickup-cli/config.json` に保存されます。

## ClickUp API トークンの取得

1. ClickUpにログイン
2. 設定 > アプリ > API トークン
3. 新しいアプリを作成またはPersonal APIトークンを生成
4. 生成されたトークンをCLIの認証で使用

## 開発

```bash
# 開発モードで実行
npm run dev

# リント
npm run lint

# 型チェック
npm run typecheck

# テスト
npm run test

# クリーンビルド
npm run clean && npm run build
```

## 主な機能

- **認証管理**: ClickUp APIトークンによる認証
- **Space管理**: チーム内のスペース一覧表示
- **List管理**: スペース内のリスト表示
- **Task管理**: 
  - タスクの一覧表示、作成、更新、削除
  - ステータス、担当者、期限の管理
  - インタラクティブなタスク作成
- **設定管理**: ローカル設定ファイルによる設定保存

## API対応状況

ClickUp APIの主要エンドポイントに対応:
- `/user` - ユーザー情報取得
- `/team/{team_id}/space` - スペース一覧
- `/space/{space_id}/list` - リスト一覧
- `/list/{list_id}/task` - タスク一覧・作成
- `/task/{task_id}` - タスク取得・更新・削除
- `/search/tasks` - タスク検索