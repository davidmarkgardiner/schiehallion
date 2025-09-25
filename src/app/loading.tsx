export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-slate-300">Loading...</div>
      </div>
    </main>
  )
}