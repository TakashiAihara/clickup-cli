# Contract: CI/CD Workflow

## CI Workflow (`.github/workflows/ci.yml`)

**Trigger**: `push` to main, `pull_request` to main

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run typecheck
      - run: bun run test
      - run: bun build apps/cli/src/index.ts --compile --outfile clickup
```

## Release Workflow (`.github/workflows/release.yml`)

**Trigger**: `push` tags `v*`

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        target: bun-linux-x64
        artifact: clickup-linux-x64
      - os: macos-latest
        target: bun-darwin-arm64
        artifact: clickup-darwin-arm64
      - os: macos-13
        target: bun-darwin-x64
        artifact: clickup-darwin-x64

jobs:
  build:
    runs-on: ${{ matrix.os }}
    steps:
      - checkout + setup-bun
      - bun install
      - bun build --compile --target ${{ matrix.target }} --outfile ${{ matrix.artifact }}
      - upload-artifact

  release:
    needs: build
    steps:
      - download all artifacts
      - gh release create ${{ github.ref_name }} --generate-notes ./artifacts/*
```

## Binary Naming Convention

`clickup-{os}-{arch}` (e.g., `clickup-linux-x64`, `clickup-darwin-arm64`)
