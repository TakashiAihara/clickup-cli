# ClickUp Tasks

Manage ClickUp tasks via CLI. Use when the user asks about tasks, to-dos, or work items in ClickUp.

## Commands

```bash
# List tasks in a list
clickup tasks list --list-id <LIST_ID> [--output json|table] [--status <status>] [--assignee <id>]

# Show task details
clickup tasks show <TASK_ID> [--output json|table]

# Create a task
clickup tasks create --list-id <LIST_ID> --name "Task name" [--description "..."] [--status "..."] [--priority 1-4] [--tags "tag1,tag2"]

# Update a task
clickup tasks update <TASK_ID> [--name "..."] [--status "..."] [--priority 1-4] [--description "..."]

# Delete a task
clickup tasks delete <TASK_ID> [--confirm]

# Dependencies
clickup tasks add-dependency --task-id <ID> --depends-on <OTHER_ID>
clickup tasks remove-dependency --task-id <ID> --depends-on <OTHER_ID>

# Links
clickup tasks add-link --task-id <ID> --links-to <OTHER_ID>
clickup tasks remove-link --task-id <ID> --links-to <OTHER_ID>

# Time tracking (per task)
clickup tasks time --task-id <ID>
clickup tasks track-time --task-id <ID> --duration <milliseconds>
clickup tasks edit-time --task-id <ID> --interval-id <IID> --duration <ms>
clickup tasks delete-time --task-id <ID> --interval-id <IID>

# Checklist
clickup tasks create-checklist --task-id <ID> --name "Checklist name"

# Members & Guests
clickup tasks members --task-id <ID>
clickup tasks add-guest --task-id <ID> --guest-id <GID>
clickup tasks remove-guest --task-id <ID> --guest-id <GID>

# Tags
clickup tasks add-tag --task-id <ID> --tag-name "tag"
clickup tasks remove-tag --task-id <ID> --tag-name "tag"

# Attachments
clickup tasks attach --task-id <ID> --file ./path/to/file

# Merge
clickup tasks merge --task-id <TARGET_ID> --merge-with <SOURCE_ID>

# Time in status
clickup tasks time-in-status --task-id <ID>
clickup tasks bulk-time-in-status --task-ids <ID1>,<ID2>
```

## Tips

- All commands support `--output json` for machine-readable output
- Priority: 1=urgent, 2=high, 3=normal, 4=low
- Duration for time tracking is in milliseconds (e.g., 3600000 = 1 hour)
