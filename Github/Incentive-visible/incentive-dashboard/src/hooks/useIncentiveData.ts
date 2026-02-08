import { useState, useEffect, useMemo } from "react";
import type { IncentiveEntry, Goals, Stats, ViewMode, MonthlyData } from "../types";
import { INITIAL_DATA, DEFAULT_GOALS } from "../constants/initialData";

const STORAGE_KEYS = {
  DATA: "incentive-data",
  GOALS: "incentive-goals",
};

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
  // Initialize data from localStorage or use initial data
  const [data, setData] = useState<IncentiveEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DATA);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Initialize goals from localStorage or use defaults
  const [goals, setGoals] = useState<Goals>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  // Selected sales person filter
  const [selectedSales, setSelectedSales] = useState<string>("all");

  // View mode: monthly or yearly
  const [viewMode, setViewMode] = useState<ViewMode>("yearly");

  // Selected year (YYYY format)
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear());

  // Selected month (YYYY-MM format) - used in monthly view
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // Auto-save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
  }, [data]);

  // Auto-save goals to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

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
  const addEntry = (entry: Omit<IncentiveEntry, "id">) => {
    setData((prev) => [...prev, { ...entry, id: Date.now() }]);
  };

  // Delete entry
  const deleteEntry = (id: number) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  };

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
    deleteEntry,
  };
}
