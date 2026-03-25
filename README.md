# ClickUp CLI

TypeScript + monorepo構成のClickUp CLIツールです。コマンドラインからClickUpのワークスペースを管理できます。

## アーキテクチャ

- **monorepo構成**: Bunワークスペースによる効率的なビルドとタスク管理
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

### GitHub Releases からダウンロード（推奨）

```bash
# Linux (x64)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-linux-x64 -o clickup
chmod +x clickup
./clickup --help

# macOS (Apple Silicon)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-darwin-arm64 -o clickup
chmod +x clickup
./clickup --help

# macOS (Intel)
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-darwin-x64 -o clickup
chmod +x clickup
./clickup --help
```

### ソースからビルド

```bash
bun install
bun run build
```

## 使用方法

### 認証

```bash
# ClickUpにログイン（アクセストークンが必要）
clickup auth login

# 認証状態を確認
clickup auth status

# ログアウト
clickup auth logout
```

### Spaces管理

```bash
# チーム内のスペース一覧を表示
clickup spaces list --team-id <TEAM_ID>
```

### Lists管理

```bash
# スペース内のリスト一覧を表示
clickup lists list --space-id <SPACE_ID>
```

### Tasks管理

```bash
# リスト内のタスク一覧を表示
clickup tasks list --list-id <LIST_ID>

# 新しいタスクを作成
clickup tasks create --list-id <LIST_ID> --name "タスク名"

# タスクの詳細を表示
clickup tasks show <TASK_ID>

# タスクを更新
clickup tasks update <TASK_ID> --name "新しい名前" --status "完了"

# タスクを削除
clickup tasks delete <TASK_ID>
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
# 依存関係をインストール
bun install

# 開発モードで実行
bun run dev

# リント
bun run lint

# 型チェック
bun run typecheck

# テスト
bun run test

# シングルバイナリをビルド
bun build apps/cli/src/index.ts --compile --outfile clickup
```

開発中は `bun run dev` で直接実行できます:

```bash
bun run dev -- auth login
bun run dev -- tasks list --list-id <LIST_ID>
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
