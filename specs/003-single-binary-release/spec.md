# Feature Specification: Single Binary Release Pipeline

**Feature ID**: 003-single-binary-release
**Date**: 2026-03-24
**Status**: Draft

## Overview

GitHub Actions で Bun のシングルバイナリビルドを自動化し、GitHub Releases でマルチプラットフォームバイナリを配布可能にする。リポジトリを public にする前に機密情報の混入がないことを確認する。

## User Stories

1. ユーザーとして、GitHub Releases から自分のプラットフォーム用のバイナリをダウンロードして即使いたい
2. メンテナーとして、タグを打つだけで自動的にリリースが作成されてほしい
3. メンテナーとして、リポジトリを public にする前に機密情報が含まれていないことを確認したい

## Functional Requirements

### FR-1: シングルバイナリビルド
- `bun build --compile` でクロスプラットフォームバイナリを生成
- ターゲット: linux-x64, darwin-arm64, darwin-x64 (最低限)

### FR-2: GitHub Actions CI/CD
- PR 時: ビルド + テスト + 型チェック
- タグ push 時: マルチプラットフォームビルド + GitHub Release 作成
- バイナリを Release Assets として添付

### FR-3: 機密情報調査
- git history 全体のスキャン（トークン、API キー、秘密鍵等）
- .env ファイルや設定ファイルの確認
- 問題があれば public 化前に対処

## Non-Functional Requirements

- ビルド再現性: 同一コミットから同一バイナリが生成される
- CI 実行時間: 5 分以内目標

## Acceptance Criteria

- [ ] `bun build --compile` がCIで成功する
- [ ] タグ push で GitHub Release が自動作成される
- [ ] 3 プラットフォーム分のバイナリが Release に添付される
- [ ] 機密情報スキャンで問題がないことが確認済み
