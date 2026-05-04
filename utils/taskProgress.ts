export interface TaskProgressInput {
  target_sets: number;
  completed_sets_today: number;
}

export function getTaskTargetSets(task: TaskProgressInput): number {
  return Math.max(1, task.target_sets);
}

export function getTaskCompletedSets(task: TaskProgressInput): number {
  return Math.min(Math.max(0, task.completed_sets_today), getTaskTargetSets(task));
}

export function isTaskFullyCompleted(task: TaskProgressInput): boolean {
  return getTaskCompletedSets(task) >= getTaskTargetSets(task);
}

export function getTaskProgress(task: TaskProgressInput): number {
  return getTaskCompletedSets(task) / getTaskTargetSets(task);
}

export function getDailyTaskProgress(tasks: TaskProgressInput[]): number {
  if (tasks.length === 0) {
    return 0;
  }

  const totalProgress = tasks.reduce((sum, task) => sum + getTaskProgress(task), 0);
  return totalProgress / tasks.length;
}

export function getCompletedTaskCount(tasks: TaskProgressInput[]): number {
  return tasks.filter(isTaskFullyCompleted).length;
}
