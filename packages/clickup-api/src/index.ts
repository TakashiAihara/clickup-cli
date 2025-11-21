export { ClickUpClient, setAccessToken, getAccessToken, customAxiosInstance } from './client.js';
export type {
  ClickUpConfig,
  Task,
  TaskStatus,
  Priority,
  User,
  Space,
  List,
  CreateTaskPayload,
  UpdateTaskPayload
} from './types.js';

// Export generated API clients
export * from './generated/authorization/authorization.js';
export * from './generated/tasks/tasks.js';
export * from './generated/lists/lists.js';
export * from './generated/spaces/spaces.js';
export * from './generated/workspaces/workspaces.js';
export * from './generated/comments/comments.js';
export * from './generated/attachments/attachments.js';
export * from './generated/folders/folders.js';
export * from './generated/goals/goals.js';
export * from './generated/members/members.js';
export * from './generated/time-tracking/time-tracking.js';
export * from './generated/webhooks/webhooks.js';
export * from './generated/views/views.js';

// Export generated types
export type * from './generated/models/index.js';