# Tasks: Encrypted Token Storage

**Input**: Design documents from `/specs/002-encrypted-token-storage/`

## Phase 1: Crypto Module

- [x] T001 Create `apps/cli/src/crypto.ts` with encrypt/decrypt/deriveKey functions
- [x] T002 Unit tests for crypto (encrypt → decrypt roundtrip, tamper detection)

## Phase 2: Config Rewrite

- [x] T003 Rewrite `apps/cli/src/config.ts` to use XDG paths and encrypted credentials
- [x] T004 Update `apps/cli/src/commands/auth.ts` to use new config API
- [x] T005 Update `apps/cli/src/commands/tasks.ts` to use new getToken

## Phase 3: Migration

- [x] T006 Implement `migrateFromLegacy()` in config.ts
- [x] T007 Test migration from `~/.clickup-cli/config.json` to new location

## Phase 4: Test & Verify

- [x] T008 Update `apps/cli/src/config.test.ts` for new config paths and encryption
- [x] T009 Run full test suite to ensure no regressions
- [x] T010 Verify credentials.json contains no plaintext token
