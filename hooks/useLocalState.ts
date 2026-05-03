import { useState, useCallback } from 'react';

export function useLocalState<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const [isDirty, setIsDirty] = useState(false);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setState(next);
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setState(initial);
    setIsDirty(false);
  }, [initial]);

  return { state, setState: update, isDirty, reset };
}
