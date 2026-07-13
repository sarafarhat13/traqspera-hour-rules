import { useCallback, useMemo, useState } from 'react';
import type { ClockEvent, Craft, ReasonCode } from '../types';
import {
  evaluateMealCompliance,
  evaluateReClockIn,
  totalNetWorkedMinutes,
} from '../lib/timeRules';

export interface ClockState {
  isClockedIn: boolean;
  craft: Craft;
  events: ClockEvent[];
}

/**
 * Field-employee clock state machine. Enforces the "Modal Freeze": clocking in
 * again within the unrounded 30-minute window returns `requiresReason` so the
 * caller can block the punch until a reason code is supplied.
 */
export function useClock(initialCraft: Craft) {
  const [state, setState] = useState<ClockState>({
    isClockedIn: false,
    craft: initialCraft,
    events: [],
  });

  /**
   * Attempts to clock in. If inside the freeze window and no reason code is
   * supplied, the punch is rejected and `requiresReason` is returned true.
   */
  const clockIn = useCallback(
    (reasonCode?: ReasonCode): { accepted: boolean; requiresReason: boolean; minutesSinceOut: number | null } => {
      const nowMs = Date.now();
      const { requiresReason, minutesSinceOut } = evaluateReClockIn(state.events, nowMs);

      if (requiresReason && !reasonCode) {
        return { accepted: false, requiresReason: true, minutesSinceOut };
      }

      setState((prev) => ({
        ...prev,
        isClockedIn: true,
        events: [
          ...prev.events,
          { type: 'in', timestamp: nowMs, craft: prev.craft, reasonCode },
        ],
      }));
      return { accepted: true, requiresReason, minutesSinceOut };
    },
    [state.events]
  );

  const clockOut = useCallback(() => {
    setState((prev) => {
      if (!prev.isClockedIn) return prev;
      return {
        ...prev,
        isClockedIn: false,
        events: [
          ...prev.events,
          { type: 'out', timestamp: Date.now(), craft: prev.craft },
        ],
      };
    });
  }, []);

  /** Switches craft mid-shift; if clocked in, records the change as a punch pair. */
  const switchCraft = useCallback((craft: Craft) => {
    setState((prev) => {
      if (!prev.isClockedIn) return { ...prev, craft };
      const nowMs = Date.now();
      return {
        ...prev,
        craft,
        events: [
          ...prev.events,
          { type: 'out', timestamp: nowMs, craft: prev.craft },
          { type: 'in', timestamp: nowMs, craft },
        ],
      };
    });
  }, []);

  const netMinutes = useMemo(
    () => totalNetWorkedMinutes(state.events, Date.now()),
    [state.events]
  );

  const meal = useMemo(() => {
    const firstIn = state.events.find((e) => e.type === 'in');
    if (!firstIn) return null;
    const mealEvent = state.events.find((e) => e.type === 'in' && e.reasonCode);
    return evaluateMealCompliance(
      firstIn.timestamp,
      Date.now(),
      mealEvent ? mealEvent.timestamp : null
    );
  }, [state.events]);

  return { state, clockIn, clockOut, switchCraft, netMinutes, meal };
}
