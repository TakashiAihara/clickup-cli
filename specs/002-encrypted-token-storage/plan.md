# Implementation Plan: Encrypted Token Storage

**Branch**: `feat/encrypted-token-storage` | **Date**: 2026-03-17
**Spec**: `specs/002-encrypted-token-storage/spec.md`

## Summary

既存の `config.ts` を書き換え、トークンを AES-256-GCM で暗号化して XDG 準拠ディレクトリに保存する。マシン固有情報から鍵を導出し、ユーザーにパスフレーズは求めない。旧設定からの自動マイグレーションも実装。

## Technical Context

- **暗号化**: Node.js `crypto` (AES-256-GCM + scrypt)
- **鍵導出**: hostname + username → scrypt → 256-bit key
- **保存先**: `$XDG_CONFIG_HOME/clickup-cli/` (default: `~/.config/clickup-cli/`)
- **依存追加**: なし（Node.js 標準ライブラリのみ）

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| V. Configuration & Security | ✅ PASS | 暗号化で平文保存を排除、0600 維持 |
| III. Functions-First | ✅ PASS | encrypt/decrypt は純粋関数 |
| II. Schema-Driven | ✅ PASS | Zod で credentials.json をバリデーション |

## Project Structure (Changes)

```
apps/cli/src/
├── config.ts          # REWRITE: XDG paths, encrypted storage
├── crypto.ts          # NEW: encrypt/decrypt/deriveKey functions
└── config.test.ts     # UPDATE: encryption tests
```

## Implementation Phases

### Phase 1: crypto.ts
- `encrypt(plaintext: string): EncryptedData`
- `decrypt(data: EncryptedData): string`
- `deriveKey(salt: Buffer): Buffer`
- Machine ID 導出

### Phase 2: config.ts リライト
- XDG パス解決
- `saveToken()` / `loadToken()` で暗号化 API を使用
- `saveConfig()` / `loadConfig()` はトークンを含まない設定のみ
- `getToken()` は env var → encrypted credentials の優先順

### Phase 3: マイグレーション
- `migrateFromLegacy()`: `~/.clickup-cli/config.json` から移行
- `getToken()` 内で自動検出・実行
- stderr にメッセージ出力

### Phase 4: テスト更新
- crypto ユニットテスト（encrypt/decrypt ラウンドトリップ）
- config テスト更新（新パス、暗号化確認）
- マイグレーションテスト
- 既存インテグレーションテストが壊れていないことを確認
