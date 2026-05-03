UPDATE tasks
SET target_sets = 1
WHERE target_sets < 1 OR target_sets > 50;

UPDATE task_completions
SET completed_sets = 1
WHERE completed_sets < 1 OR completed_sets > 50;

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_target_sets_range;

ALTER TABLE tasks
ADD CONSTRAINT tasks_target_sets_range
CHECK (target_sets BETWEEN 1 AND 50);

ALTER TABLE task_completions
DROP CONSTRAINT IF EXISTS task_completions_completed_sets_range;

ALTER TABLE task_completions
ADD CONSTRAINT task_completions_completed_sets_range
CHECK (completed_sets BETWEEN 1 AND 50);
