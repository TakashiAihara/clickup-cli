# ClickUp Comments, Time Tracking, Tags, Goals, Webhooks & Custom Fields

Additional ClickUp CLI commands for collaboration and tracking.

## Comments

```bash
clickup comments list-task --task-id <ID>
clickup comments list-list --list-id <ID>
clickup comments create-task --task-id <ID> --text "comment"
clickup comments create-list --list-id <ID> --text "comment"
clickup comments update <COMMENT_ID> --text "updated"
clickup comments delete <COMMENT_ID>
clickup comments replies --comment-id <ID>
clickup comments reply --comment-id <ID> --body "reply text"
```

## Time Tracking (workspace-level)

```bash
clickup time list --team-id <ID> [--start-date <epoch_ms>] [--end-date <epoch_ms>]
clickup time show <TIMER_ID> --team-id <ID>
clickup time create --team-id <ID> --duration <ms> --task-id <ID>
clickup time update <TIMER_ID> --team-id <ID> [--duration <ms>]
clickup time delete <TIMER_ID> --team-id <ID>
clickup time start --team-id <ID> --task-id <ID>
clickup time stop --team-id <ID>
clickup time running --team-id <ID>
```

## Tags

```bash
clickup tags list --space-id <ID>
clickup tags create --space-id <ID> --name "tag"
clickup tags update <TAG_NAME> --space-id <ID> --new-name "new"
clickup tags delete <TAG_NAME> --space-id <ID>
clickup tags add --task-id <ID> --tag-name "tag"
clickup tags remove --task-id <ID> --tag-name "tag"
```

## Goals

```bash
clickup goals list --team-id <ID>
clickup goals show <GOAL_ID>
clickup goals create --team-id <ID> --name "Goal"
clickup goals update <GOAL_ID> [--name "..."]
clickup goals delete <GOAL_ID>
```

## Webhooks

```bash
clickup webhooks list --team-id <ID>
clickup webhooks create --team-id <ID> --endpoint "https://..." --events "taskCreated,taskUpdated"
clickup webhooks update <WEBHOOK_ID> [--endpoint "..."] [--events "..."]
clickup webhooks delete <WEBHOOK_ID>
```

## Custom Fields

```bash
clickup custom-fields list --list-id <ID>
clickup custom-fields set --task-id <ID> --field-id <FID> --value "..."
clickup custom-fields remove --task-id <ID> --field-id <FID>
```

## Auth

```bash
clickup auth login [--token <TOKEN>]
clickup auth status
clickup auth logout [--confirm]
```

## Tips

- All commands support `--output json` for machine-readable output
- Use `clickup auth login` first to set up authentication
