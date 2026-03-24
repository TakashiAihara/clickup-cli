# Data Model: Single Binary Release

この機能はインフラ/CI 構成のみ。新規のデータモデル・エンティティは不要。

## 成果物

| Artifact | Format | 説明 |
|----------|--------|------|
| `clickup-linux-x64` | ELF binary | Linux x86_64 用バイナリ |
| `clickup-darwin-arm64` | Mach-O binary | macOS Apple Silicon 用バイナリ |
| `clickup-darwin-x64` | Mach-O binary | macOS Intel 用バイナリ |

## Release Metadata

GitHub Release が管理。追加のデータストアなし。

- Tag: `v{semver}` (e.g., `v0.1.0`)
- Assets: 上記 3 バイナリ
- Notes: `--generate-notes` で自動生成（conventional commits ベース）
