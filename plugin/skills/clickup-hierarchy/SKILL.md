# ClickUp Hierarchy

Manage ClickUp workspaces, spaces, folders, lists, and views via CLI.

## Spaces

```bash
clickup spaces list --team-id <TEAM_ID>
clickup spaces create --team-id <TEAM_ID> --name "Space name"
clickup spaces update <SPACE_ID> [--name "..."]
clickup spaces delete <SPACE_ID>
clickup spaces fields --space-id <ID>
clickup spaces tags --space-id <ID>
clickup spaces create-tag --space-id <ID> --name "tag"
clickup spaces edit-tag --space-id <ID> --name "old" --new-name "new"
clickup spaces delete-tag --space-id <ID> --name "tag"
clickup spaces create-folder-from-template --space-id <ID> --template-id <TID> --name "..."
clickup spaces create-list-from-template --space-id <ID> --template-id <TID> --name "..."
```

## Folders

```bash
clickup folders list --space-id <SPACE_ID>
clickup folders show <FOLDER_ID>
clickup folders create --space-id <SPACE_ID> --name "Folder name"
clickup folders update <FOLDER_ID> [--name "..."]
clickup folders delete <FOLDER_ID>
clickup folders fields --folder-id <ID>
clickup folders add-guest --folder-id <ID> --guest-id <GID>
clickup folders remove-guest --folder-id <ID> --guest-id <GID>
clickup folders create-list-from-template --folder-id <ID> --template-id <TID> --name "..."
```

## Lists

```bash
clickup lists list --folder-id <FOLDER_ID>
clickup lists folderless --space-id <SPACE_ID>
clickup lists create --folder-id <FOLDER_ID> --name "List name"
clickup lists create-folderless --space-id <SPACE_ID> --name "List name"
clickup lists update <LIST_ID> [--name "..."]
clickup lists delete <LIST_ID>
clickup lists fields --list-id <ID>
clickup lists members --list-id <ID>
clickup lists add-guest --list-id <ID> --guest-id <GID>
clickup lists remove-guest --list-id <ID> --guest-id <GID>
clickup lists add-task --list-id <ID> --task-id <TID>
clickup lists remove-task --list-id <ID> --task-id <TID>
clickup lists create-task-from-template --list-id <ID> --template-id <TID> --name "..."
```

## Views

```bash
clickup views list --space-id <ID>  # or --folder-id, --list-id, --team-id
clickup views show <VIEW_ID>
clickup views tasks <VIEW_ID> [--page 0]
clickup views create --name "..." --type list|board|calendar|gantt --space-id <ID>
clickup views update <VIEW_ID> [--name "..."]
clickup views delete <VIEW_ID>
clickup views comments --view-id <ID>
clickup views create-comment --view-id <ID> --body "message"
```

## Tips

- ClickUp hierarchy: Workspace → Space → Folder → List → Task
- All commands support `--output json` for scripting
- Template IDs must be obtained from the ClickUp UI
