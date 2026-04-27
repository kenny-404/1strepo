import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
  'Audi', 'Tesla', 'Nissan', 'Hyundai', 'Kia', 'Jeep', 'Ram',
  'GMC', 'Subaru', 'Mazda', 'Volkswagen', 'Lexus', 'Dodge', 'Acura',
]

const DISTANCES = ['25', '50', '100', '200', '500', 'all']
const PRICES = ['10000', '15000', '20000', '25000', '30000', '40000', '50000', '75000', '100000']
const MAX_RESULTS = ['20', '50', '100', '200', '500']

export type SearchParams = {
  make: string
  model: string
  zip_code: string
  max_price: string
  max_distance: string
  stock_type: string
  max_results: string
}

type Props = { onSearch: (p: SearchParams) => void; loading: boolean }

export default function SearchForm({ onSearch, loading }: Props) {
  const [params, setParams] = useState<SearchParams>({
    make: '', model: '', zip_code: '90210',
    max_price: '', max_distance: '100', stock_type: 'used', max_results: '100',
  })

  const set = (key: keyof SearchParams) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setParams(p => ({ ...p, [key]: e.target.value }))

  const submit = (e: React.FormEvent) => { e.preventDefault(); onSearch(params) }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors'
  const labelCls = 'block text-xs text-slate-400 uppercase tracking-wider mb-1.5'

  return (
    <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-sm uppercase tracking-widest text-slate-300">Search Filters</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div>
          <label className={labelCls}>Make</label>
          <select value={params.make} onChange={set('make')} className={inputCls}>
            <option value="">Any Make</option>
            {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Model</label>
          <input value={params.model} onChange={set('model')} placeholder="e.g. Camry" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Zip Code</label>
          <input value={params.zip_code} onChange={set('zip_code')} placeholder="90210" className={inputCls} maxLength={5} />
        </div>

        <div>
          <label className={labelCls}>Max Price</label>
          <select value={params.max_price} onChange={set('max_price')} className={inputCls}>
            <option value="">No Limit</option>
            {PRICES.map(p => (
              <option key={p} value={p}>${parseInt(p).toLocaleString()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Max Distance</label>
          <select value={params.max_distance} onChange={set('max_distance')} className={inputCls}>
            {DISTANCES.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'Nationwide' : `${d} miles`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Condition</label>
          <select value={params.stock_type} onChange={set('stock_type')} className={inputCls}>
            <option value="used">Used</option>
            <option value="new">New</option>
            <option value="all">All</option>
            <option value="certified">Certified</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Max Results</label>
          <select value={params.max_results} onChange={set('max_results')} className={inputCls}>
            {MAX_RESULTS.map(n => (
              <option key={n} value={n}>{n} listings</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scraping...</>
          : <><Search className="w-4 h-4" /> Search Cars</>}
      </button>
    </form>
  )
}
