import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Solar Color Palette ───────────────────────────────────────
const C = {
  bg: "#faf9f7",
  card: "#ffffff",
  border: "rgba(0,0,0,0.06)",
  borderWarm: "rgba(251,146,60,0.15)",
  text: "#1a1a2e",
  textSub: "#4a4a68",
  textMuted: "#9ca3af",
  textDim: "#c4c4d4",
  sun1: "#fb923c",
  sun2: "#f59e0b",
  sun3: "#ef4444",
  space1: "#6366f1",
  space2: "#818cf8",
  orbit1: "#06b6d4",
  orbit2: "#10b981",
  gradSun: "linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #fbbf24 100%)",
  gradFlare: "linear-gradient(135deg, #ef4444 0%, #fb923c 50%, #fbbf24 100%)",
  gradCosmic: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  gradNebula: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
  shadowHover: "0 4px 20px rgba(251,146,60,0.12), 0 8px 32px rgba(0,0,0,0.06)",
};

const CHART_COLORS = ["#fb923c", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#fbbf24"];
const fmt = (n) => `¥${n.toLocaleString()}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

const INITIAL_DATA = [
  { id: 1, name: "中原 俊吾", sales: "岡田", affiliation: "アットバーチ株式会社", client: "NXtech株式会社", billing: 740000, cost: 700000, incentiveTarget: 40000, month: "2025-12" },
  { id: 2, name: "関下 晃一", sales: "岡田", affiliation: "株式会社フォスターネット", client: "NXtech株式会社", billing: 502500, cost: 472500, incentiveTarget: 30000, month: "2025-12" },
  { id: 3, name: "百瀬 亮", sales: "岡田", affiliation: "社員", client: "株式会社はばたーく", billing: 650000, cost: 504000, incentiveTarget: 50000, month: "2025-12" },
  { id: 4, name: "山川 伝三", sales: "岡田", affiliation: "有限会社エム・エム", client: "株式会社ルートゼロ", billing: 650000, cost: 500000, incentiveTarget: 50000, month: "2025-12" },
  { id: 5, name: "朝倉 裕樹", sales: "岡田", affiliation: "株式会社ITエンタープライズ", client: "株式会社アイシーズ", billing: 850000, cost: 800000, incentiveTarget: 50000, month: "2025-12" },
  { id: 6, name: "古川 良二", sales: "岡田", affiliation: "社員", client: "インターノウス株式会社", billing: 650000, cost: 520000, incentiveTarget: 50000, month: "2025-12" },
];

const CursorGlow = () => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current) { ref.current.style.left = e.clientX + "px"; ref.current.style.top = e.clientY + "px"; } };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return <div ref={ref} style={{
    position: "fixed", width: 420, height: 420, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, rgba(253,230,138,0.03) 35%, transparent 70%)",
    pointerEvents: "none", transform: "translate(-50%, -50%)", zIndex: 0,
    transition: "left 0.25s ease-out, top 0.25s ease-out",
  }} />;
};

const StarField = () => {
  const stars = useMemo(() => Array.from({ length: 35 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.2 + 0.8, dur: Math.random() * 4 + 3,
    delay: Math.random() * 5, opacity: Math.random() * 0.2 + 0.04,
  })), []);
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
    {stars.map((s) => <div key={s.id} style={{
      position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: "50%",
      background: s.id % 3 === 0 ? C.sun1 : s.id % 3 === 1 ? C.space2 : C.orbit1,
      opacity: s.opacity, animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
    }} />)}
  </div>;
};

const SunOrb = ({ size = 120 }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <div style={{ position: "absolute", inset: -size * 0.3, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(253,230,138,0.25) 0%, rgba(251,146,60,0.06) 50%, transparent 70%)",
      animation: "sunPulse 4s ease-in-out infinite" }} />
    <div style={{ position: "absolute", inset: -size * 0.12, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
      animation: "sunPulse 3s ease-in-out 0.5s infinite" }} />
    <div style={{ width: "100%", height: "100%", borderRadius: "50%",
      background: "radial-gradient(circle at 35% 35%, #fde68a 0%, #fbbf24 25%, #fb923c 60%, #f97316 100%)",
      boxShadow: "0 0 40px rgba(251,146,60,0.25), 0 0 80px rgba(251,146,60,0.08)" }} />
  </div>
);

const KPICard = ({ label, value, sub, gradient, icon, delay }) => (
  <div style={{
    background: C.card, borderRadius: 18, padding: "22px 24px",
    border: `1px solid ${C.border}`, boxShadow: C.shadow,
    position: "relative", overflow: "hidden",
    animation: `riseUp 0.6s ease ${delay}s both`,
    transition: "transform 0.25s ease, box-shadow 0.25s ease", cursor: "default",
  }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = C.shadowHover; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = C.shadow; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradient, opacity: 0.8 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.text, fontFamily: "'Space Mono', monospace", letterSpacing: "-0.03em" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: gradient, opacity: 0.12, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", fontSize: 20 }}>{icon}</span>
      </div>
    </div>
  </div>
);

const GoalRing = ({ current, goal, label, color }) => {
  const ratio = goal > 0 ? Math.min(current / goal, 1) : 0;
  const circ = 2 * Math.PI * 42;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - ratio)} transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Space Mono', monospace" }}>{Math.round(ratio * 100)}%</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textSub }}>{label}</div>
        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "'Space Mono', monospace", marginTop: 2 }}>{fmt(current)} / {fmt(goal)}</div>
      </div>
    </div>
  );
};

const SolarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
      border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((e, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: e.color, fontFamily: "'Space Mono', monospace" }}>
          {e.name}: {fmt(e.value)}
        </div>
      ))}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 22, padding: "28px 32px", width: "92%", maxWidth: 540,
        maxHeight: "82vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.12)", animation: "modalIn 0.3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "rgba(0,0,0,0.04)", border: "none", width: 32, height: 32, borderRadius: 10,
            color: C.textMuted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const iS = { width: "100%", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const FF = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</label>
    {children}
  </div>
);

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [sel, setSel] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goals, setGoals] = useState({ billing: 5000000, profit: 800000, incentive: 350000 });
  const [tg, setTg] = useState(goals);
  const [ne, setNe] = useState({ name: "", sales: "", affiliation: "", client: "", billing: "", cost: "", incentiveTarget: "", month: "2025-12" });

  const sp = useMemo(() => [...new Set(data.map((d) => d.sales))], [data]);
  const f = useMemo(() => (sel === "all" ? data : data.filter((d) => d.sales === sel)), [data, sel]);
  const s = useMemo(() => {
    const tb = f.reduce((a, d) => a + d.billing, 0);
    const tc = f.reduce((a, d) => a + d.cost, 0);
    const tp = tb - tc; const ti = f.reduce((a, d) => a + d.incentiveTarget, 0);
    return { tb, tc, tp, ti, am: tb > 0 ? tp / tb : 0, n: f.length };
  }, [f]);

  const bd = useMemo(() => f.map((d) => ({ name: d.name.split(/[\s　]/)[0], 売上: d.billing, 仕入: d.cost, 粗利: d.billing - d.cost })), [f]);
  const pd = useMemo(() => { const m = {}; f.forEach((d) => { m[d.client] = (m[d.client] || 0) + d.billing; }); return Object.entries(m).map(([name, value]) => ({ name, value })); }, [f]);
  const md = useMemo(() => f.map((d) => ({ name: d.name.split(/[\s　]/)[0], rate: parseFloat((((d.billing - d.cost) / d.billing) * 100).toFixed(1)) })), [f]);

  const handleAdd = () => {
    if (!ne.name || !ne.billing || !ne.cost) return;
    setData((p) => [...p, { ...ne, id: Date.now(), billing: +ne.billing, cost: +ne.cost, incentiveTarget: +ne.incentiveTarget }]);
    setNe({ name: "", sales: "", affiliation: "", client: "", billing: "", cost: "", incentiveTarget: "", month: "2025-12" });
    setShowAdd(false);
  };

  const btnS = { width: "100%", padding: "11px", marginTop: 6, fontSize: 13, fontWeight: 700, border: "none", borderRadius: 12, cursor: "pointer", background: C.gradSun, color: "#fff", fontFamily: "inherit", boxShadow: "0 2px 12px rgba(251,146,60,0.25)" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, position: "relative", overflow: "hidden", fontFamily: "'Noto Sans JP', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes riseUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes twinkle{0%,100%{opacity:.05;transform:scale(1)}50%{opacity:.35;transform:scale(1.5)}}
        @keyframes sunPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.08);opacity:1}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
        *{box-sizing:border-box;margin:0}
      `}</style>
      <CursorGlow /><StarField />
      <div style={{ position: "fixed", top: -80, right: -80, zIndex: 0, opacity: 0.45, pointerEvents: "none" }}><SunOrb size={200} /></div>
      <div style={{ position: "fixed", top: -200, right: -200, width: 700, height: 700, pointerEvents: "none", zIndex: 0 }}>
        {[260, 320, 380].map((r, i) => <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: r * 2, height: r * 2, border: `1px solid rgba(251,146,60,${0.06 - i * 0.015})`, borderRadius: "50%", transform: "translate(-50%, -50%)" }} />)}
      </div>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, padding: "24px 40px 18px", borderBottom: `1px solid ${C.border}`, background: "linear-gradient(180deg, rgba(253,230,138,0.06) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SunOrb size={36} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>インセンティブ ダッシュボード</h1>
              <p style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, letterSpacing: "0.04em" }}>SOLAR INCENTIVE TRACKER — 2025年12月</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.shadow }}>
              {["all", ...sp].map((v, i) => (
                <button key={v} onClick={() => setSel(v)} style={{
                  padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "none",
                  borderLeft: i > 0 ? `1px solid ${C.border}` : "none", cursor: "pointer",
                  background: sel === v ? C.gradSun : "transparent",
                  color: sel === v ? "#fff" : C.textMuted, fontFamily: "inherit", transition: "all 0.2s",
                }}>{v === "all" ? "全体" : v}</button>
              ))}
            </div>
            <button onClick={() => { setTg(goals); setShowGoal(true); }} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 600, border: `1px solid ${C.borderWarm}`,
              borderRadius: 12, cursor: "pointer", background: "rgba(251,146,60,0.06)", color: C.sun1, fontFamily: "inherit",
            }}>🎯 目標設定</button>
            <button onClick={() => setShowAdd(true)} style={{
              padding: "7px 20px", fontSize: 12, fontWeight: 700, border: "none", borderRadius: 12,
              cursor: "pointer", background: C.gradSun, color: "#fff", fontFamily: "inherit",
              boxShadow: "0 2px 12px rgba(251,146,60,0.25)",
            }}>＋ データ追加</button>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "24px 40px 40px", maxWidth: 1440, margin: "0 auto" }}>
        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 22 }}>
          <KPICard label="売上合計" value={fmt(s.tb)} sub={`${s.n}名`} gradient={C.gradSun} icon="☀️" delay={0} />
          <KPICard label="仕入合計" value={fmt(s.tc)} sub="原価" gradient={C.gradCosmic} icon="🪐" delay={0.05} />
          <KPICard label="粗利合計" value={fmt(s.tp)} sub={`平均粗利率 ${pct(s.am)}`} gradient={C.gradFlare} icon="🔥" delay={0.1} />
          <KPICard label="インセンティブ対象" value={fmt(s.ti)} sub={`粗利の ${s.tp > 0 ? pct(s.ti / s.tp) : "—"}`} gradient={C.gradNebula} icon="💫" delay={0.15} />
        </div>

        {/* Goals */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 28px", marginBottom: 22, animation: "riseUp 0.6s ease 0.2s both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: C.gradSun, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>☀</span>
              目標達成率
            </h3>
            <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>GOAL PROGRESS</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
            <GoalRing current={s.tb} goal={goals.billing} label="売上目標" color={C.sun1} />
            <GoalRing current={s.tp} goal={goals.profit} label="粗利目標" color={C.space1} />
            <GoalRing current={s.ti} goal={goals.incentive} label="インセン目標" color={C.orbit1} />
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 18px 14px", animation: "riseUp 0.6s ease 0.25s both" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 18px 8px" }}>要員別 売上・仕入・粗利</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bd} barGap={2} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.textDim }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip content={<SolarTooltip />} />
                <Bar dataKey="売上" fill={C.sun1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="仕入" fill={C.textDim} radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey="粗利" fill={C.space1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 18px 14px", animation: "riseUp 0.6s ease 0.3s both" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 18px 8px" }}>顧客別 売上構成</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pd} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value" stroke="none">
                  {pd.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<SolarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} formatter={(v) => <span style={{ color: C.textMuted, fontSize: 10 }}>{v.length > 14 ? v.slice(0, 14) + "…" : v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 28px", marginBottom: 22, animation: "riseUp 0.6s ease 0.35s both" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 18 }}>粗利率分布</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {md.map((d, i) => {
              const c = d.rate > 15 ? C.orbit2 : d.rate > 8 ? C.sun2 : C.sun3;
              return <div key={i} style={{ flex: "1 1 0", minWidth: 110 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 600 }}>{d.name}</div>
                <div style={{ position: "relative", height: 32, background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(d.rate * 4, 100)}%`,
                    background: `linear-gradient(90deg, ${c}, ${c}dd)`, borderRadius: 8, transition: "width 1s ease",
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                  }}><span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Space Mono', monospace" }}>{d.rate}%</span></div>
                </div>
              </div>;
            })}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 10, color: C.textMuted }}>
            {[["15%以上", C.orbit2], ["8〜15%", C.sun2], ["8%未満", C.sun3]].map(([l, c]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />{l}</span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden", animation: "riseUp 0.6s ease 0.4s both" }}>
          <div style={{ padding: "18px 28px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700 }}>明細データ</h3>
            <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{f.length}件</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: "rgba(0,0,0,0.01)" }}>
                  {["要員名", "営業", "所属", "案件顧客", "売上", "仕入", "粗利", "粗利率", "インセン対象", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: i >= 4 ? "right" : "left", color: C.textMuted, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.map((d) => {
                  const p = d.billing - d.cost;
                  const m = d.billing > 0 ? p / d.billing : 0;
                  const mc = m > 0.15 ? C.orbit2 : m > 0.08 ? C.sun2 : C.sun3;
                  return (
                    <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(251,146,60,0.02)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>{d.name}</td>
                      <td style={{ padding: "12px 14px" }}><span style={{ background: "rgba(99,102,241,0.08)", color: C.space1, padding: "3px 10px", borderRadius: 6, fontSize: 10.5, fontWeight: 700 }}>{d.sales}</span></td>
                      <td style={{ padding: "12px 14px", color: C.textSub, fontSize: 11.5 }}>{d.affiliation}</td>
                      <td style={{ padding: "12px 14px", color: C.textSub, fontSize: 11.5 }}>{d.client}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>{fmt(d.billing)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Space Mono', monospace", color: C.textMuted }}>{fmt(d.cost)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Space Mono', monospace", fontWeight: 700, color: p > 100000 ? C.space1 : C.text }}>{fmt(p)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, fontWeight: 700, color: mc }}>{pct(m)}</span></td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Space Mono', monospace", fontWeight: 800, color: C.sun1 }}>{fmt(d.incentiveTarget)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button onClick={() => setData((pr) => pr.filter((x) => x.id !== d.id))} title="削除" style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 13, padding: 4 }}
                          onMouseEnter={(e) => e.currentTarget.style.color = C.sun3} onMouseLeave={(e) => e.currentTarget.style.color = C.textDim}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "28px 0 8px", fontSize: 10, color: C.textDim, letterSpacing: "0.1em" }}>SOLAR INCENTIVE DASHBOARD v2.0 — Built for SES Operations ☀</div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="データ追加">
        <FF label="要員名"><input style={iS} value={ne.name} onChange={(e) => setNe({ ...ne, name: e.target.value })} placeholder="山田 太郎" /></FF>
        <FF label="営業担当"><input style={iS} value={ne.sales} onChange={(e) => setNe({ ...ne, sales: e.target.value })} placeholder="岡田" /></FF>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FF label="所属"><input style={iS} value={ne.affiliation} onChange={(e) => setNe({ ...ne, affiliation: e.target.value })} placeholder="社員 / 会社名" /></FF>
          <FF label="案件顧客"><input style={iS} value={ne.client} onChange={(e) => setNe({ ...ne, client: e.target.value })} placeholder="顧客名" /></FF>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <FF label="売上（単価）"><input style={iS} type="number" value={ne.billing} onChange={(e) => setNe({ ...ne, billing: e.target.value })} placeholder="650000" /></FF>
          <FF label="仕入（原価）"><input style={iS} type="number" value={ne.cost} onChange={(e) => setNe({ ...ne, cost: e.target.value })} placeholder="500000" /></FF>
          <FF label="インセン対象"><input style={iS} type="number" value={ne.incentiveTarget} onChange={(e) => setNe({ ...ne, incentiveTarget: e.target.value })} placeholder="50000" /></FF>
        </div>
        <FF label="月"><input style={iS} type="month" value={ne.month} onChange={(e) => setNe({ ...ne, month: e.target.value })} /></FF>
        <button onClick={handleAdd} style={btnS}>追加する</button>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={showGoal} onClose={() => setShowGoal(false)} title="🎯 目標額設定">
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 18, lineHeight: 1.6 }}>月次の目標額を設定します。達成率リングに反映されます。</p>
        <FF label="売上目標"><input style={iS} type="number" value={tg.billing} onChange={(e) => setTg({ ...tg, billing: +e.target.value })} /></FF>
        <FF label="粗利目標"><input style={iS} type="number" value={tg.profit} onChange={(e) => setTg({ ...tg, profit: +e.target.value })} /></FF>
        <FF label="インセンティブ目標"><input style={iS} type="number" value={tg.incentive} onChange={(e) => setTg({ ...tg, incentive: +e.target.value })} /></FF>
        <button onClick={() => { setGoals(tg); setShowGoal(false); }} style={btnS}>保存する</button>
      </Modal>
    </div>
  );
}
