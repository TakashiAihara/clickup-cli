# Quickstart: Single Binary Release

## ローカルビルド

```bash
# シングルバイナリ作成
bun build apps/cli/src/index.ts --compile --outfile clickup

# 動作確認
./clickup --help
```

## クロスコンパイル

```bash
# macOS ARM 向け（Linux から）
bun build apps/cli/src/index.ts --compile --target bun-darwin-arm64 --outfile clickup-darwin-arm64
```

## リリース

```bash
# タグを打つだけで GitHub Actions が自動リリース
git tag v0.1.0
git push origin v0.1.0
```

## ユーザーのインストール

```bash
# GitHub Release からダウンロード
curl -L https://github.com/TakashiAihara/clickup-cli/releases/latest/download/clickup-linux-x64 -o clickup
chmod +x clickup
./clickup --help
```
