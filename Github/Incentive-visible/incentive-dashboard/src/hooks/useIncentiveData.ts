import { useState, useEffect, useMemo } from "react";
import type { IncentiveEntry, Goals, Stats } from "../types";
import { INITIAL_DATA, DEFAULT_GOALS } from "../constants/initialData";

const STORAGE_KEYS = {
  DATA: "incentive-data",
  GOALS: "incentive-goals",
};

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

  // Filter data by selected sales person
  const filteredData = useMemo(
    () =>
      selectedSales === "all"
        ? data
        : data.filter((d) => d.sales === selectedSales),
    [data, selectedSales]
  );

  // Calculate statistics
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
    goals,
    setGoals,
    selectedSales,
    setSelectedSales,
    salesPersons,
    stats,
    addEntry,
    deleteEntry,
  };
}
