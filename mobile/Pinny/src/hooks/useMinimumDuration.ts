import { useEffect, useState } from 'react';

// Mantém algo ligado (ex.: um skeleton loading) por pelo menos minimumMs desde a montagem, mesmo
// que isActive desligue antes. Se isActive demorar mais, segue ligado até ele desligar.
export function useMinimumDuration(isActive: boolean, minimumMs: number): boolean {
  const [hasElapsed, setHasElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasElapsed(true), minimumMs);
    return () => clearTimeout(timer);
  }, [minimumMs]);

  return isActive || !hasElapsed;
}
