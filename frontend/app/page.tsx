export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">
        SentinelAI
      </h1>

      <p className="text-lg text-gray-400 mb-8">
        Zero Trust AI Developer Architect
      </p>

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 w-[500px]">
        <p className="text-sm text-gray-400 mb-2">Ask SentinelAI</p>

        <input
          className="w-full p-3 rounded-lg bg-black border border-zinc-700"
          placeholder="Example: Push this code to main"
        />

        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg">
          Analyze Request
        </button>
      </div>
    </main>
  );
}