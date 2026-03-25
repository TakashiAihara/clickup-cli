# Research: Hierarchy Commands Expansion

**Date**: 2026-03-24

## R-1: 既存コマンド実装パターン

**Decision**: 既存パターンに完全準拠

**Rationale**: 全コマンドが同一パターン（`ensureAuth()` → generated API 関数呼び出し → json/table 分岐出力）で実装されている。新規コマンドも同じパターンで追加するのが最もシンプル。

**Pattern**:
1. `@clickup/api` から generated 関数を import
2. `ensureAuth()` でトークン設定
3. API 呼び出し
4. `--output json` なら `JSON.stringify(result, null, 2)`、table なら TSV 風出力

## R-2: Generated API 関数の利用可否

**Decision**: Orval 生成済み関数を利用

**Rationale**: `packages/clickup-api/src/generated/api.ts` に全 OpenAPI エンドポイントの関数が生成済み。新規コマンドは生成関数を呼ぶだけでよい。

**対象関数（確認済み）**:
- `getSpaceAvailableFields`, `GetSpaceTags`, `CreateSpaceTag`, `EditSpaceTag`, `DeleteSpaceTag`
- `getFolderAvailableFields`, `AddGuestToFolder`, `RemoveGuestFromFolder`
- `GetAccessibleCustomFields`, `GetListMembers`, `AddGuestToList`, `RemoveGuestFromList`
- `AddTaskToList`, `RemoveTaskFromList`
- `CreateFolderFromTemplate`, `CreateSpaceListFromTemplate`, `CreateFolderListFromTemplate`, `CreateTaskFromTemplate`
- `GetChatViewComments`, `CreateChatViewComment`

## R-3: テンプレート ID の取得方法

**Decision**: ユーザーが ClickUp UI から取得する前提

**Rationale**: ClickUp API v2 にはテンプレート一覧を取得するエンドポイントがない。テンプレート ID はUI の URL やブラウザ DevTools から取得可能。
