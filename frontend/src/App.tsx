import { useState } from 'react'
import { Car, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import SearchForm, { SearchParams } from './components/SearchForm'

type Listing = Record<string, any>
type Result = { listings: Listing[]; total: number; url: string; error: string | null }

const API = import.meta.env.VITE_API_URL ?? ''

function buildExcel(listings: Listing[]) {
  const rows = listings.map(c => ({
    Year:            c.year,
    Make:            c.make,
    Model:           c.model,
    Trim:            c.trim,
    Title:           c.title,
    Condition:       c.condition,
    Price:           c.price,
    Deal:            c.deal_badge,
    Mileage:         c.mileage,
    Body:            c.body,
    Fuel:            c.fuel,
    Transmission:    c.transmission,
    Drivetrain:      c.drivetrain,
    MPG:             c.mpg,
    Engine:          c.engine,
    VIN:             c.vin,
    Carfax:          c.vin ? `https://www.carfax.com/vehicle/${c.vin}` : '',
    Days_On_Market:  c.days_on_market,
    Listing_URL:     c.url,
    Dealer:          c.dealer,
    Dealer_City:     c.dealer_city,
    Dealer_Phone:    c.dealer_phone,
    Dealer_Rating:   c.dealer_rating,
    Dealer_Reviews:  c.dealer_reviews,
    Distance:        c.distance,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0]).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] ?? '').length)) + 2,
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Car Listings')
  XLSX.writeFile(wb, 'cars.xlsx')
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [summary, setSummary] = useState<{ count: number; make: string; model: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [lastResult, setLastResult] = useState<Result | null>(null)

  async function handleSearch(params: SearchParams) {
    setStatus('loading')
    setSummary(null)
    setErrorMsg('')
    try {
      const q = new URLSearchParams({ ...params, page: '1' } as Record<string, string>)
      const res = await fetch(`${API}/api/search?${q}`)
      const data: Result = await res.json()

      if (data.error) {
        setErrorMsg(data.error)
        setStatus('error')
        return
      }

      setLastResult(data)
      buildExcel(data.listings)
      setSummary({ count: data.listings.length, make: params.make, model: params.model })
      setStatus('done')
    } catch (e) {
      setErrorMsg('Network error — is the backend running?')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl"><Car className="w-5 h-5 text-white" /></div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Cars.com Scraper</h1>
          <p className="text-xs text-slate-500">Search → instant Excel download</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <SearchForm onSearch={handleSearch} loading={status === 'loading'} />

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl px-6 py-5">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
            <div>
              <p className="font-medium text-white">Scraping Cars.com via Apify…</p>
              <p className="text-sm text-slate-400 mt-0.5">Usually takes 20–40 seconds</p>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'done' && summary && (
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl px-6 py-5 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-white">
                  {summary.count} listings downloaded
                  {summary.make ? ` · ${summary.make}${summary.model ? ' ' + summary.model : ''}` : ''}
                </p>
                <p className="text-sm text-emerald-400 mt-0.5">cars.xlsx saved to your Downloads</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => lastResult && buildExcel(lastResult.listings)}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                <FileSpreadsheet className="w-4 h-4" /> Re-download Excel
              </button>
              {lastResult?.url && (
                <a href={lastResult.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors">
                  View on Cars.com ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-center gap-3 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl px-6 py-5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Idle hint */}
        {status === 'idle' && (
          <p className="text-center text-slate-600 text-sm pt-4">
            Set your filters and hit Search — Excel downloads automatically
          </p>
        )}
      </main>
    </div>
  )
}
