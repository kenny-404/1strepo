import { useEffect, useState } from 'react'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 200
  const h = 60
  const step = w / (data.length - 1)

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * step} cy={h - ((data[data.length - 1] - min) / range) * (h - 8) - 4}
        r="3" fill={color} />
    </svg>
  )
}

const series = [
  { label: 'CPU', unit: '%', color: '#a78bfa', base: 35 },
  { label: 'Memory', unit: '%', color: '#34d399', base: 55 },
  { label: 'Network', unit: 'MB/s', color: '#38bdf8', base: 12 },
]

function useRollingData(base: number, length = 20) {
  const [data, setData] = useState(() =>
    Array.from({ length }, () => base + (Math.random() - 0.5) * 20)
  )
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => [...prev.slice(1), Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 20))])
    }, 1000)
    return () => clearInterval(id)
  }, [base])
  return data
}

function Chart({ s }: { s: typeof series[0] }) {
  const data = useRollingData(s.base)
  const current = data[data.length - 1]
  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs uppercase tracking-widest text-slate-400">{s.label}</span>
        <span className="font-mono font-bold text-sm" style={{ color: s.color }}>
          {current.toFixed(1)}{s.unit}
        </span>
      </div>
      <Sparkline data={data} color={s.color} />
    </div>
  )
}

export default function MiniChart() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {series.map(s => <Chart key={s.label} s={s} />)}
    </div>
  )
}
