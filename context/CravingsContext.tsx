import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadEntries, saveEntries } from "@/lib/storage";
import { CravingEntry } from "@/lib/types";

type NewEntryInput = Omit<CravingEntry, "id" | "createdAt">;

type Totals = {
  count: number;
  moneySaved: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

type CravingsContextValue = {
  entries: CravingEntry[];
  isLoading: boolean;
  addEntry: (input: NewEntryInput) => Promise<CravingEntry>;
  removeEntry: (id: string) => Promise<void>;
  allTimeTotals: Totals;
  todayTotals: Totals;
};

const CravingsContext = createContext<CravingsContextValue | null>(null);

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function sumTotals(entries: CravingEntry[]): Totals {
  return entries.reduce(
    (acc, e) => ({
      count: acc.count + 1,
      moneySaved: acc.moneySaved + e.price,
      calories: acc.calories + e.calories,
      carbs: acc.carbs + e.carbs,
      protein: acc.protein + e.protein,
      fat: acc.fat + e.fat,
    }),
    { count: 0, moneySaved: 0, calories: 0, carbs: 0, protein: 0, fat: 0 }
  );
}

export function CravingsProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CravingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries().then((loaded) => {
      setEntries(loaded.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    });
  }, []);

  const addEntry = useCallback(async (input: NewEntryInput) => {
    const entry: CravingEntry = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    setEntries((prev) => {
      const next = [entry, ...prev];
      saveEntries(next);
      return next;
    });
    return entry;
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const allTimeTotals = useMemo(() => sumTotals(entries), [entries]);
  const todayTotals = useMemo(() => sumTotals(entries.filter((e) => isSameDay(e.createdAt, Date.now()))), [entries]);

  const value = useMemo(
    () => ({ entries, isLoading, addEntry, removeEntry, allTimeTotals, todayTotals }),
    [entries, isLoading, addEntry, removeEntry, allTimeTotals, todayTotals]
  );

  return <CravingsContext.Provider value={value}>{children}</CravingsContext.Provider>;
}

export function useCravings(): CravingsContextValue {
  const ctx = useContext(CravingsContext);
  if (!ctx) throw new Error("useCravings must be used within CravingsProvider");
  return ctx;
}
