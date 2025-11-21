import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { config as loadEnv } from 'dotenv';
import type { ClickUpConfig, Task, Space, List, CreateTaskPayload, UpdateTaskPayload, User } from './types.js';

// Load environment variables from .env file
loadEnv();

let globalAccessToken: string | undefined = process.env.CLICKUP_API_TOKEN;

export function setAccessToken(token: string): void {
  globalAccessToken = token;
}

export function getAccessToken(): string | undefined {
  return globalAccessToken || process.env.CLICKUP_API_TOKEN;
}

export const customAxiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const token = getAccessToken();

  const promise = axios({
    ...config,
    baseURL: config.baseURL || 'https://api.clickup.com/api',
    headers: {
      ...config.headers,
      ...(token ? { 'Authorization': token } : {}),
    },
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

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
    const response: AxiosResponse<{ user: User }> = await this.client.get('/user');
    return response.data.user;
  }

  async getSpaces(teamId: string): Promise<Space[]> {
    const response: AxiosResponse<{ spaces: Space[] }> = await this.client.get(`/team/${teamId}/space`);
    return response.data.spaces;
  }

  async getLists(spaceId: string): Promise<List[]> {
    const response: AxiosResponse<{ lists: List[] }> = await this.client.get(`/space/${spaceId}/list`);
    return response.data.lists;
  }

  async getTasks(listId: string): Promise<Task[]> {
    const response: AxiosResponse<{ tasks: Task[] }> = await this.client.get(`/list/${listId}/task`);
    return response.data.tasks;
  }

  async getTask(taskId: string): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.get(`/task/${taskId}`);
    return response.data;
  }

  async createTask(listId: string, task: CreateTaskPayload): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.post(`/list/${listId}/task`, task);
    return response.data;
  }

  async updateTask(taskId: string, updates: UpdateTaskPayload): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.put(`/task/${taskId}`, updates);
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

    const response: AxiosResponse<{ tasks: Task[] }> = await this.client.get(`/search/tasks?${params.toString()}`);
    return response.data.tasks;
  }
}