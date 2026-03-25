# Quickstart: Hierarchy Commands Expansion

## カスタムフィールド確認

```bash
clickup spaces fields --space-id 12345
clickup folders fields --folder-id 67890
clickup lists fields --list-id 11111
```

## スペースタグ管理

```bash
clickup spaces tags --space-id 12345
clickup spaces create-tag --space-id 12345 --name "bug"
clickup spaces edit-tag --space-id 12345 --name "bug" --new-name "defect"
clickup spaces delete-tag --space-id 12345 --name "defect"
```

## メンバー確認

```bash
clickup lists members --list-id 11111
```

## タスクのリスト移動

```bash
clickup lists add-task --list-id 11111 --task-id abc123
clickup lists remove-task --list-id 11111 --task-id abc123
```

## ゲスト管理

```bash
clickup folders add-guest --folder-id 67890 --guest-id 999
clickup folders remove-guest --folder-id 67890 --guest-id 999
clickup lists add-guest --list-id 11111 --guest-id 999
clickup lists remove-guest --list-id 11111 --guest-id 999
```

## テンプレートから作成

```bash
clickup spaces create-folder-from-template --space-id 12345 --template-id tmpl_001
clickup spaces create-list-from-template --space-id 12345 --template-id tmpl_002
clickup folders create-list-from-template --folder-id 67890 --template-id tmpl_002
clickup lists create-task-from-template --list-id 11111 --template-id tmpl_003
```

## ビューコメント

```bash
clickup views comments --view-id v001
clickup views create-comment --view-id v001 --body "Hello from CLI"
```

## JSON 出力

```bash
clickup spaces fields --space-id 12345 --output json
```
