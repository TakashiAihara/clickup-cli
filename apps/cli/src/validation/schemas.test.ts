import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from './schemas.js';

describe('createTaskSchema', () => {
  it('should accept valid input', () => {
    const result = createTaskSchema.safeParse({
      name: 'Test task',
      description: 'A description',
      status: 'open',
      priority: 2,
    });
    expect(result.success).toBe(true);
  });

  it('should require name', () => {
    const result = createTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = createTaskSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject name over 500 chars', () => {
    const result = createTaskSchema.safeParse({ name: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('should accept name with exactly 500 chars', () => {
    const result = createTaskSchema.safeParse({ name: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });

  it('should reject invalid priority', () => {
    const result = createTaskSchema.safeParse({ name: 'test', priority: 5 });
    expect(result.success).toBe(false);
  });

  it('should accept priority 1-4', () => {
    for (const p of [1, 2, 3, 4]) {
      const result = createTaskSchema.safeParse({ name: 'test', priority: p });
      expect(result.success).toBe(true);
    }
  });

  it('should reject more than 10 tags', () => {
    const result = createTaskSchema.safeParse({
      name: 'test',
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('should accept partial updates', () => {
    const result = updateTaskSchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object (no fields to update)', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept null priority (clear)', () => {
    const result = updateTaskSchema.safeParse({ priority: null });
    expect(result.success).toBe(true);
  });

  it('should accept null due_date (clear)', () => {
    const result = updateTaskSchema.safeParse({ due_date: null });
    expect(result.success).toBe(true);
  });
});
