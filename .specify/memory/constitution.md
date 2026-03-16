<!--
  Sync Impact Report (generated)
  ==============================
  Version change: 1.1.0 → 1.2.0
  Modified principles: Extended Core Principles from I-V to VI
  Added sections: None (new principle within Core Principles)
  Removed sections: None
  Templates requiring updates: ✅ No updates needed
  Follow-up TODOs: None
-->

# ClickUp CLI Constitution

## Core Principles

### I. Monorepo Architecture
The codebase MUST maintain the monorepo structure with clear separation:
- `packages/clickup-api`: Auto-generated API client from ClickUp OpenAPI spec
- `packages/clickup-cli-core`: Core CLI commands and business logic
- `apps/cli`: Main entry point wiring commands together
All packages MUST be independently testable and maintain clear dependency
direction (apps → core → api).

**Rationale**: Separation of concerns allows independent development,
testing, and future reuse of the API client. Generated code is isolated to
prevent manual edits.

### II. Schema-Driven Development
OpenAPI specification is the single source of truth. The development workflow
MUST follow:
1. **API Client Generation**: Use orval to generate TypeScript client from
   OpenAPI spec. Generated code is read-only; manual edits prohibited.
2. **Runtime Validation**: Define Zod schemas for all user inputs and API
   responses. Validation layer protects against spec drift and malformed data.
3. **Spec Maintenance**: Keep OpenAPI spec updated with ClickUp API changes.
   Spec updates trigger regeneration and require corresponding test updates.

**Rationale**: Double-layer schema approach (generated types + runtime Zod
validation) ensures type safety at compile time and data integrity at runtime.
The spec becomes the contract across all layers.

### III. Functions-First, Classes Minimal
Code MUST default to pure functions and functional composition. Classes are
permitted ONLY when necessary:
- **Allowed**: Stateful services (e.g., API client with auth), configuration
  holders, complex invariants that cannot be expressed with functions alone
- **Prohibited**: Class-based utility modules, anemic domain models,过度な
  オブジェクト指向設計

Dependency injection pattern: Prefer explicit function arguments over constructor
injection. Keep functions small (< 50 lines), pure where possible, and easily
testable without mocking frameworks.

**Rationale**: Functional code is more testable, reusable, and predictable.
CLI tool domain does not require heavy OOP; simplicity trumps abstraction.

### IV. CLI-First Interface
All functionality MUST be accessible via Commander-based CLI commands. CLI
design MUST follow:
- Hierarchical command structure (auth, spaces, lists, tasks)
- Consistent argument/option handling
- Clear error messages to stderr
- Dual output modes: JSON for scripting, human-friendly for interactive use
- **AI-oriented output**: Deterministic, structured formats preferred;
  avoid ANSI colors in JSON mode; stable output for LLM consumption

**Rationale**: CLI is the primary user interface; consistency ensures usability,
debuggability, and AI agent compatibility.

### V. Configuration & Security
Configuration MUST be stored in `~/.clickup-cli/config.json`. API tokens and
credentials MUST:
- Never be committed to repository
- Be stored with appropriate file permissions (0600)
- Use environment variable overrides where needed
- Support multiple credential profiles
- Be masked in all logs/output (never print raw tokens)
- Be cleared from memory after use

All user inputs (CLI args, config file, API responses) MUST be validated using
Zod schemas. Reject invalid inputs with clear error messages before processing.

**Rationale**: Security and user convenience; follows industry standard for
CLI tools and protects sensitive credentials.

### VI. Test Discipline & CI/CD
Testing MUST be comprehensive with clear separation:
- **Unit tests**: Individual functions and utilities (vitest)
- **Integration tests**: API client operations (vitest with fixtures)
- **CLI tests**: End-to-end command execution

All tests run automatically via GitHub Actions on every PR. PRs MUST:
- Maintain or improve test coverage
- Include tests for new functionality (docs/CI changes exempt)
- Pass all CI checks before review
- Include reviewer confirmation: "This change complies with the project
  constitution" or explicit override justification

**Rationale**: Ensures reliability of API interactions and CLI behavior;
prevents regressions in production tooling. Automated CI enforces quality
gates.

## Build & Distribution

### Bun & Single Binary
Build and runtime environment MUST use Bun. Distribution principle:
- Produce a single self-contained executable via `bun build --compile`
- Prefer static linking for maximum portability
- Binary size optimization without sacrificing functionality
- Hermetic builds: no runtime dependency on system packages

**Rationale**: Bun offers fast builds and excellent TypeScript support.
Single binary simplifies distribution and deployment for CLI tools.

### Release Process
- Automated releases via GitHub Actions (semantic-release or manual tag-based)
- Release notes generated from conventional commits
- Binaries attached to GitHub Releases with architecture-specific builds
- Update.homebrew Tap or package manager formulae when applicable

**Rationale**: Consistent, automated releases reduce manual errors and
improve user experience.

## Internationalization

### i18n Implementation
All user-facing messages MUST be externalized for translation:
- Message strings stored in locale files (e.g., `locales/en.json`, `locales/ja.json`)
- Use message keys, not hardcoded strings
- Default locale: English (en)
- Environment variable/configuration for locale selection (`CLICKUP_CLI_LOCALE`)
- Pluralization and interpolation supported via i18n library (e.g., `formatjs`)

**Rationale**: Global accessibility and AI agent integration; supports
non-English speaking users and international teams.

### Right-to-Left (RTL) Considerations
If supporting RTL languages, ensure CLI output alignment and formatting
handles bidirectional text correctly. Prefer logical over physical formatting.

**Rationale**: Ensures usability for RTL language speakers.

## Governance

This constitution supersedes all ad-hoc practices. Any deviation MUST be justified
and documented in the PR.

**Amendment Process**:
1. Propose amendment via PR updating this constitution file
2. Include rationale and migration steps if backward incompatible
3. Reviewer must verify Sync Impact Report completeness
4. Merge requires approval from project maintainer(s)
5. Update version using semantic versioning

**Versioning Policy**: CONSTITUTION_VERSION follows semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Backward incompatible changes (principle removals or redefinitions)
- MINOR: New principles added or materially expanded guidance
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Compliance Review**: All PRs MUST include reviewer confirmation: "This change
complies with the project constitution" or explicit override justification with
maintainer approval.

**Version**: 1.2.0 | **Ratified**: 2025-11-24 | **Last Amended**: 2026-03-16
