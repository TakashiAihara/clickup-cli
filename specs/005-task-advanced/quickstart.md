# Quickstart: Advanced Task Commands

## 依存関係管理

```bash
clickup tasks add-dependency --task-id abc123 --depends-on def456
clickup tasks remove-dependency --task-id abc123 --depends-on def456
```

## タスクリンク

```bash
clickup tasks add-link --task-id abc123 --links-to def456
clickup tasks remove-link --task-id abc123 --links-to def456
```

## タスク単位の時間トラッキング

```bash
clickup tasks time --task-id abc123
clickup tasks track-time --task-id abc123 --duration 3600000
clickup tasks edit-time --task-id abc123 --interval-id 12345 --duration 7200000
clickup tasks delete-time --task-id abc123 --interval-id 12345
```

## チェックリスト

```bash
clickup tasks create-checklist --task-id abc123 --name "Review Steps"
```

## コメントスレッド返信

```bash
clickup comments replies --comment-id 99999
clickup comments reply --comment-id 99999 --body "了解しました"
```

## メンバー・ゲスト

```bash
clickup tasks members --task-id abc123
clickup tasks add-guest --task-id abc123 --guest-id 888
clickup tasks remove-guest --task-id abc123 --guest-id 888
```

## タグ操作

```bash
clickup tasks add-tag --task-id abc123 --tag-name "urgent"
clickup tasks remove-tag --task-id abc123 --tag-name "urgent"
```

## 添付ファイル

```bash
clickup tasks attach --task-id abc123 --file ./report.pdf
```

## タスクマージ

```bash
clickup tasks merge --task-id abc123 --merge-with def456
```

## ステータス滞在時間

```bash
clickup tasks time-in-status --task-id abc123
clickup tasks bulk-time-in-status --task-ids abc123,def456,ghi789
```

## JSON 出力

```bash
clickup tasks time --task-id abc123 --output json
```
