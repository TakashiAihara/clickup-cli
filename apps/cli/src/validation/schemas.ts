import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(500),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.number().int().min(1).max(4).optional(),
  assignees: z.array(z.number()).optional(),
  due_date: z.number().int().positive().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.number().int().min(1).max(4).nullable().optional(),
  assignees: z.array(z.number()).optional(),
  due_date: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});
