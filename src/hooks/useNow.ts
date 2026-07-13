import { useEffect, useState } from 'react';

/**
 * Returns a `Date.now()` value that refreshes on an interval so live
 * net-to-the-minute countdowns re-render without manual polling.
 */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
