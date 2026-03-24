# Research: Single Binary Release Pipeline

**Date**: 2026-03-24

## R-1: 機密情報スキャン結果

**Decision**: リポジトリは public 化可能

**Findings**:
- `.env` にリアルトークン `pk_89425488_...` が存在するが `.gitignore` 済み
- **git history に機密情報の漏洩なし** — 履歴中の `pk_*` は全てテスト用プレースホルダー
- 暗号化実装（AES-256-GCM）は適切に動作
- トークンマスキング、ファイルパーミッション（0600/0700）も実装済み

**対処事項**:
- ローカル `.env` のトークンをローテーション推奨
- `.env` のパーミッションを 664 → 600 に修正推奨
- （任意）pre-commit hook で `pk_` パターン検出

## R-2: シングルバイナリビルド

**Decision**: `bun build --compile` を採用

**Rationale**:
- 実証済み: 308 モジュール → 101MB バイナリ、138ms でビルド、正常動作確認
- クロスコンパイルサポート: `--target` フラグで他プラットフォーム向けビルド可能

**ターゲットプラットフォーム**:
| Target | Bun flag |
|--------|----------|
| Linux x64 | `bun-linux-x64` |
| macOS ARM | `bun-darwin-arm64` |
| macOS x64 | `bun-darwin-x64` |

**Alternatives considered**:
- `pkg` (Node.js): Bun 対応なし、メンテ停止気味
- `esbuild + sea`: Node.js SEA は experimental、Bun 直接ビルドのほうがシンプル

## R-3: GitHub Actions 構成

**Decision**: 2 ワークフロー構成

**CI ワークフロー** (PR + push to main):
- `bun install` → `bun run typecheck` → `bun run test` → `bun run build`

**Release ワークフロー** (tag push `v*`):
- matrix ビルド: ubuntu-latest (linux-x64), macos-latest (darwin-arm64), macos-13 (darwin-x64)
- `bun build --compile --target <platform>` で各バイナリ生成
- `gh release create` でバイナリ添付

**Rationale**: Bun は GitHub Actions の公式 setup-bun action で対応。matrix ビルドでネイティブ環境から直接コンパイルが最も確実。

**Alternatives considered**:
- クロスコンパイル（1 runner で全プラットフォーム）: Bun はクロスコンパイルに対応しているが、ネイティブビルドのほうが互換性が高い
- semantic-release: 現時点では手動タグで十分。後から追加可能

## R-4: 現状の CI/CD

**Finding**: GitHub Actions 未設定（.github/workflows/ 不在）

既存ビルド構成:
- `tsc` で TypeScript → JavaScript 変換（apps/cli）
- `bun run src/index.ts` で開発実行
- バイナリエントリポイント: `apps/cli/dist/index.js`（Node.js 依存）
