import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react'

type Weather = {
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy'
  humidity: number
  wind: number
  city: string
}

const cities: Weather[] = [
  { city: 'New York', temp: 22, condition: 'sunny', humidity: 58, wind: 14 },
  { city: 'London', temp: 13, condition: 'cloudy', humidity: 75, wind: 22 },
  { city: 'Tokyo', temp: 27, condition: 'rainy', humidity: 82, wind: 10 },
  { city: 'Sydney', temp: 19, condition: 'windy', humidity: 65, wind: 35 },
  { city: 'Paris', temp: 16, condition: 'cloudy', humidity: 70, wind: 18 },
]

const icons = {
  sunny: <Sun className="w-10 h-10 text-yellow-400" />,
  cloudy: <Cloud className="w-10 h-10 text-slate-400" />,
  rainy: <CloudRain className="w-10 h-10 text-blue-400" />,
  windy: <Wind className="w-10 h-10 text-teal-400" />,
}

export default function WeatherCard() {
  const [idx, setIdx] = useState(0)
  const weather = cities[idx]

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % cities.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Weather</p>
          <h3 className="text-xl font-semibold">{weather.city}</h3>
        </div>
        {icons[weather.condition]}
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-bold">{weather.temp}°</span>
        <span className="text-slate-400 mb-1 capitalize">{weather.condition}</span>
      </div>
      <div className="flex gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1"><Thermometer className="w-4 h-4" /> {weather.humidity}% humidity</span>
        <span className="flex items-center gap-1"><Wind className="w-4 h-4" /> {weather.wind} km/h</span>
      </div>
      <div className="flex gap-1 mt-4">
        {cities.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-600'}`} />
        ))}
      </div>
    </div>
  )
}
