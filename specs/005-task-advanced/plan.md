# Implementation Plan: Advanced Task Commands

**Branch**: `005-task-advanced` | **Date**: 2026-03-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-task-advanced/spec.md`

## Summary

タスクの依存関係・リンク、タスク単位の時間トラッキング、チェックリスト、スレッド返信、メンバー/ゲスト管理、タグ操作、添付ファイル、マージ、ステータス滞在時間の 22 エンドポイントに対応する CLI コマンドを追加する。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Bun 1.x
**Primary Dependencies**: Commander (CLI), Orval 生成 API クライアント
**Storage**: N/A
**Testing**: Vitest
**Target Platform**: linux-x64, darwin-arm64, darwin-x64
**Project Type**: CLI tool (monorepo)
**Performance Goals**: N/A（CLI コマンド追加のみ）
**Constraints**: 既存コマンドパターンに準拠。添付ファイルは multipart/form-data。
**Scale/Scope**: 22 サブコマンド追加

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
specs/005-task-advanced/
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
├── tasks.ts        # UPDATE: dependency, link, time, checklist, member, guest, tag, attach, merge, time-in-status 追加
└── comments.ts     # UPDATE: replies, reply 追加
```

**Structure Decision**: 既存の 2 コマンドファイルにサブコマンドを追加する。新規ファイル不要。
