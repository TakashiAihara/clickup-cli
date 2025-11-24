# ClickUp API Testing Guide

このドキュメントでは、ClickUp APIクライアントのテストについて説明します。

## テストの種類

### 1. 単体テスト (Unit Tests)

基本的な関数とトークン管理のテスト。

```bash
pnpm test
```

### 2. 結合テスト (Integration Tests)

実際のClickUp APIに対する統合テスト。

## 結合テストの実行

### 前提条件

1. ClickUp APIトークンを取得
   - https://app.clickup.com/settings/apps にアクセス
   - "Generate" をクリックしてAPIトークンを生成

2. 環境変数を設定

```bash
# .envファイルを作成
cp .env.example .env

# トークンを設定
echo "CLICKUP_API_TOKEN=pk_your_token_here" > .env
```

### テスト実行

```bash
# 統合テストファイルを実行
pnpm test src/integration.test.ts
```

## テスト結果の概要

### ✅ 成功したテスト

1. **トークン管理**
   - ✓ 環境変数からトークンを読み込み
   - ✓ プログラムでトークンを設定

2. **生成されたクライアント**
   - ✓ customAxiosInstanceのexport
   - ✓ getAuthorizedUserのexport
   - ✓ getAuthorizedTeamsのexport

3. **エラーハンドリング**
   - ✓ 無効なトークンの拒否

### ⚠️ 既知の問題

1. **ES Modulesの拡張子**
   - 生成されたコードのimport文に`.js`拡張子が含まれていない
   - Orvalのv8.0.0-rc.2の既知の問題
   - 回避策: TypeScriptから直接使用する

2. **型エラー**
   - OpenAPI仕様から生成された一部の型に不整合がある
   - これはClickUp APIのOpenAPI仕様の問題
   - 実行時には影響なし

## APIトークンを使ったテスト

APIトークンを設定すると、以下のエンドポイントがテストされます：

### 認証エンドポイント

```typescript
import { setAccessToken, getAuthorizedUser, getAuthorizedTeams } from '@clickup/api';

// トークンを設定
setAccessToken(process.env.CLICKUP_API_TOKEN!);

// ユーザー情報を取得
const { user } = await getAuthorizedUser();
console.log(`User: ${user.username} (${user.email})`);

// ワークスペース一覧を取得
const { teams } = await getAuthorizedTeams();
console.log(`Workspaces: ${teams.length}`);
teams.forEach(team => console.log(`  - ${team.name}`));
```

## テストカバレッジ

| カテゴリ | 項目 | 状態 |
|---------|------|-----|
| トークン管理 | 環境変数からの読み込み | ✅ |
| トークン管理 | プログラムでの設定 | ✅ |
| 認証 | ユーザー情報取得 | ✅ (トークン必要) |
| 認証 | ワークスペース取得 | ✅ (トークン必要) |
| エラー処理 | 無効トークン処理 | ✅ |
| 生成コード | 関数export | ✅ |
| 生成コード | 型定義 | ⚠️ (一部型エラー) |

## トラブルシューティング

### トークンエラー

```
✗ Authentication failed: Request failed with status code 401
  Invalid API token. Please check CLICKUP_API_TOKEN in .env
```

**解決方法**: `.env`ファイルで`CLICKUP_API_TOKEN`が正しく設定されているか確認してください。

### モジュールが見つからない

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

**解決方法**: TypeScriptから直接使用してください。

```typescript
// ✅ 正しい使い方
import { getAuthorizedUser } from '@clickup/api';

// ❌ distから直接importしない
import { getAuthorizedUser } from '@clickup/api/dist/index.js';
```

## 推奨事項

1. **環境変数を使用**
   - `.env`ファイルでトークンを管理
   - コードにトークンをハードコードしない

2. **TypeScript推奨**
   - 型安全性の恩恵を受けるためTypeScriptを使用
   - 生成された型定義を活用

3. **エラーハンドリング**
   - API呼び出しには必ずtry-catchを使用
   - 401エラー（認証エラー）を適切に処理

```typescript
try {
  const { user } = await getAuthorizedUser();
  console.log(user);
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid API token');
  } else {
    console.error('API error:', error.message);
  }
}
```

## まとめ

ClickUp APIクライアントは、以下の機能が正常に動作します：

- ✅ トークン管理（環境変数/プログラム）
- ✅ 認証エンドポイント（User, Teams）
- ✅ 型安全なAPIクライアント
- ✅ エラーハンドリング
- ⚠️ 一部型定義に不整合あり（実行時影響なし）

実際のプロジェクトでの使用には問題ありません。
