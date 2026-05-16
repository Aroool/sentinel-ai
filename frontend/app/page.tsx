"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeAction, type AnalysisResult, type RiskLevel } from "@/lib/analyzeAction";
import {
  Shield,
  TerminalSquare,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  FileWarning,
  ScrollText,
  Lock,
  Settings,
  ChevronRight,
  Activity,
  Ban,
  ShieldCheck,
  Zap,
  History,
  X,
  Tag,
  Menu,
  Bell,
  Copy,
  Check,
  Download,
  Keyboard,
  ToggleRight,
  TrendingUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface TimelineEvent {
  time: string;
  title: string;
  desc: string;
}

interface HistoryItem {
  id: number;
  request: string;
  result: AnalysisResult;
  status: "pending" | "approved" | "denied";
}

interface Stats {
  analyzed: number;
  approved: number;
  blocked: number;
  critical: number;
}

interface Toast {
  id: number;
  risk: RiskLevel;
  message: string;
}

// ── Constants ─────────────────────────────────────────────────────────────

const EXAMPLE_GROUPS: { label: string; risk: RiskLevel; items: string[] }[] = [
  { label: "Safe", risk: "LOW",      items: ["git status", "Run pytest", "npm run build", "git add ."] },
  { label: "Medium", risk: "MEDIUM", items: ["git rebase main", "docker system prune", "DELETE FROM logs WHERE old=true"] },
  { label: "High",   risk: "HIGH",   items: ["git push origin main", "Deploy to production", "git reset --hard"] },
  { label: "Critical", risk: "CRITICAL", items: ["git push --force", "DROP TABLE users", "rm -rf /var/data", "Delete production.env"] },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Requests", icon: FileWarning, active: false },
  { label: "Audit Log", icon: ScrollText, active: false },
  { label: "Policy Engine", icon: Lock, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const RISK_CONFIG: Record<
  RiskLevel,
  { badge: string; bar: string; button: string; icon: string; meter: number; glow: string; orb: string }
> = {
  LOW: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    bar: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30",
    icon: "text-emerald-400",
    meter: 20,
    glow: "rgba(16,185,129,0.07)",
    orb: "rgba(16,185,129,0.12)",
  },
  MEDIUM: {
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    bar: "bg-amber-500",
    button: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30",
    icon: "text-amber-400",
    meter: 50,
    glow: "rgba(245,158,11,0.07)",
    orb: "rgba(245,158,11,0.10)",
  },
  HIGH: {
    badge: "border-red-500/40 bg-red-500/10 text-red-400",
    bar: "bg-red-500",
    button: "bg-red-600 hover:bg-red-700 shadow-red-600/30",
    icon: "text-red-400",
    meter: 75,
    glow: "rgba(239,68,68,0.08)",
    orb: "rgba(239,68,68,0.12)",
  },
  CRITICAL: {
    badge: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400",
    bar: "bg-fuchsia-500",
    button: "bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-600/30",
    icon: "text-fuchsia-400",
    meter: 100,
    glow: "rgba(217,70,239,0.10)",
    orb: "rgba(217,70,239,0.14)",
  },
};

const CARD = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const DEFAULT_ANALYSIS: AnalysisResult = {
  action: "Direct Push to Main Branch",
  risk: "HIGH",
  category: "Version Control",
  reason: [
    "Bypasses the pull request and code review workflow",
    "Unreviewed code goes directly to the primary branch",
    "May violate branch protection rules and CODEOWNERS policies",
  ],
  recommendation: "Open a pull request from a feature branch and request at least one reviewer.",
};

// ── Sub-components ────────────────────────────────────────────────────────

const GAUGE_R = 38;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC = GAUGE_C * 0.75; // 270° arc
const GAUGE_GAP = GAUGE_C * 0.25;

const GAUGE_HEX: Record<RiskLevel, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#d946ef",
};

function CircularGauge({ risk }: { risk: RiskLevel }) {
  const pct = RISK_CONFIG[risk].meter;
  const offset = GAUGE_ARC * (1 - pct / 100);
  const color = GAUGE_HEX[risk];
  return (
    <div className="relative flex items-center justify-center w-[88px] h-[88px] flex-shrink-0">
      <svg width="88" height="88" style={{ transform: "rotate(-135deg)" }}>
        {/* Track */}
        <circle
          cx="44" cy="44" r={GAUGE_R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6.5"
          strokeDasharray={`${GAUGE_ARC} ${GAUGE_GAP}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.circle
          cx="44" cy="44" r={GAUGE_R}
          fill="none"
          stroke={color}
          strokeWidth="6.5"
          strokeDasharray={`${GAUGE_ARC} ${GAUGE_GAP}`}
          initial={{ strokeDashoffset: GAUGE_ARC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 7px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={`text-[10px] font-bold tracking-wide ${RISK_CONFIG[risk].icon}`}>
          {risk}
        </span>
        <span className="text-[9px] text-zinc-600">{pct}%</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  hoverShadow,
  sparkline,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  colorClass: string;
  hoverShadow: string;
  sparkline?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: hoverShadow }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-4"
    >
      <div className={`rounded-xl p-2.5 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <motion.p
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="text-xl font-bold tabular-nums leading-none"
        >
          {value}
        </motion.p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
      {sparkline}
    </motion.div>
  );
}

function logColor(line: string): string {
  if (/critical|fuchsia|destroy|wipe/i.test(line)) return "text-fuchsia-400";
  if (/hold|denied|blocked|approval denied/i.test(line)) return "text-red-400";
  if (/warning|medium/i.test(line)) return "text-amber-400";
  if (/safe|complete|approved|execution complete/i.test(line)) return "text-emerald-300";
  if (/received|running|analyzing|pattern/i.test(line)) return "text-zinc-400";
  return "text-emerald-500";
}

function HistoryBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RISK_CONFIG[risk].badge}`}>
      {risk}
    </span>
  );
}

// ── Copy Logs Button ──────────────────────────────────────────────────────
function CopyLogsButton({ logs }: { logs: string[] }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(logs.join("\n")).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      title="Copy log output"
      className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/4 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
const RISK_Y: Record<RiskLevel, number> = { LOW: 0.85, MEDIUM: 0.55, HIGH: 0.28, CRITICAL: 0.05 };

function Sparkline({ risks }: { risks: RiskLevel[] }) {
  if (risks.length < 2) return null;
  const W = 80, H = 28;
  const step = W / (risks.length - 1);
  const pts = risks.map((r, i) => `${i * step},${RISK_Y[r] * H}`).join(" ");
  const last = risks[risks.length - 1];
  return (
    <svg width={W} height={H} className="opacity-70 flex-shrink-0">
      <polyline points={pts} fill="none" stroke={GAUGE_HEX[last]} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(risks.length - 1) * step} cy={RISK_Y[last] * H} r="2.5" fill={GAUGE_HEX[last]} />
    </svg>
  );
}

// ── Keyboard Shortcuts Modal ───────────────────────────────────────────────
const SHORTCUTS = [
  { keys: ["⌘", "↵"], label: "Analyze request" },
  { keys: ["R"], label: "Reset console" },
  { keys: ["?"], label: "Toggle shortcuts" },
  { keys: ["Esc"], label: "Close modal" },
];

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd key={k} className="rounded-lg border border-white/15 bg-white/8 px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[10px] text-zinc-600 text-center">Press ? anywhere to toggle this panel</p>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [request, setRequest] = useState("Push this code to main");
  const [analysis, setAnalysis] = useState<AnalysisResult>(DEFAULT_ANALYSIS);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "denied">("pending");
  const initTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { time: initTime, title: "Request created", desc: "User requested a push to the main branch." },
    { time: initTime, title: "Risk analysis completed", desc: "SentinelAI classified the request as HIGH risk." },
    { time: initTime, title: "Awaiting approval", desc: "Execution paused until the authenticated user approves." },
  ]);
  const [logs, setLogs] = useState<string[]>([
    "SentinelAI initialized.",
    "Security engine active.",
    "Awaiting developer request.",
  ]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ analyzed: 0, approved: 0, blocked: 0, critical: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const historyId = useRef(0);
  const toastId = useRef(0);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keyboard shortcuts modal
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Auto-approve safe (LOW risk) actions
  const [autoApprove, setAutoApprove] = useState(false);

  // Copy recommendation feedback
  const [copiedRec, setCopiedRec] = useState(false);

  // CRITICAL confirm modal
  const [showCriticalConfirm, setShowCriticalConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  // History filter
  const [historyFilter, setHistoryFilter] = useState<"ALL" | RiskLevel>("ALL");

  // Risk sparkline — last 20 risk levels
  const [riskHistory, setRiskHistory] = useState<RiskLevel[]>([]);

  // Session timer — starts on first analysis
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStart === null) return;
    const interval = setInterval(() => {
      setSessionElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Auto-scroll terminal to bottom whenever logs change
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatElapsed = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const statusLabel =
    approvalStatus === "approved"
      ? "Approved & executed"
      : approvalStatus === "denied"
      ? "Denied by user"
      : analysis.risk === "LOW"
      ? "Ready for execution"
      : "Awaiting human approval";

  const reset = useCallback(() => {
    setApprovalStatus("pending");
    setRequest("");
    setAnalysis(DEFAULT_ANALYSIS);
    setTimeline([
      { time: now(), title: "Console reset", desc: "Ready for a new request." },
    ]);
    setLogs(["Console cleared.", "Security engine active.", "Awaiting developer request."]);
  }, []);

  const addToast = useCallback((risk: RiskLevel, message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, risk, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const copyRecommendation = useCallback(() => {
    navigator.clipboard.writeText(analysis.recommendation).then(() => {
      setCopiedRec(true);
      setTimeout(() => setCopiedRec(false), 2000);
    });
  }, [analysis.recommendation]);

  const exportAuditLog = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      stats,
      timeline,
      history: history.map((h) => ({
        request: h.request,
        action: h.result.action,
        risk: h.result.risk,
        category: h.result.category,
        status: h.status,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [stats, timeline, history]);

  // Global keyboard shortcuts — registered after runAnalysis/reset are defined below
  const runAnalysisRef = useRef<() => void>(() => {});
  const resetRef = useRef<() => void>(() => {});
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "?" || e.key === "/") setShowShortcuts((v) => !v);
      if (e.key === "Escape") setShowShortcuts(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runAnalysisRef.current();
      if (e.key === "r" || e.key === "R") resetRef.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!request.trim() || isLoading) return;
    setIsLoading(true);
    setApprovalStatus("pending");
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
      setSessionStart(Date.now());
    }
    setLogs([`Received: "${request}"`, "Running Sentinel classifier...", "Analyzing action patterns..."]);

    await new Promise((r) => setTimeout(r, 380));

    // Local classifier is always the source of truth — instant and reliable
    const result = analyzeAction(request);

    setAnalysis(result);

    const id = ++historyId.current;
    setHistory((prev) => [{ id, request, result, status: "pending" }, ...prev.slice(0, 19)]);
    setStats((prev) => ({
      ...prev,
      analyzed: prev.analyzed + 1,
      critical: result.risk === "CRITICAL" ? prev.critical + 1 : prev.critical,
    }));

    const nextStatus =
      result.risk === "LOW" ? "Ready for execution" : "Awaiting human approval";

    const ts = now();
    setTimeline([
      { time: ts, title: "Request submitted", desc: `"${request}"` },
      {
        time: ts,
        title: "Risk analysis complete",
        desc: `Classified as ${result.risk} risk · Category: ${result.category}`,
      },
      {
        time: ts,
        title: nextStatus,
        desc:
          result.risk === "LOW"
            ? "Action is considered safe to execute."
            : "Execution paused until an authorized user approves.",
      },
    ]);

    setLogs([
      `Received: "${request}"`,
      `Action matched: ${result.action}`,
      `Category: ${result.category}`,
      `Risk level: ${result.risk}`,
      result.risk === "LOW"
        ? "Status: SAFE — ready for execution"
        : "Status: HOLD — awaiting human approval",
    ]);

    setRiskHistory((prev) => [...prev.slice(-19), result.risk]);
    addToast(result.risk, `${result.action} · ${result.category}`);

    // Auto-approve LOW risk if toggle is on
    if (autoApprove && result.risk === "LOW") {
      const ts2 = now();
      setApprovalStatus("approved");
      setStats((prev2) => ({ ...prev2, approved: prev2.approved + 1 }));
      setTimeline((prev2) => [
        ...prev2,
        { time: ts2, title: "Auto-approved", desc: "Action was safe — auto-approved by policy." },
      ]);
      setLogs((prev2) => [
        ...prev2,
        "Auto-approve policy triggered.",
        "Execution complete (LOW risk).",
      ]);
    }

    setIsLoading(false);
  }, [request, isLoading, autoApprove, addToast]);

  const approve = useCallback(() => {
    setApprovalStatus("approved");
    setStats((prev) => ({ ...prev, approved: prev.approved + 1 }));
    setHistory((prev) => prev.map((h, i) => (i === 0 ? { ...h, status: "approved" } : h)));
    const ts = now();
    setTimeline((prev) => [
      ...prev,
      { time: ts, title: "Action approved", desc: "Authenticated user approved the request." },
      { time: ts, title: "Execution simulated", desc: `${analysis.action} completed successfully.` },
    ]);
    setLogs((prev) => [
      ...prev,
      "Approval granted by authenticated user.",
      `Simulating: ${analysis.action}...`,
      "Execution complete.",
    ]);
  }, [analysis.action]);

  const deny = useCallback(() => {
    setApprovalStatus("denied");
    setStats((prev) => ({ ...prev, blocked: prev.blocked + 1 }));
    setHistory((prev) => prev.map((h, i) => (i === 0 ? { ...h, status: "denied" } : h)));
    const ts = now();
    setTimeline((prev) => [
      ...prev,
      { time: ts, title: "Action denied", desc: "Authenticated user denied the request." },
    ]);
    setLogs((prev) => [
      ...prev,
      "Approval denied by authenticated user.",
      "Execution blocked by zero-trust policy.",
    ]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runAnalysis();
      }
    },
    [runAnalysis]
  );

  // Keep shortcut refs in sync
  runAnalysisRef.current = runAnalysis;
  resetRef.current = reset;

  const cfg = RISK_CONFIG[analysis.risk];

  const filteredHistory = historyFilter === "ALL"
    ? history
    : history.filter((h) => h.result.risk === historyFilter);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">

      {/* CRITICAL alert border */}
      <AnimatePresence>
        {analysis.risk === "CRITICAL" && approvalStatus === "pending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
            className="pointer-events-none fixed inset-0 z-[300] rounded-none border-2 border-fuchsia-500/60 shadow-[inset_0_0_60px_rgba(217,70,239,0.1)]"
          />
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>

      {/* CRITICAL confirmation modal */}
      <AnimatePresence>
        {showCriticalConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCriticalConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[340px] rounded-2xl border border-fuchsia-500/30 bg-[#100a10] p-6 shadow-2xl shadow-fuchsia-900/30"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-fuchsia-300">Dangerous Action</h3>
                  <p className="text-[10px] text-zinc-500">CRITICAL risk requires explicit confirmation</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-1 leading-relaxed">
                You are about to approve a <span className="font-bold text-fuchsia-400">CRITICAL risk</span> action:
              </p>
              <p className="text-xs font-mono text-zinc-200 rounded-lg bg-white/5 border border-white/8 px-3 py-2 mb-4 leading-snug">
                {analysis.action}
              </p>
              <p className="text-[11px] text-zinc-500 mb-2">
                Type <span className="font-bold text-white font-mono">APPROVE</span> to confirm
              </p>
              <input
                autoFocus
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && confirmInput === "APPROVE") {
                    setShowCriticalConfirm(false);
                    approve();
                  }
                  if (e.key === "Escape") setShowCriticalConfirm(false);
                }}
                placeholder="Type APPROVE"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm font-mono outline-none placeholder:text-zinc-700 focus:border-fuchsia-500/50 mb-4 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCriticalConfirm(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={confirmInput !== "APPROVE"}
                  onClick={() => { setShowCriticalConfirm(false); approve(); }}
                  className="flex-1 rounded-xl bg-fuchsia-700 hover:bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-900/30"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[150] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`flex items-start gap-3 rounded-2xl border backdrop-blur-xl px-4 py-3 shadow-2xl pointer-events-auto w-72 bg-[#0d0d10]/95 ${RISK_CONFIG[toast.risk].badge}`}
            >
              <Bell className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-wide">{toast.risk} RISK DETECTED</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Risk-adaptive ambient glow */}
        <motion.div
          animate={{
            background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${cfg.glow}, transparent)`,
          }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        {/* Drifting orb — top left */}
        <motion.div
          animate={{ x: [0, 45, -25, 0], y: [0, -35, 20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full blur-[110px]"
          style={{ background: `radial-gradient(circle, ${cfg.orb}, transparent 70%)` }}
        />
        {/* Drifting orb — top right */}
        <motion.div
          animate={{ x: [0, -35, 20, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -top-20 right-[5%] h-[420px] w-[420px] rounded-full bg-violet-700/5 blur-[100px]"
        />
        {/* Drifting orb — bottom center */}
        <motion.div
          animate={{ x: [0, 30, -40, 0], y: [0, -45, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          className="absolute -bottom-32 left-[35%] h-[380px] w-[380px] rounded-full bg-blue-800/5 blur-[90px]"
        />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 224 : 60 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="hidden lg:flex h-screen sticky top-0 flex-col border-r border-white/8 bg-black/50 backdrop-blur-2xl shadow-2xl overflow-hidden z-20 flex-shrink-0"
        >
          {/* Logo */}
          <div className="flex items-center h-14 px-3.5 border-b border-white/8">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-3 w-full group"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(59,130,246,0)",
                    "0 0 12px rgba(59,130,246,0.6)",
                    "0 0 0px rgba(59,130,246,0)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="flex-shrink-0 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2"
              >
                <Shield className="h-4 w-4 text-blue-400" />
              </motion.div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    <p className="text-sm font-semibold leading-none">SentinelAI</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Zero Trust Console</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Policy badge */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mx-2.5 mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 overflow-hidden"
              >
                <p className="text-[10px] text-zinc-500">Policy Status</p>
                <p className="text-xs font-semibold text-emerald-400">Zero Trust Active</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-2 py-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${
                    item.active
                      ? "border border-blue-500/20 bg-blue-600/12 text-blue-300"
                      : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>

          {/* Collapse */}
          <div className="px-2 pb-3 pt-2 border-t border-white/8">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-zinc-600 hover:bg-white/5 hover:text-zinc-300 transition-colors"
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap text-xs"
                  >
                    Collapse sidebar
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* ── Mobile Sidebar Drawer ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#09090b]/95 backdrop-blur-2xl lg:hidden"
              >
                <div className="flex items-center justify-between h-14 px-4 border-b border-white/8">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">SentinelAI</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Zero Trust Console</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mx-3 mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2">
                  <p className="text-[10px] text-zinc-500">Policy Status</p>
                  <p className="text-xs font-semibold text-emerald-400">Zero Trust Active</p>
                </div>
                <nav className="flex-1 space-y-0.5 px-2 py-3">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          item.active
                            ? "border border-blue-500/20 bg-blue-600/12 text-blue-300"
                            : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 px-5 py-7 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-7 flex items-start justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-500 font-medium">Security engine active</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Zero Trust AI Console
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Every developer action is analyzed, classified by risk, and held for human
                approval before execution.
              </p>
            </div>
            </div>
            <div className="flex items-center gap-2">
              {sessionStart !== null && (
                <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-400 tabular-nums font-mono">{formatElapsed(sessionElapsed)}</span>
                </div>
              )}
              <button
                onClick={() => setShowShortcuts(true)}
                title="Keyboard shortcuts (?)"
                className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
              >
                <Keyboard className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* CRITICAL warning banner */}
          <AnimatePresence>
            {analysis.risk === "CRITICAL" && approvalStatus === "pending" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex items-center gap-3 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-2.5">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <AlertTriangle className="h-4 w-4 text-fuchsia-400 flex-shrink-0" />
                  </motion.div>
                  <p className="text-xs font-semibold text-fuchsia-300">
                    CRITICAL RISK DETECTED — This action requires immediate human review before any execution.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          >
            <StatCard icon={Activity} label="Total Analyzed" value={stats.analyzed}
              colorClass="bg-blue-500/10 border border-blue-500/20 text-blue-400"
              hoverShadow="0 8px 30px rgba(59,130,246,0.15)"
              sparkline={
                riskHistory.length >= 2 ? (
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <TrendingUp className={`h-3.5 w-3.5 ${
                      riskHistory[riskHistory.length - 1] === "CRITICAL" || riskHistory[riskHistory.length - 1] === "HIGH"
                        ? "text-red-400" : "text-emerald-400"
                    }`} />
                    <Sparkline risks={riskHistory} />
                  </div>
                ) : undefined
              }
            />
            <StatCard icon={ShieldCheck} label="Approved" value={stats.approved}
              colorClass="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              hoverShadow="0 8px 30px rgba(16,185,129,0.15)"
            />
            <StatCard icon={Ban} label="Blocked" value={stats.blocked}
              colorClass="bg-red-500/10 border border-red-500/20 text-red-400"
              hoverShadow="0 8px 30px rgba(239,68,68,0.15)"
            />
            <StatCard icon={Zap} label="Critical Alerts" value={stats.critical}
              colorClass="bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400"
              hoverShadow="0 8px 30px rgba(217,70,239,0.15)"
            />
          </motion.div>

          {/* History panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="overflow-hidden mb-6"
              >
                <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold">Request History</h3>
                      {stats.analyzed > 0 && (
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {stats.analyzed} analyzed · {Math.round((stats.blocked / stats.analyzed) * 100)}% block rate
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <button
                          onClick={() => { setHistory([]); setHistoryFilter("ALL"); }}
                          className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                          title="Clear history"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Risk distribution bar */}
                  {history.length > 0 && (() => {
                    const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
                    history.forEach((h) => counts[h.result.risk]++);
                    return (
                      <div className="mb-3">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Risk distribution</p>
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full gap-px">
                          {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskLevel[]).map((r) => {
                            const pct = (counts[r] / history.length) * 100;
                            if (pct === 0) return null;
                            return (
                              <motion.div
                                key={r}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                title={`${r}: ${counts[r]}`}
                                className={`h-full rounded-full ${RISK_CONFIG[r].bar}`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1">
                          {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskLevel[]).filter((r) => counts[r] > 0).map((r) => (
                            <span key={r} className={`text-[9px] font-semibold ${RISK_CONFIG[r].icon}`}>
                              {counts[r]} {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Risk filter chips with counts */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((f) => {
                      const count = f === "ALL" ? history.length : history.filter((h) => h.result.risk === f).length;
                      if (f !== "ALL" && count === 0) return null;
                      return (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                            historyFilter === f
                              ? f === "ALL"
                                ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                                : RISK_CONFIG[f as RiskLevel].badge
                              : "border-white/10 bg-white/4 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {f}
                          {count > 0 && (
                            <span className="opacity-70">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {history.length === 0 ? (
                    <p className="text-sm text-zinc-600 text-center py-4">
                      No requests analyzed yet
                    </p>
                  ) : filteredHistory.length === 0 ? (
                    <p className="text-sm text-zinc-600 text-center py-4">
                      No {historyFilter} risk requests
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredHistory.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { setRequest(item.request); setShowHistory(false); }}
                          className="w-full flex items-center gap-3 rounded-xl border border-white/6 bg-black/30 px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors group"
                        >
                          <HistoryBadge risk={item.result.risk} />
                          <span className="flex-1 truncate text-sm text-zinc-300 group-hover:text-white transition-colors">
                            {item.request}
                          </span>
                          <span
                            className={`text-xs font-medium flex-shrink-0 ${
                              item.status === "approved"
                                ? "text-emerald-400"
                                : item.status === "denied"
                                ? "text-red-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {item.status === "pending" ? "—" : item.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top 3 cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Request Console */}
            <motion.section
              custom={0}
              initial="hidden"
              animate="visible"
              variants={CARD}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
                  <TerminalSquare className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Request Console</h2>
                  <p className="text-[11px] text-zinc-500">Submit a developer action to analyze</p>
                </div>
              </div>

              <textarea
                maxLength={500}
                className="w-full h-32 rounded-xl border border-white/8 bg-black/50 p-3.5 text-sm text-zinc-100 outline-none resize-none transition-colors placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-black/70"
                placeholder="e.g. git push origin main"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="flex justify-end mt-1 mb-0.5">
                <span className={`text-[10px] tabular-nums ${request.length > 200 ? "text-amber-400" : "text-zinc-700"}`}>
                  {request.length}/500
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis}
                disabled={isLoading || request.trim().length === 0}
                className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze Request"
                )}
              </motion.button>

              <p className="mt-2 text-center text-[10px] text-zinc-600">
                ⌘ + Enter to analyze
              </p>

              <div className="mt-4 space-y-2.5">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Quick examples</p>
                {EXAMPLE_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${RISK_CONFIG[group.risk].bar}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${RISK_CONFIG[group.risk].icon}`}>
                        {group.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map((ex) => (
                        <button
                          key={ex}
                          onClick={() => setRequest(ex)}
                          className="rounded-lg border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-white/8 hover:text-zinc-200 transition-colors font-mono"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Action Analysis */}
            <motion.section
              custom={1}
              initial="hidden"
              animate="visible"
              variants={CARD}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5 shadow-xl"
            >
              {/* Header row: icon+title on left, gauge on right */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <h2 className="text-sm font-semibold">Action Analysis</h2>
                  </div>
                  <motion.span
                    key={analysis.risk}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest ${cfg.badge}`}
                  >
                    {analysis.risk} RISK
                  </motion.span>
                  <div className="mt-3 space-y-1.5">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Action</p>
                      <p className="text-xs font-medium text-zinc-200 leading-snug mt-0.5">{analysis.action}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      <p className="text-[11px] text-zinc-400">{analysis.category}</p>
                    </div>
                  </div>
                </div>
                <CircularGauge risk={analysis.risk} />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Why it&apos;s risky</p>
                  <ul className="space-y-1.5">
                    {analysis.reason.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
                        <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.bar}`} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Safer recommendation</p>
                    <button
                      onClick={copyRecommendation}
                      className="text-zinc-600 hover:text-blue-400 transition-colors"
                      title="Copy recommendation"
                    >
                      {copiedRec ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-300 leading-relaxed">{analysis.recommendation}</p>
                </div>
              </div>
            </motion.section>

            {/* Approval Control */}
            <motion.section
              custom={2}
              initial="hidden"
              animate="visible"
              variants={CARD}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Approval Control</h2>
                  <p className="text-[11px] text-zinc-500">Human-in-the-loop gate</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-black/40 p-4 mb-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Pending Request</p>
                <p className="text-sm font-medium text-zinc-100 mb-3 leading-snug line-clamp-2">
                  {request || "No request entered"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        approvalStatus === "approved"
                          ? "bg-emerald-400"
                          : approvalStatus === "denied"
                          ? "bg-red-400"
                          : analysis.risk === "LOW"
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-amber-400 animate-pulse"
                      }`}
                    />
                    <p className="text-xs text-zinc-400">{statusLabel}</p>
                  </div>
                  <motion.span
                    key={analysis.risk}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                  >
                    {analysis.risk}
                  </motion.span>
                </div>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    if (analysis.risk === "CRITICAL") {
                      setConfirmInput("");
                      setShowCriticalConfirm(true);
                    } else {
                      approve();
                    }
                  }}
                  disabled={approvalStatus !== "pending"}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${cfg.button}`}
                >
                  Approve & Execute
                </motion.button>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={deny}
                    disabled={approvalStatus !== "pending"}
                    className="flex-1 rounded-xl bg-zinc-800/80 border border-white/8 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-700/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Deny
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={reset}
                    disabled={approvalStatus === "pending" && !request.trim()}
                    className="rounded-xl bg-zinc-900 border border-white/8 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Clear and reset"
                  >
                    ↺
                  </motion.button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/6">
                <p className="text-[10px] text-zinc-600 mb-3 uppercase tracking-wider">
                  Zero-trust policies active
                </p>
                {[
                  "Human approval required for HIGH+ risk",
                  "All actions logged to audit trail",
                  "Execution blocked until explicit approval",
                ].map((policy) => (
                  <div key={policy} className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                    <p className="text-[11px] text-zinc-500">{policy}</p>
                  </div>
                ))}
                {/* Auto-approve toggle */}
                <button
                  onClick={() => setAutoApprove((v) => !v)}
                  className="mt-3 w-full flex items-center justify-between rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ToggleRight className={`h-4 w-4 ${autoApprove ? "text-emerald-400" : "text-zinc-600"}`} />
                    <span className="text-[11px] text-zinc-400">Auto-approve LOW risk</span>
                  </div>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                    autoApprove
                      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                      : "text-zinc-600 border-white/10 bg-white/4"
                  }`}>
                    {autoApprove ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </motion.section>
          </div>

          {/* Bottom 2 cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
            {/* Security Timeline */}
            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={CARD}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Security Timeline</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 border border-white/8 rounded-full px-2.5 py-1">
                    Live audit trail
                  </span>
                  <button
                    onClick={exportAuditLog}
                    disabled={history.length === 0}
                    title="Export audit log as JSON"
                    className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {timeline.map((item, i) => {
                  const isApproved = /approved/i.test(item.title);
                  const isDenied = /denied/i.test(item.title);
                  const isComplete = /execution/i.test(item.title);
                  const dotClass = isApproved || isComplete
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : isDenied
                    ? "border-red-500/40 bg-red-500/15"
                    : i === 0
                    ? "border-blue-500/40 bg-blue-500/15"
                    : "border-white/10 bg-zinc-800/80";
                  const iconClass = isApproved || isComplete
                    ? "text-emerald-400"
                    : isDenied
                    ? "text-red-400"
                    : i === 0
                    ? "text-blue-400"
                    : "text-zinc-400";
                  return (
                    <motion.div
                      key={`${item.title}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full border p-1.5 ${dotClass}`}>
                          <Clock3 className={`h-3 w-3 ${iconClass}`} />
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="w-px flex-1 bg-white/6 mt-1.5 mb-0.5" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-medium text-zinc-200">
                          {item.time} — {item.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Execution Console */}
            <motion.section
              custom={4}
              initial="hidden"
              animate="visible"
              variants={CARD}
              className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Execution Console</h2>
                <div className="flex items-center gap-2">
                  <CopyLogsButton logs={logs} />
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-500">Live</span>
                  </div>
                </div>
              </div>
              {/* Terminal window */}
              <div className="rounded-xl border border-white/8 bg-[#0d0d0f] overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/6 bg-white/3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[10px] text-zinc-600 font-mono">sentinel ~ bash</span>
                </div>
                {/* Log output */}
                <div ref={consoleRef} className="p-4 min-h-[200px] max-h-[260px] font-mono text-xs space-y-1.5 overflow-auto">
                  {logs.map((log, i) => (
                    <motion.p
                      key={`${log}-${i}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`leading-relaxed ${logColor(log)}`}
                    >
                      <span className="text-zinc-700 select-none mr-1.5">❯</span>
                      {log}
                    </motion.p>
                  ))}
                  <span className="inline-flex items-center gap-1">
                    <span className="text-zinc-700 select-none">❯</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                      className="inline-block h-[13px] w-[7px] bg-emerald-500/70 rounded-[2px]"
                    />
                  </span>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}
