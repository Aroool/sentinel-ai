"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const riskStyles = {
  LOW: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  HIGH: "border-red-500/40 bg-red-500/10 text-red-400",
  CRITICAL: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400",
};

const riskButtonStyles = {
  LOW: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
  MEDIUM: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20",
  HIGH: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  CRITICAL: "bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-600/20",
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Requests", icon: FileWarning, active: false },
  { label: "Audit Log", icon: ScrollText, active: false },
  { label: "Policy Engine", icon: Lock, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [request, setRequest] = useState("Push this code to main");
  const [analysis, setAnalysis] = useState({
    action: "GitHub Push",
    risk: "HIGH",
    reason: [
      "Direct push to main branch",
      "Could bypass code review workflow",
      "May affect production stability",
    ],
    recommendation: "Create a pull request instead",
  });
  const [status, setStatus] = useState("Awaiting human approval");
  const [timeline, setTimeline] = useState([
    { time: "Now", title: "Request created", desc: "User requested a push to the main branch." },
    { time: "Now", title: "Risk analysis completed", desc: "SentinelAI classified the request as HIGH risk." },
    { time: "Now", title: "Awaiting approval", desc: "Execution paused until the authenticated user approves." },
  ]);
  const [logs, setLogs] = useState([
    "SentinelAI initialized.",
    "Security engine active.",
    "Awaiting developer request.",
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const target = useMemo(() => {
    const lower = request.toLowerCase();
    if (lower.includes("main")) return "Repo: sentinel-ai / Branch: main";
    if (lower.includes("pytest") || lower.includes("test")) return "Command: pytest";
    if (lower.includes("delete")) return "Target: production.env";
    if (lower.includes("deploy") && lower.includes("production")) return "Environment: production";
    return "Target: manual review required";
  }, [request]);

  const analyzeRequest = async () => {
    try {
      setIsLoading(true);
      setLogs(["Request received.", "Calling backend /analyze ...", `Analyzing input: "${request}"`]);
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: request }),
      });
      if (!response.ok) throw new Error("Failed to analyze request");
      const result = await response.json();
      setAnalysis(result);
      const nextStatus = result.risk === "LOW" ? "Ready for execution" : "Awaiting human approval";
      setStatus(nextStatus);
      setTimeline([
        { time: "Now", title: "Request created", desc: `User submitted: "${request}"` },
        { time: "Now", title: "Risk analysis completed", desc: `SentinelAI classified the request as ${result.risk} risk.` },
        { time: "Now", title: nextStatus, desc: result.risk === "LOW" ? "This request is considered safe to execute." : "Execution paused until approval." },
      ]);
      setLogs([
        "Request received.",
        "Calling backend /analyze ...",
        `Risk classified as ${result.risk}.`,
        result.risk === "LOW" ? "Request marked safe for execution." : "Awaiting human approval.",
      ]);
    } catch (error) {
      setStatus("Analysis failed");
      setLogs(["Request received.", "Calling backend /analyze ...", "Backend request failed.", "Manual review required."]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveAction = () => {
    setStatus("Approved and executed");
    setTimeline((prev) => [
      ...prev,
      { time: "Now", title: "Action approved", desc: "Authenticated user approved the request." },
      { time: "Now", title: "Execution completed", desc: `${analysis.action} was simulated successfully.` },
    ]);
    setLogs((prev) => [
      ...prev,
      "Approval granted by authenticated user.",
      `Simulating execution for ${analysis.action}...`,
      "Execution completed successfully.",
    ]);
  };

  const denyAction = () => {
    setStatus("Denied by user");
    setTimeline((prev) => [
      ...prev,
      { time: "Now", title: "Action denied", desc: "Authenticated user denied the request." },
    ]);
    setLogs((prev) => [
      ...prev,
      "Approval denied by authenticated user.",
      "Execution blocked by zero-trust policy.",
    ]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom,rgba(239,68,68,0.10),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative flex min-h-screen">

        {/* ── Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 240 : 64 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden lg:flex h-screen sticky top-0 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden z-10 flex-shrink-0"
        >
          {/* Logo / Toggle */}
          <div className="flex items-center h-16 px-4 border-b border-white/10">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-3 w-full group"
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0px #3b82f6", "0 0 14px #3b82f6", "0 0 0px #3b82f6"] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="flex-shrink-0 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2"
              >
                <Shield className="h-5 w-5 text-blue-400" />
              </motion.div>

              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-sm font-semibold leading-tight">SentinelAI</span>
                    <span className="text-xs text-zinc-400">Zero Trust Console</span>
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
                transition={{ duration: 0.25 }}
                className="mx-3 mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 overflow-hidden"
              >
                <p className="text-xs text-zinc-400">Policy Status</p>
                <p className="text-sm font-medium text-emerald-400 whitespace-nowrap">Zero Trust Enabled</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav items */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                    item.active
                      ? "border border-blue-500/20 bg-blue-600/15 text-blue-300"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
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

          {/* Collapse toggle at bottom */}
          <div className="px-2 pb-4 border-t border-white/10 pt-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-500 hover:bg-white/5 hover:text-white transition"
            >
              <motion.div
                animate={{ rotate: sidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    Collapse
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.aside>

        {/* ── Main Content ── */}
        <div className="flex-1 px-6 py-8 min-w-0">

          {/* Header — no duplicate logo */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-3">
              Zero Trust AI Developer Architect
            </h1>
            <p className="max-w-2xl text-zinc-400 text-base md:text-lg">
              Analyze developer actions, explain security risk, and require human
              approval before sensitive execution.
            </p>
          </motion.div>

          {/* Top 3 cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Request Console */}
            <motion.section
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20">
                  <TerminalSquare className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Request Console</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Ask SentinelAI to inspect or execute a developer action.
              </p>
              <label className="text-sm text-zinc-500 block mb-2">Developer Request</label>
              <textarea
                className="w-full h-36 rounded-2xl border border-white/10 bg-black/60 p-4 text-sm outline-none transition focus:border-blue-500/50"
                placeholder="Example: Push this code to main"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={analyzeRequest}
                disabled={isLoading}
                className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Analyzing..." : "Analyze Request"}
              </motion.button>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Push this code to main", "Run pytest", "Delete production.env", "Deploy to production"].map((example) => (
                  <button
                    key={example}
                    onClick={() => setRequest(example)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-white/10"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Action Analysis */}
            <motion.section
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-500/10 p-2 border border-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Action Analysis</h2>
                </div>
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyles[analysis.risk]}`}
                >
                  {analysis.risk} RISK
                </motion.span>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Action</p>
                  <p className="font-medium">{analysis.action}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Target</p>
                  <p className="font-medium">{target}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Why it is risky</p>
                  <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                    {analysis.reason.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-zinc-500 mb-1">Safer recommendation</p>
                  <p className="text-blue-400 font-medium">{analysis.recommendation}</p>
                </div>
              </div>
            </motion.section>

            {/* Approval Control */}
            <motion.section
              custom={2}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold">Approval Control</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-6">
                Sensitive actions require explicit user approval before execution.
              </p>
              <div className="rounded-2xl border border-white/10 bg-black/50 p-4 mb-6">
                <p className="text-sm text-zinc-500 mb-2">Pending Request</p>
                <p className="font-medium mb-2">{request || "No request entered"}</p>
                <p className="text-sm text-zinc-400">Status: {status}</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={approveAction}
                  className={`flex-1 rounded-2xl px-4 py-3 font-medium transition shadow-lg ${riskButtonStyles[analysis.risk]}`}
                >
                  Approve
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={denyAction}
                  className="flex-1 rounded-2xl bg-zinc-800 px-4 py-3 font-medium hover:bg-zinc-700 transition"
                >
                  Deny
                </motion.button>
              </div>
            </motion.section>
          </div>

          {/* Bottom 2 cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

            {/* Security Timeline */}
            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold">Security Timeline</h2>
                <span className="text-xs text-zinc-500">Live audit trail</span>
              </div>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <motion.div
                    key={`${item.title}-${index}`}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="rounded-2xl border border-white/10 bg-black/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-zinc-800 p-2 border border-white/10">
                        <Clock3 className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div>
                        <p className="font-medium">{item.time} — {item.title}</p>
                        <p className="text-sm text-zinc-400">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Execution Console */}
            <motion.section
              custom={4}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold">Execution Console</h2>
                <span className="text-xs text-zinc-500">Live system output</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/70 p-4 min-h-[280px] font-mono text-sm text-emerald-400 space-y-2 overflow-auto">
                {logs.map((log, index) => (
                  <p key={`${log}-${index}`}>&gt; {log}</p>
                ))}
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </main>
  );
}