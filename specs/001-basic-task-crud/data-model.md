# Data Models: Basic Task CRUD

**Feature**: 001-basic-task-crud
**Date**: 2026-03-16

This document defines core entities, validation rules, and state transitions derived from the OpenAPI spec and Constitution's Schema-Driven Development principle.

## Entity: Task

**Source**: ClickUp API v2 → `/task/{task_id}` endpoint

### Attributes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (uuid) | Yes (read-only) | Unique identifier |
| `name` | string | Yes (create) | ≤ 500 chars, min 1 |
| `description` | string | No | Rich text (ClickUp markup). Truncate UI only. |
| `status` | enum | No (create default: "open") | Values: `open`, `in progress`, `review`, `done`, `closed` |
| `assignee` | object or null | No | `{id, username, email}` |
| `due_date` | number (timestamp) | No | Unix timestamp in milliseconds |
| `list_id` | string | Yes (create) | Parent list ID |
| `tags` | array of strings | No | Max 10 tags, each ≤ 50 chars |
| `priority` | enum | No | Values: `urgent`, `high`, `normal`, `low` |
| `created_at` | number (timestamp) | Yes (read-only) | |
| `updated_at` | number (timestamp) | Yes (read-only) | |

### Validation Rules (Zod)

```typescript
const taskStatusEnum = z.enum(['open', 'in progress', 'review', 'done', 'closed']);
const taskPriorityEnum = z.enum(['urgent', 'high', 'normal', 'low']);

const taskSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  assignee: z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email().optional(),
  }).nullable().optional(),
  due_date: z.number().int().positive().optional(),
  list_id: z.string().uuid(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  priority: taskPriorityEnum.optional(),
  created_at: z.number().int().positive(),
  updated_at: z.number().int().positive(),
});

// Create input (subset, excludes read-only fields)
const createTaskInputSchema = taskSchema.omit({ id: true, created_at: true, updated_at: true });

// Update input (partial)
const updateTaskInputSchema = taskSchema.partial().omit({ id: true, list_id: true, created_at: true, updated_at: true });
```

---

## Entity: User

**Source**: ClickUp API `/user` endpoint, embedded in task.assignee

### Attributes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (uuid) | Yes | |
| `username` | string | Yes | |
| `email` | string | Yes (if available) | May be null if private |
| `profile_picture` | string (URL) | No | Optional avatar URL |

### Validation Rules

```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional().nullable(),
  profile_picture: z.string().url().optional().nullable(),
});
```

---

## Entity: List

**Source**: ClickUp API `/list/{list_id}` endpoint

### Attributes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (uuid) | Yes | |
| `name` | string | Yes | |
| `space_id` | string | Yes | Parent space |
| `folder_id` | string | Yes | Parent folder |

Validation:
```typescript
const listSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  space_id: z.string().uuid(),
  folder_id: z.string().uuid(),
});
```

---

## State Transitions

Tasks follow typical Kanban flow. ClickUp allows arbitrary status values; constitution defines standard set.

**Allowed Statuses** (per Constitution & ClickUp standard):
- `open` → `in progress` → `review` → `done` → `closed`
- Can skip forward or backward (ClickUp permits any → any)

**No server-side enforcement** - validation allows any enum value. Workflow logic remains user-side.

---

## Relationships

- **Task** belongs to **List** via `list_id`
- **Task** may have **User** assignee via `assignee.id`
- **List** belongs to **Space** and **Folder** (beyond scope for MVP)

---

## Rationale

- **OpenAPI Alignment**: Entities mirror generated API types; Zod schemas wrap them for runtime validation
- **Functions-First**: All validation functions are pure; no classes
- **Security**: Input validation precedes API calls; prevents injection/spec-drift
- **AI-Friendly**: Deterministic JSON output schema matches validation schema
