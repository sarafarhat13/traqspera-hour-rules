import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LABOR_RULES, LABOR_RULES_STORAGE_KEY } from '../data/defaultLaborRules';
import type { LaborRulesState, MealPeriodPolicy, RestBreakPolicy } from '../types/laborRules';

function mergeRules(parsed: Partial<LaborRulesState>): LaborRulesState {
  return {
    ...DEFAULT_LABOR_RULES,
    ...parsed,
    restBreak: { ...DEFAULT_LABOR_RULES.restBreak, ...parsed.restBreak },
    kioskRestBreak: { ...DEFAULT_LABOR_RULES.kioskRestBreak, ...parsed.kioskRestBreak },
    mealPeriod: { ...DEFAULT_LABOR_RULES.mealPeriod, ...parsed.mealPeriod },
    dailyRules: { ...DEFAULT_LABOR_RULES.dailyRules, ...parsed.dailyRules },
    weeklyRules: { ...DEFAULT_LABOR_RULES.weeklyRules, ...parsed.weeklyRules },
  };
}

function loadRules(): LaborRulesState {
  try {
    const raw = localStorage.getItem(LABOR_RULES_STORAGE_KEY);
    if (!raw) return DEFAULT_LABOR_RULES;
    return mergeRules(JSON.parse(raw) as Partial<LaborRulesState>);
  } catch {
    return DEFAULT_LABOR_RULES;
  }
}

export function useLaborRules() {
  const [rules, setRules] = useState<LaborRulesState>(loadRules);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(LABOR_RULES_STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  const updateRules = useCallback((patch: Partial<LaborRulesState>) => {
    setRules((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  const updateRest = useCallback((patch: Partial<RestBreakPolicy>) => {
    setRules((prev) => ({ ...prev, restBreak: { ...prev.restBreak, ...patch } }));
    setSaved(false);
  }, []);

  const updateKioskRest = useCallback((patch: Partial<RestBreakPolicy>) => {
    setRules((prev) => ({ ...prev, kioskRestBreak: { ...prev.kioskRestBreak, ...patch } }));
    setSaved(false);
  }, []);

  const updateMeal = useCallback((patch: Partial<MealPeriodPolicy>) => {
    setRules((prev) => ({ ...prev, mealPeriod: { ...prev.mealPeriod, ...patch } }));
    setSaved(false);
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(LABOR_RULES_STORAGE_KEY, JSON.stringify(rules));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }, [rules]);

  return { rules, updateRules, updateRest, updateKioskRest, updateMeal, save, saved };
}
