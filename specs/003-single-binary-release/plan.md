# Implementation Plan: Single Binary Release Pipeline

**Branch**: `003-single-binary-release` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-single-binary-release/spec.md`

## Summary

Bun のシングルバイナリビルドを GitHub Actions で自動化し、タグ push で 3 プラットフォーム向けバイナリを GitHub Releases に配布する。リポジトリ public 化前の機密情報調査を含む。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Bun 1.x
**Primary Dependencies**: Bun (build --compile), GitHub Actions (oven-sh/setup-bun)
**Storage**: N/A
**Testing**: Vitest (既存)、CI でビルド検証
**Target Platform**: linux-x64, darwin-arm64, darwin-x64
**Project Type**: CLI tool (monorepo)
**Performance Goals**: CI ビルド 5 分以内
**Constraints**: バイナリサイズ ~100MB (Bun ランタイム込み)
**Scale/Scope**: 個人 OSS ツール

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Architecture | PASS | 既存構造を維持、CI 追加のみ |
| II. Schema-Driven Development | PASS | 変更なし |
| III. Functions-First | PASS | 変更なし |
| IV. CLI-First Interface | PASS | バイナリ配布で CLI アクセス改善 |
| V. Configuration & Security | PASS | 機密情報スキャン済み、git history クリーン |
| VI. Test Discipline & CI/CD | PASS | CI ワークフロー新設で準拠 |
| Build & Distribution | PASS | `bun build --compile` は Constitution で明記済み |

## Project Structure

### Documentation (this feature)

```text
specs/003-single-binary-release/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Security audit + build research
├── data-model.md        # Release artifact definitions
├── quickstart.md        # Build & release quickstart
├── contracts/
│   └── ci-workflow.md   # CI/CD workflow contract
└── tasks.md             # (Phase 2 - /speckit.tasks)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    ├── ci.yml           # NEW: CI pipeline (PR + main push)
    └── release.yml      # NEW: Release pipeline (tag push)
apps/cli/
└── package.json         # UPDATE: build script to use bun compile
```

**Structure Decision**: 既存のモノレポ構造に `.github/workflows/` を追加するのみ。ソースコード変更は apps/cli/package.json のビルドスクリプト更新のみ。

## Implementation Phases

### Phase 1: 機密情報調査 + 対処
- [x] git history 全体スキャン → **クリーン確認済み**
- [ ] ローカル `.env` のトークンローテーション推奨をユーザーに伝達
- [ ] `.env` パーミッション修正（664 → 600）

### Phase 2: CI ワークフロー作成
- `.github/workflows/ci.yml` 作成
  - Trigger: PR to main, push to main
  - Steps: checkout → setup-bun → install → typecheck → test → build check

### Phase 3: Release ワークフロー作成
- `.github/workflows/release.yml` 作成
  - Trigger: tag push `v*`
  - Matrix build: 3 プラットフォーム
  - GitHub Release 作成 + バイナリ添付

### Phase 4: ビルドスクリプト更新
- `apps/cli/package.json` の build スクリプトを `bun build --compile` に更新
- `.gitignore` にバイナリ出力を追加

### Phase 5: 検証 + Public 化
- CI が通ることを確認
- テストタグで Release が作成されることを確認
- リポジトリを public に変更
