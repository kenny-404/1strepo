import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react'

type Event = { id: number; type: 'success' | 'warning' | 'info'; message: string; time: Date }

const templates = [
  { type: 'success' as const, messages: ['Deployment completed in 43s', 'Health check passed', 'Auto-scaled to 4 instances', 'SSL certificate renewed'] },
  { type: 'warning' as const, messages: ['Memory usage at 78%', 'Response time spike detected', 'Cache miss rate high', 'Slow query detected (1.2s)'] },
  { type: 'info' as const, messages: ['New connection from 203.0.113.5', 'Config reload triggered', 'Backup snapshot started', 'CDN cache purged'] },
]

function randomEvent(id: number): Event {
  const group = templates[Math.floor(Math.random() * templates.length)]
  return {
    id,
    type: group.type,
    message: group.messages[Math.floor(Math.random() * group.messages.length)],
    time: new Date(),
  }
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />,
}

const colors = {
  success: 'border-emerald-800/50',
  warning: 'border-yellow-800/50',
  info: 'border-blue-800/50',
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<Event[]>(() =>
    Array.from({ length: 5 }, (_, i) => randomEvent(i))
  )
  const [counter, setCounter] = useState(5)

  useEffect(() => {
    const id = setInterval(() => {
      setCounter(c => {
        const next = c + 1
        setEvents(prev => [randomEvent(next), ...prev.slice(0, 7)])
        return next
      })
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400">Live Activity</h3>
        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="space-y-2 max-h-64 overflow-hidden">
        {events.map((e, i) => (
          <div key={e.id}
            className={`flex gap-2 text-sm p-2 rounded-lg border bg-slate-900/40 ${colors[e.type]} transition-all duration-500`}
            style={{ opacity: 1 - i * 0.1 }}>
            {icons[e.type]}
            <span className="flex-1 text-slate-200">{e.message}</span>
            <span className="text-slate-500 font-mono text-xs">{fmt(e.time)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
