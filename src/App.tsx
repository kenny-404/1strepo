import Clock from './components/Clock'
import WeatherCard from './components/WeatherCard'
import StatsCounter from './components/StatsCounter'
import ActivityFeed from './components/ActivityFeed'
import MiniChart from './components/MiniChart'
import { Layers } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-lg tracking-tight">DynaDash</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </header>

      {/* Hero clock */}
      <section className="py-10 px-6 text-center border-b border-slate-800">
        <Clock />
      </section>

      {/* Main grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <WeatherCard />
          <MiniChart />
        </div>

        {/* Center + right */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <StatsCounter />
          <ActivityFeed />
        </div>
      </main>

      <footer className="text-center text-slate-600 text-xs pb-6">
        Built with React + Vite · Deployed on Render
      </footer>
    </div>
  )
}
