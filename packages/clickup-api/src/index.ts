export { ClickUpClient, setAccessToken, getAccessToken, customAxiosInstance } from './client';
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
} from './types';

// Export generated API client and all types (single file)
export * from './generated/api';
