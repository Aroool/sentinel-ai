export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-8 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-3">
            SentinelAI
          </p>
          <h1 className="text-5xl font-bold mb-3">
            Zero Trust AI Developer Architect
          </h1>
          <p className="text-zinc-400 max-w-2xl">
            Analyze developer actions, score security risk, and require human
            approval before execution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Request Console</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Ask SentinelAI to review or execute a developer action.
            </p>

            <label className="text-sm text-zinc-500 block mb-2">
              Developer Request
            </label>
            <textarea
              className="w-full h-36 rounded-xl border border-zinc-800 bg-black p-4 text-sm outline-none"
              placeholder="Example: Push this code to main"
            />

            <button className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium hover:bg-blue-700 transition">
              Analyze Request
            </button>
          </section>

          <section className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Action Analysis</h2>
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                HIGH RISK
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500 mb-1">Action</p>
                <p className="font-medium">GitHub Push</p>
              </div>

              <div>
                <p className="text-zinc-500 mb-1">Target</p>
                <p className="font-medium">Repo: sentinel-ai / Branch: main</p>
              </div>

              <div>
                <p className="text-zinc-500 mb-1">Why it is risky</p>
                <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                  <li>Direct push to the main branch</li>
                  <li>Could bypass code review workflow</li>
                  <li>May affect production stability</li>
                </ul>
              </div>

              <div>
                <p className="text-zinc-500 mb-1">Safer recommendation</p>
                <p className="text-blue-400 font-medium">
                  Create a pull request instead
                </p>
              </div>
            </div>
          </section>

          <section className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Approval Control</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Sensitive actions require explicit user approval before execution.
            </p>

            <div className="rounded-xl border border-zinc-800 bg-black p-4 mb-6">
              <p className="text-sm text-zinc-500 mb-2">Pending Request</p>
              <p className="font-medium mb-2">Push code to main branch</p>
              <p className="text-sm text-zinc-400">
                Status: Awaiting human approval
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium hover:bg-emerald-700 transition">
                Approve
              </button>
              <button className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 font-medium hover:bg-zinc-700 transition">
                Deny
              </button>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Security Timeline</h2>
            <span className="text-xs text-zinc-500">Live audit trail</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="font-medium">9:42 PM — Request created</p>
              <p className="text-sm text-zinc-400">
                User requested a push to the main branch.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="font-medium">9:42 PM — Risk analysis completed</p>
              <p className="text-sm text-zinc-400">
                SentinelAI classified the request as HIGH risk.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-black p-4">
              <p className="font-medium">9:43 PM — Awaiting approval</p>
              <p className="text-sm text-zinc-400">
                Execution paused until the authenticated user approves.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}