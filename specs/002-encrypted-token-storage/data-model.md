# Data Models: Encrypted Token Storage

**Feature**: 002-encrypted-token-storage
**Date**: 2026-03-17

## Entity: EncryptedCredentials

ディスク上に保存される暗号化トークンの構造。

### Attributes

| Field | Type | Notes |
|-------|------|-------|
| `version` | number | フォーマットバージョン（現在 1） |
| `salt` | string (hex) | scrypt 用ソルト（32 bytes） |
| `iv` | string (hex) | AES-GCM 初期化ベクトル（16 bytes） |
| `tag` | string (hex) | GCM 認証タグ（16 bytes） |
| `encrypted` | string (hex) | 暗号化されたトークン |

### Zod Schema

```typescript
const encryptedCredentialsSchema = z.object({
  version: z.literal(1),
  salt: z.string().regex(/^[0-9a-f]+$/),
  iv: z.string().regex(/^[0-9a-f]+$/),
  tag: z.string().regex(/^[0-9a-f]+$/),
  encrypted: z.string().regex(/^[0-9a-f]+$/),
});
```

## Entity: Config

非機密設定（トークンを含まない）。

### Attributes

| Field | Type | Notes |
|-------|------|-------|
| `default_list_id` | string? | デフォルトのリスト ID |
| `output_format` | 'table' \| 'json' | 出力形式（デフォルト: table） |

## File Layout

```
~/.config/clickup-cli/
├── credentials.json  # 暗号化トークン (0600)
└── config.json       # 非機密設定 (0600)
```
