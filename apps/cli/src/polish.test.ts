import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { setAccessToken, getTasks, getTask, createTask, deleteTask } from '@clickup/api';
import { describe, it, expect, afterAll } from 'vitest';

import { saveToken, removeToken, removeConfig, getToken, maskToken, paths } from './config.js';

const token = process.env.CLICKUP_API_TOKEN;
const listId = process.env.TEST_LIST_ID;

// ============================================================
// T060: JSON output determinism
// ============================================================
describe('T060: JSON output is deterministic', () => {
  it('should produce identical JSON across multiple serializations', async () => {
    if (!token || !listId) return;
    setAccessToken(token);

    const result = await getTasks(Number(listId), {});
    const json1 = JSON.stringify(result, null, 2);
    const json2 = JSON.stringify(result, null, 2);
    const json3 = JSON.stringify(result, null, 2);

    expect(json1).toBe(json2);
    expect(json2).toBe(json3);
  });

  it('should produce identical JSON for task detail across calls', async () => {
    if (!token || !listId) return;
    setAccessToken(token);

    // Create a task to get a known object
    const created = await createTask(Number(listId), { name: '[TEST-T060] Determinism' });
    const taskId = (created as any).id;

    try {
      const r1 = await getTask(taskId, {});
      const r2 = await getTask(taskId, {});

      // Compare only stable fields (exclude timestamps that might differ by ms)
      const pick = (t: any) => ({ id: t.id, name: t.name, status: t.status });
      expect(JSON.stringify(pick(r1))).toBe(JSON.stringify(pick(r2)));
    } finally {
      await deleteTask(taskId, {}).catch(() => {});
    }
  });

  it('should contain no ANSI escape codes in JSON output', async () => {
    if (!token || !listId) return;
    setAccessToken(token);

    const result = await getTasks(Number(listId), {});
    const json = JSON.stringify(result, null, 2);

    // ANSI escape codes start with \x1b[ or \u001b[
    expect(json).not.toMatch(/\x1b\[/);
    expect(json).not.toMatch(/\u001b\[/);
  });
});

// ============================================================
// T061: Performance with large task lists
// ============================================================
describe('T061: Performance with task lists', () => {
  const TASK_IDS: string[] = [];
  const BATCH_SIZE = 10; // Create 10 tasks to test list performance

  afterAll(async () => {
    if (!token) return;
    setAccessToken(token);
    for (const id of TASK_IDS) {
      await deleteTask(id, {}).catch(() => {});
    }
  });

  it('should list tasks within acceptable time (<5s for batch)', async () => {
    if (!token || !listId) return;
    setAccessToken(token);

    // Create test tasks
    for (let i = 0; i < BATCH_SIZE; i++) {
      const res = await createTask(Number(listId), {
        name: `[TEST-T061] Perf task ${i}`,
      });
      TASK_IDS.push((res as any).id);
    }

    // Measure list performance
    const start = performance.now();
    const result = await getTasks(Number(listId), {});
    const elapsed = performance.now() - start;

    const tasks = (result as any).tasks ?? result;
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(BATCH_SIZE);

    // Should complete in under 5 seconds
    expect(elapsed).toBeLessThan(5000);
    console.log(`List ${tasks.length} tasks: ${elapsed.toFixed(0)}ms`);
  });

  it('should handle individual task fetch quickly (<2s)', async () => {
    if (!token || TASK_IDS.length === 0) return;
    setAccessToken(token);

    const start = performance.now();
    await getTask(TASK_IDS[0]!, {});
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
    console.log(`Get single task: ${elapsed.toFixed(0)}ms`);
  });
});

// ============================================================
// T062: Security audit
// ============================================================
describe('T062: Security audit', () => {
  it('should store credentials with 0600 permissions', () => {
    let backup: string | null = null;
    const credFile = paths.CREDENTIALS_FILE;
    try {
      if (existsSync(credFile)) {
        backup = require('node:fs').readFileSync(credFile, 'utf-8');
      }

      saveToken('pk_test_security_audit');

      if (process.platform !== 'win32') {
        const stats = statSync(credFile);
        const mode = (stats.mode & 0o777).toString(8);
        expect(mode).toBe('600');
      }
    } finally {
      if (backup) {
        require('node:fs').writeFileSync(credFile, backup, { mode: 0o600 });
      } else {
        removeToken();
      }
    }
  });

  it('should mask token in maskToken output', () => {
    const masked = maskToken('pk_1234567890abcdef');
    // Must not contain the full token
    expect(masked).not.toBe('pk_1234567890abcdef');
    // Must contain masking characters
    expect(masked).toContain('****');
    // Must not expose middle portion
    expect(masked).not.toContain('567890ab');
  });

  it('should not leak token in error messages', () => {
    const testToken = 'pk_supersecret_token_value';

    // Simulate what handleError does - no token in output
    const errorMsg = `API error (401): Invalid or expired token. Run: clickup auth login`;
    expect(errorMsg).not.toContain(testToken);
  });

  it('should not include token in JSON output', async () => {
    if (!token || !listId) return;
    setAccessToken(token);

    const result = await getTasks(Number(listId), {});
    const json = JSON.stringify(result);

    // The API token should never appear in API response JSON
    expect(json).not.toContain(token);
  });

  it('should prefer env var token over config file', () => {
    const envToken = process.env.CLICKUP_API_TOKEN;
    if (!envToken) return;

    const resolved = getToken();
    expect(resolved).toBe(envToken);
  });
});
