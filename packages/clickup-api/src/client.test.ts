import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ClickUpClient } from './client.js';
import type { ClickUpConfig } from './types.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('ClickUpClient', () => {
  let client: ClickUpClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const config: ClickUpConfig = {
      accessToken: 'test-token',
      baseUrl: 'https://api.clickup.com/api/v2',
    };
    client = new ClickUpClient(config);
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.clickup.com/api/v2',
        headers: {
          'Authorization': 'test-token',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use default baseURL if not provided', () => {
      const config: ClickUpConfig = { accessToken: 'test-token' };
      new ClickUpClient(config);
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.clickup.com/api/v2',
        headers: {
          'Authorization': 'test-token',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('getUser', () => {
    it('should fetch user data', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      mockAxiosInstance.get.mockResolvedValue({ data: { user: mockUser } });

      const result = await client.getUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getSpaces', () => {
    it('should fetch spaces for a team', async () => {
      const mockSpaces = [{ id: '1', name: 'Test Space' }];
      mockAxiosInstance.get.mockResolvedValue({ data: { spaces: mockSpaces } });

      const result = await client.getSpaces('team-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/team/team-123/space');
      expect(result).toEqual(mockSpaces);
    });
  });

  describe('getLists', () => {
    it('should fetch lists for a space', async () => {
      const mockLists = [{ id: '1', name: 'Test List' }];
      mockAxiosInstance.get.mockResolvedValue({ data: { lists: mockLists } });

      const result = await client.getLists('space-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/space/space-123/list');
      expect(result).toEqual(mockLists);
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks for a list', async () => {
      const mockTasks = [{ id: '1', name: 'Test Task' }];
      mockAxiosInstance.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await client.getTasks('list-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/list/list-123/task');
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getTask', () => {
    it('should fetch a single task', async () => {
      const mockTask = { id: '1', name: 'Test Task' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTask });

      const result = await client.getTask('task-123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/task/task-123');
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const mockTask = { id: '1', name: 'New Task' };
      const taskPayload = { name: 'New Task', description: 'Test description' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockTask });

      const result = await client.createTask('list-123', taskPayload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/list/list-123/task', taskPayload);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const mockTask = { id: '1', name: 'Updated Task' };
      const updates = { name: 'Updated Task' };
      mockAxiosInstance.put.mockResolvedValue({ data: mockTask });

      const result = await client.updateTask('task-123', updates);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/task/task-123', updates);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await client.deleteTask('task-123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/task/task-123');
    });
  });

  describe('searchTasks', () => {
    it('should search tasks with query only', async () => {
      const mockTasks = [{ id: '1', name: 'Found Task' }];
      mockAxiosInstance.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const result = await client.searchTasks('test query');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/tasks?query=test+query');
      expect(result).toEqual(mockTasks);
    });

    it('should search tasks with options', async () => {
      const mockTasks = [{ id: '1', name: 'Found Task' }];
      mockAxiosInstance.get.mockResolvedValue({ data: { tasks: mockTasks } });

      const options = {
        spaceIds: ['space1', 'space2'],
        statuses: ['open', 'in progress'],
        assignees: [123, 456],
      };

      const result = await client.searchTasks('test query', options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/search/tasks?query=test+query&space_ids%5B%5D=space1&space_ids%5B%5D=space2&statuses%5B%5D=open&statuses%5B%5D=in+progress&assignees%5B%5D=123&assignees%5B%5D=456'
      );
      expect(result).toEqual(mockTasks);
    });
  });
});