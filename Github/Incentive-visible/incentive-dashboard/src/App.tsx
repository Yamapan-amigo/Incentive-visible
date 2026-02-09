import { useState, useMemo, useEffect } from "react";
import { COLORS } from "./constants/colors";
import { fmt, pct } from "./utils/format";
import { useIncentiveData, STORAGE_KEYS } from "./hooks/useIncentiveData";
import type { NewEntry, Goals, IncentiveEntry } from "./types";
import type { SalesPerson } from "./constants/initialData";

// Layout components
import { CursorGlow } from "./components/layout/CursorGlow";
import { Header } from "./components/layout/Header";

// Decoration components
import { StarField } from "./components/decorations/StarField";
import { SunOrb } from "./components/decorations/SunOrb";

// Card components
import { KPICard } from "./components/cards/KPICard";
import { GoalRing } from "./components/cards/GoalRing";
import { GoalSummary } from "./components/cards/GoalSummary";

// Chart components
import { BarChartSection } from "./components/charts/BarChartSection";
import { PieChartSection } from "./components/charts/PieChartSection";
import { MarginBars } from "./components/charts/MarginBars";
import { MonthlyTrendChart } from "./components/charts/MonthlyTrendChart";

// Table components
import { DetailTable } from "./components/table/DetailTable";
import { MonthlyIncentiveTable } from "./components/table/MonthlyIncentiveTable";
import { StaffYearlySummary } from "./components/table/StaffYearlySummary";

// Modal components
import { AddDataModal } from "./components/modals/AddDataModal";
import { EditDataModal } from "./components/modals/EditDataModal";
import { GoalModal } from "./components/modals/GoalModal";
import { UserSelectModal } from "./components/modals/UserSelectModal";

import "./styles/animations.css";

function App() {
  const {
    filteredData,
    yearFilteredData,
    goals,
    setGoals,
    selectedSales,
    setSelectedSales,
    salesPersons,
    stats,
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
  } = useIncentiveData();

  // Current user state (sales person)
  const [currentUser, setCurrentUser] = useState<SalesPerson | null>(null);
  const [showUserSelectModal, setShowUserSelectModal] = useState(false);

  // Load current user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) as SalesPerson | null;
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      setShowUserSelectModal(true);
    }
  }, []);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncentiveEntry | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoals, setTempGoals] = useState<Goals>(goals);
  const [newEntry, setNewEntry] = useState<NewEntry>({
    name: "",
    sales: currentUser || "",
    affiliation: "",
    client: "",
    billing: "",
    cost: "",
    incentiveTarget: "",
    month: selectedMonth,
  });

  // Update newEntry.sales when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setNewEntry((prev) => ({ ...prev, sales: currentUser }));
    }
  }, [currentUser]);

  // Handler for user selection
  const handleUserSelect = (user: SalesPerson) => {
    setCurrentUser(user);
    setShowUserSelectModal(false);
  };

  // Chart data
  const barChartData = useMemo(
    () =>
      filteredData.map((d) => ({
        name: d.name.split(/[\s　]/)[0],
        売上: d.billing,
        仕入: d.cost,
        粗利: d.billing - d.cost,
      })),
    [filteredData]
  );

  const pieChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((d) => {
      map[d.client] = (map[d.client] || 0) + d.billing;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const marginData = useMemo(
    () =>
      filteredData.map((d) => ({
        name: d.name.split(/[\s　]/)[0],
        rate: parseFloat(
          (((d.billing - d.cost) / d.billing) * 100).toFixed(1)
        ),
      })),
    [filteredData]
  );

  // Handlers
  const handleAdd = async () => {
    if (!newEntry.name || !newEntry.billing || !newEntry.cost) return;
    try {
      await addEntry({
        name: newEntry.name,
        sales: newEntry.sales,
        affiliation: newEntry.affiliation,
        client: newEntry.client,
        billing: +newEntry.billing,
        cost: +newEntry.cost,
        incentiveTarget: +newEntry.incentiveTarget,
        month: newEntry.month,
      });
      setNewEntry({
        name: "",
        sales: currentUser || "",
        affiliation: "",
        client: "",
        billing: "",
        cost: "",
        incentiveTarget: "",
        month: selectedMonth,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add entry:", err);
    }
  };

  const handleOpenGoalModal = () => {
    setTempGoals(goals);
    setShowGoalModal(true);
  };

  const handleSaveGoals = async () => {
    await setGoals(tempGoals);
    setShowGoalModal(false);
  };

  const handleOpenEditModal = (entry: IncentiveEntry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEntry(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
      }}
    >
      {/* Font imports */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Global styles */}
      <style>{`
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px }
        * { box-sizing: border-box; margin: 0 }
      `}</style>

      {/* Decorations */}
      <CursorGlow />
      <StarField />

      {/* Background sun orb */}
      <div
        style={{
          position: "fixed",
          top: -80,
          right: -80,
          zIndex: 0,
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        <SunOrb size={200} />
      </div>

      {/* Orbital rings */}
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 700,
          height: 700,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {[260, 320, 380].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: r * 2,
              height: r * 2,
              border: `1px solid rgba(251,146,60,${0.06 - i * 0.015})`,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Header
        salesPersons={salesPersons}
        selectedSales={selectedSales}
        onSelectSales={setSelectedSales}
        onOpenGoalModal={handleOpenGoalModal}
        onOpenAddModal={() => setShowAddModal(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableYears={availableYears}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "24px 40px 40px",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {/* Goal Summary - Prominent display at top */}
        <GoalSummary goals={goals} viewMode={viewMode} />

        {/* Monthly Trend Chart - Only in yearly view */}
        {viewMode === "yearly" && (
          <MonthlyTrendChart data={monthlyTimeSeries} selectedYear={selectedYear} />
        )}

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <KPICard
            label="売上合計"
            value={fmt(stats.totalBilling)}
            sub={`${stats.count}名`}
            gradient={COLORS.gradSun}
            icon="☀️"
            delay={0}
          />
          <KPICard
            label="仕入合計"
            value={fmt(stats.totalCost)}
            sub="原価"
            gradient={COLORS.gradCosmic}
            icon="🪐"
            delay={0.05}
          />
          <KPICard
            label="粗利合計"
            value={fmt(stats.totalProfit)}
            sub={`平均粗利率 ${pct(stats.avgMargin)}`}
            gradient={COLORS.gradFlare}
            icon="🔥"
            delay={0.1}
          />
          <KPICard
            label="インセンティブ対象"
            value={fmt(stats.totalIncentive)}
            sub={`粗利の ${stats.totalProfit > 0 ? pct(stats.totalIncentive / stats.totalProfit) : "—"}`}
            gradient={COLORS.gradNebula}
            icon="💫"
            delay={0.15}
          />
        </div>

        {/* Goals Section */}
        <div
          style={{
            background: COLORS.card,
            borderRadius: 18,
            border: `1px solid ${COLORS.border}`,
            boxShadow: COLORS.shadow,
            padding: "22px 28px",
            marginBottom: 22,
            animation: "riseUp 0.6s ease 0.2s both",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: COLORS.gradSun,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                }}
              >
                ☀
              </span>
              目標達成率
            </h3>
            <span
              style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500 }}
            >
              GOAL PROGRESS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <GoalRing
              current={stats.totalBilling}
              goal={viewMode === "yearly" ? goals.billing * 12 : goals.billing}
              label={viewMode === "yearly" ? "年間売上目標" : "売上目標"}
              color={COLORS.sun1}
            />
            <GoalRing
              current={stats.totalProfit}
              goal={viewMode === "yearly" ? goals.profit * 12 : goals.profit}
              label={viewMode === "yearly" ? "年間粗利目標" : "粗利目標"}
              color={COLORS.space1}
            />
            <GoalRing
              current={stats.totalIncentive}
              goal={viewMode === "yearly" ? goals.incentive * 12 : goals.incentive}
              label={viewMode === "yearly" ? "年間インセン目標" : "インセン目標"}
              color={COLORS.orbit1}
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <BarChartSection data={barChartData} />
          <PieChartSection data={pieChartData} />
        </div>

        {/* Staff Summary (yearly) or Margin Bars (monthly) */}
        {viewMode === "yearly" ? (
          <StaffYearlySummary data={yearFilteredData} selectedYear={selectedYear} />
        ) : (
          <MarginBars data={marginData} />
        )}

        {/* Monthly Incentive Table - Show yearly data in yearly view */}
        <MonthlyIncentiveTable data={yearFilteredData} />

        {/* Detail Table - Only in monthly view */}
        {viewMode === "monthly" && (
          <DetailTable data={filteredData} onEdit={handleOpenEditModal} onDelete={deleteEntry} />
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "28px 0 8px",
            fontSize: 10,
            color: COLORS.textDim,
            letterSpacing: "0.1em",
          }}
        >
          SOLAR INCENTIVE DASHBOARD v2.0 — Built for SES Operations ☀
        </div>
      </div>

      {/* Modals */}
      <UserSelectModal
        isOpen={showUserSelectModal}
        onSelect={handleUserSelect}
      />

      <AddDataModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        onAdd={handleAdd}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        tempGoals={tempGoals}
        setTempGoals={setTempGoals}
        onSave={handleSaveGoals}
      />

      <EditDataModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        entry={editingEntry}
        onSave={updateEntry}
      />
    </div>
  );
}

export default App;
