import { setAccessToken, getTasks, getTask, createTask, updateTask, deleteTask } from '@clickup/api';
import { describe, it, expect, afterAll } from 'vitest';

/**
 * Integration tests for Task CRUD using the real ClickUp API.
 * Requires CLICKUP_API_TOKEN and TEST_LIST_ID env vars.
 *
 * These tests create real tasks, verify operations, then clean up.
 */

const TEST_PREFIX = '[CLI-TEST]';
const token = process.env.CLICKUP_API_TOKEN;
const listId = process.env.TEST_LIST_ID;

const createdTaskIds: string[] = [];

function skipIfNoCredentials() {
  if (!token || !listId) {
    console.warn('Skipping: Set CLICKUP_API_TOKEN and TEST_LIST_ID to run integration tests');
    return true;
  }
  return false;
}

describe('Task CRUD Integration', () => {
  // Clean up all created tasks after all tests
  afterAll(async () => {
    if (!token) return;
    setAccessToken(token);
    for (const id of createdTaskIds) {
      try {
        await deleteTask(id, {});
      } catch {
        console.warn(`Cleanup: failed to delete task ${id}`);
      }
    }
  });

  it('should create a task', async () => {
    if (skipIfNoCredentials()) return;
    setAccessToken(token!);

    const result = await createTask(Number(listId), {
      name: `${TEST_PREFIX} Create Test`,
      description: 'Created by automated test',
    });

    const task = result as any;
    expect(task.id).toBeDefined();
    expect(task.name).toBe(`${TEST_PREFIX} Create Test`);
    createdTaskIds.push(task.id);
  });

  it('should list tasks and find the created one', async () => {
    if (skipIfNoCredentials() || createdTaskIds.length === 0) return;
    setAccessToken(token!);

    const result = await getTasks(Number(listId), {});
    const tasks = (result as any).tasks ?? result;

    expect(Array.isArray(tasks)).toBe(true);

    const found = tasks.find((t: any) => t.id === createdTaskIds[0]);
    expect(found).toBeDefined();
    expect(found.name).toBe(`${TEST_PREFIX} Create Test`);
  });

  it('should show task details', async () => {
    if (skipIfNoCredentials() || createdTaskIds.length === 0) return;
    setAccessToken(token!);

    const result = await getTask(createdTaskIds[0]!, {});
    const task = result as any;

    expect(task.id).toBe(createdTaskIds[0]);
    expect(task.name).toBe(`${TEST_PREFIX} Create Test`);
    expect(task.description).toBe('Created by automated test');
  });

  it('should update a task', async () => {
    if (skipIfNoCredentials() || createdTaskIds.length === 0) return;
    setAccessToken(token!);

    const result = await updateTask(
      createdTaskIds[0]!,
      {
        name: `${TEST_PREFIX} Updated Test`,
      },
      {},
    );
    const task = result as any;

    expect(task.name).toBe(`${TEST_PREFIX} Updated Test`);
  });

  it('should verify the update persisted', async () => {
    if (skipIfNoCredentials() || createdTaskIds.length === 0) return;
    setAccessToken(token!);

    const result = await getTask(createdTaskIds[0]!, {});
    const task = result as any;

    expect(task.name).toBe(`${TEST_PREFIX} Updated Test`);
  });

  it('should delete a task', async () => {
    if (skipIfNoCredentials() || createdTaskIds.length === 0) return;
    setAccessToken(token!);

    // Create a separate task to delete explicitly in this test
    const created = await createTask(Number(listId), {
      name: `${TEST_PREFIX} Delete Test`,
    });
    const taskId = (created as any).id;

    await deleteTask(taskId, {});

    // Verify it's gone
    try {
      await getTask(taskId, {});
      expect.fail('Expected 404 for deleted task');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });

  it('should handle not-found task gracefully', async () => {
    if (skipIfNoCredentials()) return;
    setAccessToken(token!);

    try {
      await getTask('nonexistent_task_id_999', {});
      expect.fail('Expected error for non-existent task');
    } catch (error: any) {
      expect(error.response?.status).toBeGreaterThanOrEqual(400);
    }
  });
});
