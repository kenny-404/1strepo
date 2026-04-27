import { ExternalLink, Gauge, MapPin, Star, DollarSign } from 'lucide-react'

export type Listing = {
  title: string
  price: string
  mileage: string
  dealer: string
  distance: string
  rating: string
  image: string
  url: string
  year: string
  make: string
  model: string
}

export default function CarCard({ car }: { car: Listing }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-600 transition-all group">
      {/* Image */}
      <div className="relative h-48 bg-slate-800 overflow-hidden">
        {car.image ? (
          <img src={car.image} alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).src = '' ; (e.target as HTMLImageElement).className = 'hidden' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">🚗</div>
        )}
        {car.price && car.price !== 'N/A' && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {car.price}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white leading-snug mb-3 line-clamp-2">{car.title}</h3>

        <div className="space-y-1.5 text-sm text-slate-400 mb-4">
          {car.mileage && car.mileage !== 'N/A' && (
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{car.mileage}</span>
            </div>
          )}
          {car.dealer && car.dealer !== 'N/A' && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{car.dealer}</span>
            </div>
          )}
          {car.distance && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 text-slate-500 shrink-0 text-center text-xs">📍</span>
              <span>{car.distance}</span>
            </div>
          )}
          {car.rating && (
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span>{car.rating}</span>
            </div>
          )}
        </div>

        {car.url && (
          <a href={car.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:border-blue-500 hover:text-blue-400 text-slate-300 text-sm py-2 rounded-lg transition-colors">
            View on Cars.com <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
