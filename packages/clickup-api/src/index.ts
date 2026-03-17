export { setAccessToken, getAccessToken, customAxiosInstance } from './client.js';
export type {
  ClickUpConfig,
  Task as ClickUpTask,
  TaskStatus,
  Priority as ClickUpPriority,
  User as ClickUpUser,
  Space as ClickUpSpace,
  List as ClickUpList,
  CreateTaskPayload,
  UpdateTaskPayload
} from './types.js';

// Export all generated API functions and types
export * from './generated/api.js';
