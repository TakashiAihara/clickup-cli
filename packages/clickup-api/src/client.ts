import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config as loadEnv } from 'dotenv';
import type { ClickUpConfig, Task, Space, List, CreateTaskPayload, UpdateTaskPayload, User } from './types';

// Load environment variables from .env file
loadEnv();

let globalAccessToken: string | undefined = process.env.CLICKUP_API_TOKEN;

export function setAccessToken(token: string): void {
  globalAccessToken = token;
}

export function getAccessToken(): string | undefined {
  return globalAccessToken || process.env.CLICKUP_API_TOKEN;
}

// Create a plain axios instance; token added via interceptor
const instance = axios.create({
  baseURL: 'https://api.clickup.com/api/v2',
  timeout: 30000,
});

// Request interceptor to inject Authorization header
instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = token;
  }
  return config;
});

/**
 * Mutator function required by orval.
 * Returns the configured axios instance (optionally merging request config).
 * Generic type parameter is ignored; returned instance is typed as AxiosInstance.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function customAxiosInstance<T>(config?: AxiosRequestConfig): AxiosInstance {
  // For now, return the global instance; config merging could be added if needed
  return instance;
}

/**
 * Legacy ClickUpClient class (can be removed later).
 * New code should use generated API functions.
 */
export class ClickUpClient {
  private client: AxiosInstance;

  constructor(config: ClickUpConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.clickup.com/api/v2',
      headers: {
        'Authorization': config.accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async getUser(): Promise<User> {
    const response = await this.client.get<{ user: User }>('/user');
    return response.data.user;
  }

  async getSpaces(teamId: string): Promise<Space[]> {
    const response = await this.client.get<{ spaces: Space[] }>(`/team/${teamId}/space`);
    return response.data.spaces;
  }

  async getLists(spaceId: string): Promise<List[]> {
    const response = await this.client.get<{ lists: List[] }>(`/space/${spaceId}/list`);
    return response.data.lists;
  }

  async getTasks(listId: string): Promise<Task[]> {
    const response = await this.client.get<{ tasks: Task[] }>(`/list/${listId}/task`);
    return response.data.tasks;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.client.get<Task>(`/task/${taskId}`);
    return response.data;
  }

  async createTask(listId: string, task: CreateTaskPayload): Promise<Task> {
    const response = await this.client.post<Task>(`/list/${listId}/task`, task);
    return response.data;
  }

  async updateTask(taskId: string, updates: UpdateTaskPayload): Promise<Task> {
    const response = await this.client.put<Task>(`/task/${taskId}`, updates);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/task/${taskId}`);
  }

  async searchTasks(query: string, options?: {
    spaceIds?: string[];
    projectIds?: string[];
    listIds?: string[];
    statuses?: string[];
    assignees?: number[];
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    params.append('query', query);

    if (options?.spaceIds) {
      options.spaceIds.forEach(id => params.append('space_ids[]', id));
    }
    if (options?.projectIds) {
      options.projectIds.forEach(id => params.append('project_ids[]', id));
    }
    if (options?.listIds) {
      options.listIds.forEach(id => params.append('list_ids[]', id));
    }
    if (options?.statuses) {
      options.statuses.forEach(status => params.append('statuses[]', status));
    }
    if (options?.assignees) {
      options.assignees.forEach(assignee => params.append('assignees[]', assignee.toString()));
    }

    const response = await this.client.get<{ tasks: Task[] }>(`/search/tasks?${params.toString()}`);
    return response.data.tasks;
  }
}