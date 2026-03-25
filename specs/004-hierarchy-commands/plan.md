# Implementation Plan: Hierarchy Commands Expansion

**Branch**: `004-hierarchy-commands` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-hierarchy-commands/spec.md`

## Summary

スペース・フォルダ・リスト・ビューの未実装 20 エンドポイントに対応する CLI サブコマンドを追加する。カスタムフィールド一覧、スペースタグ CRUD、メンバー確認、タスク移動、ゲスト管理、テンプレート作成、ビューコメントをカバー。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Bun 1.x
**Primary Dependencies**: Commander (CLI), Orval 生成 API クライアント
**Storage**: N/A
**Testing**: Vitest
**Target Platform**: linux-x64, darwin-arm64, darwin-x64
**Project Type**: CLI tool (monorepo)
**Performance Goals**: N/A（CLI コマンド追加のみ）
**Constraints**: 既存コマンドパターンに準拠
**Scale/Scope**: 20 サブコマンド追加

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Architecture | PASS | 既存 apps/cli にサブコマンド追加のみ |
| II. Schema-Driven Development | PASS | Orval 生成関数を利用 |
| III. Functions-First | PASS | 既存パターン（関数ベース）を踏襲 |
| IV. CLI-First Interface | PASS | 全コマンドで json/table 出力対応 |
| V. Configuration & Security | PASS | 既存 ensureAuth() パターンを使用 |
| VI. Test Discipline & CI/CD | PASS | CI 自動実行済み |

## Project Structure

### Documentation (this feature)

```text
specs/004-hierarchy-commands/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── commands.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/cli/src/commands/
├── spaces.ts       # UPDATE: fields, tags CRUD, template commands 追加
├── folders.ts      # UPDATE: fields, guest, template commands 追加
├── lists.ts        # UPDATE: fields, members, guest, task move, template commands 追加
└── views.ts        # UPDATE: comments, create-comment 追加
```

**Structure Decision**: 既存の 4 コマンドファイルにサブコマンドを追加する。新規ファイル不要。
