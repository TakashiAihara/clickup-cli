# Contract: CLI Commands (004-hierarchy-commands)

## Spaces コマンド追加

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `spaces fields` | `--space-id <id>` `--output <format>` | `GET /v2/space/{id}/field` |
| `spaces tags` | `--space-id <id>` `--output <format>` | `GET /v2/space/{id}/tag` |
| `spaces create-tag` | `--space-id <id>` `--name <name>` `--output <format>` | `POST /v2/space/{id}/tag` |
| `spaces edit-tag` | `--space-id <id>` `--name <name>` `--new-name <name>` `--output <format>` | `PUT /v2/space/{id}/tag/{name}` |
| `spaces delete-tag` | `--space-id <id>` `--name <name>` | `DELETE /v2/space/{id}/tag/{name}` |
| `spaces create-folder-from-template` | `--space-id <id>` `--template-id <tid>` `--output <format>` | `POST /v2/space/{id}/folder_template/{tid}` |
| `spaces create-list-from-template` | `--space-id <id>` `--template-id <tid>` `--output <format>` | `POST /v2/space/{id}/list_template/{tid}` |

## Folders コマンド追加

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `folders fields` | `--folder-id <id>` `--output <format>` | `GET /v2/folder/{id}/field` |
| `folders add-guest` | `--folder-id <id>` `--guest-id <gid>` `--output <format>` | `POST /v2/folder/{id}/guest/{gid}` |
| `folders remove-guest` | `--folder-id <id>` `--guest-id <gid>` | `DELETE /v2/folder/{id}/guest/{gid}` |
| `folders create-list-from-template` | `--folder-id <id>` `--template-id <tid>` `--output <format>` | `POST /v2/folder/{id}/list_template/{tid}` |

## Lists コマンド追加

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `lists fields` | `--list-id <id>` `--output <format>` | `GET /v2/list/{id}/field` |
| `lists members` | `--list-id <id>` `--output <format>` | `GET /v2/list/{id}/member` |
| `lists add-guest` | `--list-id <id>` `--guest-id <gid>` `--output <format>` | `POST /v2/list/{id}/guest/{gid}` |
| `lists remove-guest` | `--list-id <id>` `--guest-id <gid>` | `DELETE /v2/list/{id}/guest/{gid}` |
| `lists add-task` | `--list-id <id>` `--task-id <tid>` `--output <format>` | `POST /v2/list/{id}/task/{tid}` |
| `lists remove-task` | `--list-id <id>` `--task-id <tid>` | `DELETE /v2/list/{id}/task/{tid}` |
| `lists create-task-from-template` | `--list-id <id>` `--template-id <tid>` `--output <format>` | `POST /v2/list/{id}/taskTemplate/{tid}` |

## Views コマンド追加

| Subcommand | Options | API Endpoint |
|-----------|---------|-------------|
| `views comments` | `--view-id <id>` `--output <format>` | `GET /v2/view/{id}/comment` |
| `views create-comment` | `--view-id <id>` `--body <text>` `--output <format>` | `POST /v2/view/{id}/comment` |
