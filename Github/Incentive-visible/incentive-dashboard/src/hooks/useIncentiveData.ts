import { useState, useEffect, useMemo, useCallback } from "react";
import type { IncentiveEntry, Goals, Stats, ViewMode, MonthlyData } from "../types";
import { INITIAL_DATA, DEFAULT_GOALS } from "../constants/initialData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const STORAGE_KEYS = {
  DATA: "incentive-data",
  GOALS: "incentive-goals",
  CURRENT_USER: "current-user",
};

// Database row type (snake_case from Supabase)
interface DbIncentiveEntry {
  id: number;
  name: string;
  sales: string;
  affiliation: string;
  client: string;
  billing: number;
  cost: number;
  incentive_target: number;
  month: string;
}

// DbGoals type matches Supabase goals table structure

// Convert DB row to app type
function dbToEntry(row: DbIncentiveEntry): IncentiveEntry {
  return {
    id: row.id,
    name: row.name,
    sales: row.sales,
    affiliation: row.affiliation,
    client: row.client,
    billing: row.billing,
    cost: row.cost,
    incentiveTarget: row.incentive_target,
    month: row.month,
  };
}

// Convert app type to DB row
function entryToDb(entry: Omit<IncentiveEntry, "id">): Omit<DbIncentiveEntry, "id"> {
  return {
    name: entry.name,
    sales: entry.sales,
    affiliation: entry.affiliation,
    client: entry.client,
    billing: entry.billing,
    cost: entry.cost,
    incentive_target: entry.incentiveTarget,
    month: entry.month,
  };
}

// Generate array of 12 months for a given year
function generateMonthsForYear(year: string): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  });
}

// Get current year in YYYY format (default to 2026 for this dashboard)
function getCurrentYear(): string {
  return "2026";
}

// Get current month in YYYY-MM format (default to 2026-02 for this dashboard)
function getCurrentMonth(): string {
  return "2026-02";
}

export function useIncentiveData() {
  const [data, setData] = useState<IncentiveEntry[]>([]);
  const [goals, setGoalsState] = useState<Goals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected sales person filter
  const [selectedSales, setSelectedSales] = useState<string>("all");

  // View mode: monthly or yearly
  const [viewMode, setViewMode] = useState<ViewMode>("yearly");

  // Selected year (YYYY format)
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear());

  // Selected month (YYYY-MM format) - used in monthly view
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // Load data from Supabase or localStorage
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      if (isSupabaseConfigured && supabase) {
        try {
          // Fetch entries from Supabase
          const { data: entries, error: entriesError } = await supabase
            .from("incentive_entries")
            .select("*")
            .order("month", { ascending: false });

          if (entriesError) throw entriesError;

          // Fetch goals from Supabase
          const { data: goalsData, error: goalsError } = await supabase
            .from("goals")
            .select("*")
            .limit(1)
            .single();

          if (goalsError && goalsError.code !== "PGRST116") throw goalsError;

          setData(entries ? entries.map(dbToEntry) : []);
          if (goalsData) {
            setGoalsState({
              billing: goalsData.billing,
              profit: goalsData.profit,
              incentive: goalsData.incentive,
            });
          }
        } catch (err) {
          console.error("Supabase error:", err);
          setError("データの読み込みに失敗しました");
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Use localStorage
        loadFromLocalStorage();
      }

      setLoading(false);
    }

    function loadFromLocalStorage() {
      const savedData = localStorage.getItem(STORAGE_KEYS.DATA);
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      setData(savedData ? JSON.parse(savedData) : INITIAL_DATA);
      setGoalsState(savedGoals ? JSON.parse(savedGoals) : DEFAULT_GOALS);
    }

    loadData();
  }, []);

  // Save to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
    }
  }, [data, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }, [goals, loading]);

  // Get unique sales persons
  const salesPersons = useMemo(
    () => [...new Set(data.map((d) => d.sales))],
    [data]
  );

  // Get available years from data
  const availableYears = useMemo(() => {
    const years = [...new Set(data.map((d) => d.month.split("-")[0]))];
    return years.sort().reverse();
  }, [data]);

  // Filter data by selected sales person
  const salesFilteredData = useMemo(
    () =>
      selectedSales === "all"
        ? data
        : data.filter((d) => d.sales === selectedSales),
    [data, selectedSales]
  );

  // Filter by year
  const yearFilteredData = useMemo(
    () => salesFilteredData.filter((d) => d.month.startsWith(selectedYear)),
    [salesFilteredData, selectedYear]
  );

  // Filter by month (for monthly view)
  const monthFilteredData = useMemo(
    () => salesFilteredData.filter((d) => d.month === selectedMonth),
    [salesFilteredData, selectedMonth]
  );

  // Get the appropriate filtered data based on view mode
  const filteredData = useMemo(
    () => (viewMode === "monthly" ? monthFilteredData : yearFilteredData),
    [viewMode, monthFilteredData, yearFilteredData]
  );

  // Calculate statistics for current view
  const stats = useMemo<Stats>(() => {
    const totalBilling = filteredData.reduce((a, d) => a + d.billing, 0);
    const totalCost = filteredData.reduce((a, d) => a + d.cost, 0);
    const totalProfit = totalBilling - totalCost;
    const totalIncentive = filteredData.reduce(
      (a, d) => a + d.incentiveTarget,
      0
    );
    const avgMargin = totalBilling > 0 ? totalProfit / totalBilling : 0;

    return {
      totalBilling,
      totalCost,
      totalProfit,
      totalIncentive,
      avgMargin,
      count: filteredData.length,
    };
  }, [filteredData]);

  // Calculate yearly stats (always for the selected year)
  const yearlyStats = useMemo<Stats>(() => {
    const yearData = yearFilteredData;
    const totalBilling = yearData.reduce((a, d) => a + d.billing, 0);
    const totalCost = yearData.reduce((a, d) => a + d.cost, 0);
    const totalProfit = totalBilling - totalCost;
    const totalIncentive = yearData.reduce((a, d) => a + d.incentiveTarget, 0);
    const avgMargin = totalBilling > 0 ? totalProfit / totalBilling : 0;

    return {
      totalBilling,
      totalCost,
      totalProfit,
      totalIncentive,
      avgMargin,
      count: yearData.length,
    };
  }, [yearFilteredData]);

  // Monthly time series data for charts (12 months of selected year)
  const monthlyTimeSeries = useMemo<MonthlyData[]>(() => {
    const months = generateMonthsForYear(selectedYear);
    const monthLabels = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    return months.map((month, index) => {
      const monthData = salesFilteredData.filter((d) => d.month === month);
      const billing = monthData.reduce((a, d) => a + d.billing, 0);
      const cost = monthData.reduce((a, d) => a + d.cost, 0);

      return {
        month,
        monthLabel: monthLabels[index],
        billing,
        cost,
        profit: billing - cost,
        incentive: monthData.reduce((a, d) => a + d.incentiveTarget, 0),
        count: monthData.length,
      };
    });
  }, [salesFilteredData, selectedYear]);

  // Add new entry
  const addEntry = useCallback(async (entry: Omit<IncentiveEntry, "id">) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: newEntry, error } = await supabase
          .from("incentive_entries")
          .insert(entryToDb(entry))
          .select()
          .single();

        if (error) throw error;

        setData((prev) => [...prev, dbToEntry(newEntry)]);
      } catch (err) {
        console.error("Failed to add entry:", err);
        // Fallback to local
        setData((prev) => [...prev, { ...entry, id: Date.now() }]);
      }
    } else {
      setData((prev) => [...prev, { ...entry, id: Date.now() }]);
    }
  }, []);

  // Update existing entry
  const updateEntry = useCallback(async (id: number, entry: Omit<IncentiveEntry, "id">) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("incentive_entries")
          .update(entryToDb(entry))
          .eq("id", id);

        if (error) throw error;

        setData((prev) =>
          prev.map((d) => (d.id === id ? { ...entry, id } : d))
        );
      } catch (err) {
        console.error("Failed to update entry:", err);
        // Fallback to local
        setData((prev) =>
          prev.map((d) => (d.id === id ? { ...entry, id } : d))
        );
      }
    } else {
      setData((prev) =>
        prev.map((d) => (d.id === id ? { ...entry, id } : d))
      );
    }
  }, []);

  // Delete entry
  const deleteEntry = useCallback(async (id: number) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("incentive_entries")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setData((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        console.error("Failed to delete entry:", err);
        // Fallback to local
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } else {
      setData((prev) => prev.filter((d) => d.id !== id));
    }
  }, []);

  // Update goals
  const setGoals = useCallback(async (newGoals: Goals) => {
    setGoalsState(newGoals);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("goals")
          .update({
            billing: newGoals.billing,
            profit: newGoals.profit,
            incentive: newGoals.incentive,
          })
          .eq("id", 1);

        if (error) throw error;
      } catch (err) {
        console.error("Failed to update goals:", err);
      }
    }
  }, []);

  return {
    data,
    filteredData,
    yearFilteredData,
    monthFilteredData,
    goals,
    setGoals,
    selectedSales,
    setSelectedSales,
    salesPersons,
    stats,
    yearlyStats,
    monthlyTimeSeries,
    viewMode,
    setViewMode,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
    error,
  };
}
