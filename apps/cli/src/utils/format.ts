import chalk from 'chalk';

export type OutputFormat = 'table' | 'json';

export function formatOutput(data: unknown, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  // For table, caller should handle specific formatting
  return String(data);
}

export function printTaskTable(tasks: any[]): void {
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  const header = `${'ID'.padEnd(12)} ${'Name'.padEnd(30)} ${'Status'.padEnd(15)} ${'Assignee'.padEnd(15)} ${'Due Date'.padEnd(12)}`;
  console.log(chalk.bold(header));
  console.log('-'.repeat(header.length));

  for (const task of tasks) {
    const id = (task.id ?? '').toString().padEnd(12);
    const name = (task.name ?? '').toString().slice(0, 28).padEnd(30);
    const status = (task.status?.status ?? '-').toString().padEnd(15);
    const assignee = (task.assignees?.[0]?.username ?? '-').toString().padEnd(15);
    const dueDate = task.due_date ? new Date(Number(task.due_date)).toISOString().slice(0, 10) : '-';
    console.log(`${id} ${name} ${status} ${assignee} ${dueDate.padEnd(12)}`);
  }
}

export function printTaskDetail(task: any): void {
  console.log(chalk.bold(`Task: ${task.name}`));
  console.log(`  ID:          ${task.id}`);
  console.log(`  Status:      ${task.status?.status ?? '-'}`);
  console.log(`  Priority:    ${task.priority?.priority ?? '-'}`);
  console.log(`  Assignees:   ${task.assignees?.map((a: any) => a.username).join(', ') || '-'}`);
  console.log(`  Due Date:    ${task.due_date ? new Date(Number(task.due_date)).toISOString().slice(0, 10) : '-'}`);
  console.log(`  List:        ${task.list?.name ?? task.list?.id ?? '-'}`);
  if (task.description) {
    console.log(`  Description: ${task.description.slice(0, 200)}`);
  }
  if (task.tags?.length) {
    console.log(`  Tags:        ${task.tags.map((t: any) => t.name ?? t).join(', ')}`);
  }
}
