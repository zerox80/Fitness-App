-- Add target_sets to tasks
ALTER TABLE tasks ADD COLUMN target_sets INTEGER NOT NULL DEFAULT 1;

-- Add completed_sets to task_completions
ALTER TABLE task_completions ADD COLUMN completed_sets INTEGER NOT NULL DEFAULT 1;
