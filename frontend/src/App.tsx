import { useState } from 'react'
import { Car, Download, FileSpreadsheet, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import SearchForm, { SearchParams } from './components/SearchForm'
import CarCard, { Listing } from './components/CarCard'

type Result = { listings: Listing[]; total: number; url: string; error: string | null }

const API = import.meta.env.VITE_API_URL ?? ''

export default function App() {
  const [results, setResults] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [lastParams, setLastParams] = useState<SearchParams | null>(null)

  async function fetchResults(params: SearchParams, p = 1) {
    setLoading(true)
    try {
      const q = new URLSearchParams({ ...params, page: String(p) } as Record<string, string>)
      const res = await fetch(`${API}/api/search?${q}`)
      const data: Result = await res.json()
      setResults(data)
      setPage(p)
    } catch {
      setResults({ listings: [], total: 0, url: '', error: 'Network error — is the backend running?' })
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(params: SearchParams) {
    setLastParams(params)
    fetchResults(params, 1)
  }

  function exportCSV() {
    if (!results?.listings.length) return
    const headers = ['Title', 'Price', 'Mileage', 'Dealer', 'Distance', 'Rating', 'URL']
    const rows = results.listings.map(c =>
      [c.title, c.price, c.mileage, c.dealer, c.distance, c.rating, c.url]
        .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'cars.csv'
    a.click()
  }

  function exportExcel() {
    if (!results?.listings.length) return
    const rows = results.listings.map(c => ({
      Title: c.title,
      Price: c.price,
      Mileage: c.mileage,
      Dealer: c.dealer,
      Distance: c.distance,
      Rating: c.rating,
      URL: c.url,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)

    // Auto-size columns
    const colWidths = Object.keys(rows[0]).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] ?? '').length)) + 2,
    }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Car Listings')
    XLSX.writeFile(wb, 'cars.xlsx')
  }

  const hasResults = !!results?.listings.length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl"><Car className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cars.com Scraper</h1>
            <p className="text-xs text-slate-500">Search & export car listings</p>
          </div>
        </div>
        {hasResults && (
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={exportExcel}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Error */}
        {results?.error && (
          <div className="flex items-center gap-3 bg-red-950 border border-red-800 text-red-300 rounded-xl px-5 py-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{results.error}</span>
          </div>
        )}

        {/* Results */}
        {results && !results.error && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {results.total > 0
                  ? <><span className="text-white font-semibold">{results.total.toLocaleString()}</span> listings found</>
                  : 'No listings found — try adjusting filters'}
              </p>
              {results.url && (
                <a href={results.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-2">
                  View on Cars.com ↗
                </a>
              )}
            </div>

            {hasResults && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.listings.map((car, i) => <CarCard key={i} car={car} />)}
                </div>

                {/* Export bar below results */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-4 border-t border-slate-800">
                  <p className="text-sm text-slate-400">Download {results.listings.length} listings as:</p>
                  <div className="flex gap-3">
                    <button onClick={exportCSV}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                      <Download className="w-4 h-4" /> CSV File
                    </button>
                    <button onClick={exportExcel}
                      className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/40">
                      <FileSpreadsheet className="w-4 h-4" /> Excel Spreadsheet (.xlsx)
                    </button>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-3">
                  {page > 1 && (
                    <button onClick={() => fetchResults(lastParams!, page - 1)}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                      ← Prev
                    </button>
                  )}
                  <span className="px-5 py-2 bg-blue-600 rounded-lg text-sm font-semibold">Page {page}</span>
                  {results.listings.length === 20 && (
                    <button onClick={() => fetchResults(lastParams!, page + 1)}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                      Next →
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div className="text-center py-24 text-slate-600">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Set your filters and hit Search Cars</p>
          </div>
        )}
      </main>
    </div>
  )
}
