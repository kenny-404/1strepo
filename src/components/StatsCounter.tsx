import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Users, Globe, Zap } from 'lucide-react'

type Stat = { label: string; value: number; suffix: string; icon: React.ReactNode; color: string }

const stats: Stat[] = [
  { label: 'Active Users', value: 142853, suffix: '', icon: <Users className="w-5 h-5" />, color: 'text-violet-400' },
  { label: 'Requests / sec', value: 8741, suffix: '', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-400' },
  { label: 'Countries', value: 94, suffix: '', icon: <Globe className="w-5 h-5" />, color: 'text-emerald-400' },
  { label: 'Uptime', value: 99.97, suffix: '%', icon: <TrendingUp className="w-5 h-5" />, color: 'text-cyan-400' },
]

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(target % 1 !== 0 ? 2 : 0)))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

function StatItem({ stat }: { stat: Stat }) {
  const count = useCountUp(stat.value)
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700 flex flex-col gap-3">
      <div className={`flex items-center gap-2 ${stat.color}`}>
        {stat.icon}
        <span className="text-xs uppercase tracking-widest text-slate-400">{stat.label}</span>
      </div>
      <p className={`text-3xl font-bold font-mono tabular-nums ${stat.color}`}>
        {count.toLocaleString()}{stat.suffix}
      </p>
    </div>
  )
}

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(s => <StatItem key={s.label} stat={s} />)}
    </div>
  )
}
