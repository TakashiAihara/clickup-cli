# Research Notes: Encrypted Token Storage

**Date**: 2026-03-17
**Feature**: 002-encrypted-token-storage

## Technical Decisions

### 1. 暗号化方式

**Decision**: Node.js 標準の `crypto` モジュールで AES-256-GCM を使用。

**Rationale**:
- 外部依存なし（Node.js / Bun 組み込み）
- AES-256-GCM は認証付き暗号化で改竄検知も可能
- CLI ツールとして適切なセキュリティレベル

**Alternatives Considered**:
- `libsecret` / macOS Keychain: プラットフォーム依存、Bun での互換性不明
- `keytar`: native addon で Bun single binary に不向き
- XOR / Base64: セキュリティ不十分

**Implementation**:
```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
```

### 2. 暗号化キーの導出

**Decision**: マシン固有情報（hostname + username）からキーを導出。

**Rationale**:
- ユーザーにパスフレーズを求めない（CLI ツールの利便性優先）
- マシン間でのコピー防止
- 十分なエントロピーを salt + scrypt で確保

**Key derivation**:
```typescript
import { hostname, userInfo } from 'node:os';

function deriveKey(salt: Buffer): Buffer {
  const machineId = `${hostname()}:${userInfo().username}`;
  return scryptSync(machineId, salt, KEY_LENGTH);
}
```

### 3. 保存先ディレクトリ

**Decision**: XDG Base Directory 準拠。`$XDG_CONFIG_HOME/clickup-cli/`

**Rationale**:
- Linux: `~/.config/clickup-cli/`
- macOS: `$XDG_CONFIG_HOME` が未設定なら `~/.config/clickup-cli/`（macOS でも慣習的に使われる）
- 業界標準に準拠

**Implementation**:
```typescript
const configDir = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, 'clickup-cli')
  : join(homedir(), '.config', 'clickup-cli');
```

### 4. ファイルフォーマット

**Decision**: `credentials.json` に暗号化データを保存、`config.json` に設定を分離。

```json
// credentials.json (encrypted token)
{
  "version": 1,
  "salt": "<hex>",
  "iv": "<hex>",
  "tag": "<hex>",
  "encrypted": "<hex>"
}

// config.json (non-sensitive settings)
{
  "default_list_id": null,
  "output_format": "table"
}
```

### 5. マイグレーション戦略

**Decision**: `getToken()` 呼び出し時に旧設定を検出して自動マイグレーション。

1. `~/.clickup-cli/config.json` が存在するか確認
2. 存在すればトークンを読み出し、暗号化して新ディレクトリに保存
3. 旧設定の非トークン設定も移行
4. 旧ファイルを削除
5. stderr に移行メッセージを表示
