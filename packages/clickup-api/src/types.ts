export interface ClickUpConfig {
  accessToken: string;
  baseUrl?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  due_date?: number;
  assignees?: User[];
  list: {
    id: string;
  };
}

export interface TaskStatus {
  id: string;
  status: string;
  color: string;
}

export interface Priority {
  id: string;
  priority: string;
  color: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

export interface Space {
  id: string;
  name: string;
  color?: string;
  private: boolean;
  statuses: TaskStatus[];
}

export interface List {
  id: string;
  name: string;
  orderindex: number;
  status?: string;
  priority?: Priority;
  assignee?: User;
  task_count?: number;
  due_date?: number;
  start_date?: number;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
  };
  space: {
    id: string;
    name: string;
  };
}

export interface CreateTaskPayload {
  name: string;
  description?: string;
  priority?: number;
  assignees?: number[];
  status?: string;
  due_date?: number;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  priority?: number;
  assignees?: number[];
  status?: string;
  due_date?: number;
}