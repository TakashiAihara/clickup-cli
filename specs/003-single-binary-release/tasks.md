# Tasks: Single Binary Release Pipeline

**Input**: Design documents from `/specs/003-single-binary-release/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Directory structure and prerequisite configuration

- [ ] T001 Create `.github/workflows/` directory
- [ ] T002 [P] Add binary output patterns to `.gitignore` (clickup, clickup-*)
- [ ] T003 [P] Update `apps/cli/package.json` build script from `tsc` to `bun build --compile --outfile dist/clickup`

---

## Phase 2: User Story 3 - 機密情報確認 (Priority: P1 - blocking for public化)

**Goal**: リポジトリを public にする前に機密情報が含まれていないことを確認

**Independent Test**: `git log --all -p | grep -E 'pk_[0-9]|sk_|secret|password' ` で実トークンがヒットしないこと

- [ ] T004 [US3] Run full git history scan for secrets (tokens, API keys, private keys) and document results in research.md
- [ ] T005 [US3] Verify `.gitignore` covers all sensitive patterns (.env, .env.*, credentials.json, *.pem, *.key)
- [ ] T006 [US3] Confirm encrypted token storage implementation does not leak plaintext in logs or error output

**Checkpoint**: 機密情報なしが確認済み → public 化可能

---

## Phase 3: User Story 2 - 自動リリース (Priority: P1) 🎯 MVP

**Goal**: タグを打つだけで自動的にリリースが作成される

**Independent Test**: `git tag v0.0.1-test && git push origin v0.0.1-test` でRelease が作成されバイナリ3種が添付される

### Implementation

- [ ] T007 [US2] Create CI workflow in `.github/workflows/ci.yml` with triggers (push to main, PR to main), steps: checkout → setup-bun → install → typecheck → test → compile check
- [ ] T008 [US2] Create Release workflow in `.github/workflows/release.yml` with tag trigger (`v*`), matrix build strategy (ubuntu-latest/linux-x64, macos-latest/darwin-arm64, macos-13/darwin-x64)
- [ ] T009 [US2] Add build job to `.github/workflows/release.yml`: checkout → setup-bun → install → `bun build --compile --target ${{ matrix.target }} --outfile ${{ matrix.artifact }}` → upload-artifact
- [ ] T010 [US2] Add release job to `.github/workflows/release.yml`: needs build → download artifacts → `gh release create ${{ github.ref_name }} --generate-notes` with all binaries attached
- [ ] T011 [US2] Set proper permissions in release workflow (`contents: write` for gh release create)

**Checkpoint**: CI ワークフローが PR で動作し、タグ push で Release が自動作成される

---

## Phase 4: User Story 1 - バイナリダウンロード (Priority: P2)

**Goal**: ユーザーが GitHub Releases から自分のプラットフォーム用のバイナリをダウンロードして即使える

**Independent Test**: Release ページからバイナリをダウンロード → `chmod +x` → `./clickup --help` が動作する

### Implementation

- [ ] T012 [US1] Verify binary naming convention is consistent: `clickup-linux-x64`, `clickup-darwin-arm64`, `clickup-darwin-x64` in `.github/workflows/release.yml`
- [ ] T013 [US1] Add installation instructions to README.md (curl download + chmod + usage)

**Checkpoint**: ユーザーが Release からバイナリを取得して即実行可能

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 最終検証と public 化準備

- [ ] T014 Push branch and create PR to verify CI workflow runs
- [ ] T015 Merge PR and create test tag `v0.0.1` to verify release workflow
- [ ] T016 Verify all 3 platform binaries are attached to the GitHub Release
- [ ] T017 Clean up test binary `clickup` from repository root (generated during local testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **US3 Security (Phase 2)**: Can run in parallel with Setup (research-only, no code changes)
- **US2 Release (Phase 3)**: Depends on Phase 1 (needs .github/workflows/ directory)
- **US1 Download (Phase 4)**: Depends on Phase 3 (needs release workflow to exist)
- **Polish (Phase 5)**: Depends on all previous phases

### User Story Dependencies

- **US3 (Security)**: Independent — research task, no code dependencies
- **US2 (Release)**: Depends on Setup (T001-T003) for directory and build config
- **US1 (Download)**: Depends on US2 (needs working release to verify download flow)

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004, T005, T006 can all run in parallel (all read-only investigation)
- T007 and T008 can be started in parallel (different workflow files), but T009-T010 depend on T008

---

## Parallel Example: Setup Phase

```bash
# These can run simultaneously:
Task: "Add binary output patterns to .gitignore"
Task: "Update apps/cli/package.json build script"
```

---

## Implementation Strategy

### MVP First (US3 + US2)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Security scan confirmation (T004-T006) — already done in research
3. Complete Phase 3: CI + Release workflows (T007-T011)
4. **STOP and VALIDATE**: Push PR → verify CI → merge → tag → verify Release
5. Proceed to US1 (README) and Polish

### Summary

| Phase | Tasks | Parallel? |
|-------|-------|-----------|
| Setup | T001-T003 | T002, T003 parallel |
| US3 Security | T004-T006 | All parallel (read-only) |
| US2 Release | T007-T011 | T007∥T008, then T009→T010→T011 |
| US1 Download | T012-T013 | Sequential |
| Polish | T014-T017 | Sequential (depends on CI results) |

---

## Notes

- US3 (Security) は research.md で調査済み。T004-T006 は確認・文書化のみ
- バイナリサイズは ~101MB (Bun ランタイム込み) — 正常範囲
- `bun build --compile` は既にローカルで動作確認済み（308 modules, 138ms）
- Commit after each task or logical group
