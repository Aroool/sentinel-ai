"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  TerminalSquare,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { analyzeAction } from "../lib/analyzeAction";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type AnalysisResult = {
  action: string;
  risk: RiskLevel;
  reason: string[];
  recommendation: string;
};

const riskStyles: Record<RiskLevel, string> = {
  LOW: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  HIGH: "border-red-500/40 bg-red-500/10 text-red-400",
  CRITICAL: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400",
};

const riskButtonStyles: Record<RiskLevel, string> = {
  LOW: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
  MEDIUM: "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20",
  HIGH: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  CRITICAL: "bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-600/20",
};

export default function Home() {
  const [request, setRequest] = useState("Push this code to main");
  const [analysis, setAnalysis] = useState<AnalysisResult>(
    analyzeAction("Push this code to main") as AnalysisResult
  );
  const [status, setStatus] = useState("Awaiting human approval");
  const [timeline, setTimeline] = useState([
    {
      time: "Now",
      title: "Request created",
      desc: "User requested a push to the main branch.",
    },
    {
      time: "Now",
      title: "Risk analysis completed",
      desc: "SentinelAI classified the request as HIGH risk.",
    },
    {
      time: "Now",
      title: "Awaiting approval",
      desc: "Execution paused until the authenticated user approves.",
    },
  ]);

  const target = useMemo(() => {
    const lower = request.toLowerCase();

    if (lower.includes("main")) {
      return "Repo: sentinel-ai / Branch: main";
    }
    if (lower.includes("pytest") || lower.includes("test")) {
      return "Command: pytest";
    }
    if (lower.includes("delete")) {
      return "Target: production.env";
    }
    return "Target: manual review required";
  }, [request]);

  const analyzeRequest = () => {
    const result = analyzeAction(request) as AnalysisResult;
    setAnalysis(result);

    const nextStatus =
      result.risk === "LOW" ? "Ready for execution" : "Awaiting human approval";

    setStatus(nextStatus);

    setTimeline([
      {
        time: "Now",
        title: "Request created",
        desc: `User submitted: "${request}"`,
      },
      {
        time: "Now",
        title: "Risk analysis completed",
        desc: `SentinelAI classified the request as ${result.risk} risk.`,
      },
      {
        time: "Now",
        title: nextStatus,
        desc:
          result.risk === "LOW"
            ? "This request is considered safe to execute."
            : "Execution paused until the authenticated user approves.",
      },
    ]);
  };

  const approveAction = () => {
    setStatus("Approved and executed");

    setTimeline((prev) => [
      ...prev,
      {
        time: "Now",
        title: "Action approved",
        desc: "Authenticated user approved the request.",
      },
      {
        time: "Now",
        title: "Execution completed",
        desc: `${analysis.action} was simulated successfully.`,
      },
    ]);
  };

  const denyAction = () => {
    setStatus("Denied by user");

    setTimeline((prev) => [
      ...prev,
      {
        time: "Now",
        title: "Action denied",
        desc: "Authenticated user denied the request.",
      },
    ]);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom,rgba(239,68,68,0.10),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px #3b82f6",
                  "0 0 18px #3b82f6",
                  "0 0 0px #3b82f6",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="rounded-full border border-blue-500/40 bg-blue-500/10 p-2"
            >
              <Shield className="h-5 w-5 text-blue-400" />
            </motion.div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
                SentinelAI
              </p>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Security Engine Active
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            Zero Trust AI Developer Architect
          </h1>

          <p className="max-w-2xl text-zinc-400 text-base md:text-lg">
            Analyze developer actions, explain security risk, and require human
            approval before sensitive execution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <label className="text-sm text-zinc-500 block mb-2">
              Developer Request
            </label>

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
              className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              Analyze Request
            </motion.button>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Push this code to main",
                "Run pytest",
                "Delete production.env",
                "Deploy to production",
              ].map((example) => (
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
                <p className="text-blue-400 font-medium">
                  {analysis.recommendation}
                </p>
              </div>
            </div>
          </motion.section>

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

        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
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
                    <p className="font-medium">
                      {item.time} — {item.title}
                    </p>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}