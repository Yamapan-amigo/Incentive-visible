import { useState, useEffect, useMemo, useCallback } from "react";
import type { IncentiveEntry, Goals, Stats, ViewMode, MonthlyData, ProfileSettings } from "../types";
import { DEFAULT_PROFILE_SETTINGS } from "../types";
import { INITIAL_DATA, DEFAULT_GOALS } from "../constants/initialData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { calculateIncentive } from "../utils/format";

export const STORAGE_KEYS = {
  DATA: "incentive-data",
  GOALS: "incentive-goals",
  CURRENT_USER: "current-user",
  PROFILE_SETTINGS: "profile-settings",
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

// Note: profile_settings table uses snake_case columns:
// sales_persons, current_user_name, focus_clients

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

  // Profile settings state
  const [profileSettings, setProfileSettingsState] = useState<ProfileSettings>(DEFAULT_PROFILE_SETTINGS);

  // Selected sales person filter
  const [selectedSales, setSelectedSales] = useState<string>("all");

  // View mode: monthly or yearly (default to monthly)
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

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

          // Fetch profile settings from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from("profile_settings")
            .select("*")
            .limit(1)
            .single();

          if (profileError && profileError.code !== "PGRST116") throw profileError;

          setData(entries ? entries.map(dbToEntry) : []);

          const loadedGoals = goalsData
            ? {
                billing: goalsData.billing,
                profit: goalsData.profit,
                incentive: goalsData.incentive,
              }
            : DEFAULT_GOALS;
          setGoalsState(loadedGoals);

          if (profileData) {
            setProfileSettingsState({
              salesPersons: profileData.sales_persons || DEFAULT_PROFILE_SETTINGS.salesPersons,
              currentUser: profileData.current_user_name || "",
              goals: loadedGoals,
              focusClients: profileData.focus_clients || [],
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
      const savedProfileSettings = localStorage.getItem(STORAGE_KEYS.PROFILE_SETTINGS);

      setData(savedData ? JSON.parse(savedData) : INITIAL_DATA);
      setGoalsState(savedGoals ? JSON.parse(savedGoals) : DEFAULT_GOALS);

      if (savedProfileSettings) {
        const parsed = JSON.parse(savedProfileSettings);
        // Migrate: if profile settings exist, sync goals
        setProfileSettingsState({
          ...DEFAULT_PROFILE_SETTINGS,
          ...parsed,
          goals: savedGoals ? JSON.parse(savedGoals) : parsed.goals || DEFAULT_GOALS,
        });
      }
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

  // Save profile settings to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEYS.PROFILE_SETTINGS, JSON.stringify(profileSettings));
    }
  }, [profileSettings, loading]);

  // Get unique sales persons from profile settings, falling back to data
  const salesPersons = useMemo(() => {
    // Use profile settings if available, otherwise extract from data
    if (profileSettings.salesPersons.length > 0) {
      return profileSettings.salesPersons;
    }
    return [...new Set(data.map((d) => d.sales))];
  }, [profileSettings.salesPersons, data]);

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
  // Incentive is calculated based on profit: (profit - 500,000) * 15%
  const stats = useMemo<Stats>(() => {
    const totalBilling = filteredData.reduce((a, d) => a + d.billing, 0);
    const totalCost = filteredData.reduce((a, d) => a + d.cost, 0);
    const totalProfit = totalBilling - totalCost;
    // Calculate incentive based on profit, not from stored incentiveTarget
    const totalIncentive = calculateIncentive(totalProfit);
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
  // For yearly stats, calculate incentive per month and sum them
  const yearlyStats = useMemo<Stats>(() => {
    const yearData = yearFilteredData;
    const totalBilling = yearData.reduce((a, d) => a + d.billing, 0);
    const totalCost = yearData.reduce((a, d) => a + d.cost, 0);
    const totalProfit = totalBilling - totalCost;

    // Group by month and calculate incentive per month, then sum
    const monthlyProfits = new Map<string, number>();
    yearData.forEach((d) => {
      const profit = d.billing - d.cost;
      monthlyProfits.set(d.month, (monthlyProfits.get(d.month) || 0) + profit);
    });
    const totalIncentive = Array.from(monthlyProfits.values()).reduce(
      (sum, monthProfit) => sum + calculateIncentive(monthProfit),
      0
    );

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
      const profit = billing - cost;

      return {
        month,
        monthLabel: monthLabels[index],
        billing,
        cost,
        profit,
        // Calculate incentive based on monthly profit
        incentive: calculateIncentive(profit),
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

  // Update profile settings
  const setProfileSettings = useCallback(async (newSettings: ProfileSettings) => {
    setProfileSettingsState(newSettings);

    // Sync goals state
    if (newSettings.goals) {
      setGoalsState(newSettings.goals);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Update profile settings in Supabase
        const { error: profileError } = await supabase
          .from("profile_settings")
          .update({
            sales_persons: newSettings.salesPersons,
            current_user_name: newSettings.currentUser,
            focus_clients: newSettings.focusClients,
          })
          .eq("id", 1);

        if (profileError) throw profileError;

        // Also update goals in Supabase
        if (newSettings.goals) {
          const { error: goalsError } = await supabase
            .from("goals")
            .update({
              billing: newSettings.goals.billing,
              profit: newSettings.goals.profit,
              incentive: newSettings.goals.incentive,
            })
            .eq("id", 1);

          if (goalsError) throw goalsError;
        }
      } catch (err) {
        console.error("Failed to update profile settings:", err);
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
    profileSettings,
    setProfileSettings,
  };
}
