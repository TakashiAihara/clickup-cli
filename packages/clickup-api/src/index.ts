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

// Generated API functions (getAccessToken excluded to avoid collision with client.ts)
export * from './generated/reexport.js';

// OAuth endpoint available under explicit name
export { getAccessToken as getOAuthToken } from './generated/api.js';
