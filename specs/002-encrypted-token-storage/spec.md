# Feature Specification: Encrypted Token Storage

**ID**: 002-encrypted-token-storage
**Date**: 2026-03-17
**Priority**: P1 (Security)

## Summary

CLI の `auth login` で受け取った API トークンを暗号化して XDG 準拠のディレクトリ（`~/.config/clickup-cli/`）に保存する。現在は平文で `~/.clickup-cli/config.json` に保存しており、セキュリティリスクがある。

## User Stories

### US1: トークンの暗号化保存
ユーザーが `auth login` でトークンを入力すると、暗号化されてディスクに保存される。

### US2: トークンの復号読み出し
CLI コマンド実行時にトークンを復号して API 呼び出しに使用する。ユーザーに追加操作は不要。

### US3: XDG 準拠の保存先
設定ファイルは `$XDG_CONFIG_HOME/clickup-cli/` （デフォルト `~/.config/clickup-cli/`）に保存される。

### US4: 旧設定からのマイグレーション
既存の `~/.clickup-cli/config.json` がある場合、自動的に新しい場所に移行して旧ファイルを削除する。

## Acceptance Criteria

- トークンがディスク上で平文で保存されないこと
- `~/.config/clickup-cli/credentials.json` に暗号化されたトークンが保存されること
- 環境変数 `CLICKUP_API_TOKEN` による上書きは引き続き動作すること
- 旧設定ファイルからの自動マイグレーションが動作すること
- 設定ファイルのパーミッションが 0600 であること
