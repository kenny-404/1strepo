import { ExternalLink, Gauge, MapPin, Star, Tag, Fuel, Car } from 'lucide-react'

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
  vin?: string
  trim?: string
  body?: string
  fuel?: string
  transmission?: string
}

export default function CarCard({ car }: { car: Listing }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-600 transition-all group flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-slate-800 overflow-hidden shrink-0">
        {car.image ? (
          <img src={car.image} alt={car.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-5xl">🚗</div>
        )}
        {car.price && car.price !== 'N/A' && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            {car.price}
          </div>
        )}
        {car.body && (
          <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-xs px-2 py-1 rounded-full">
            {car.body}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-white leading-snug mb-3 line-clamp-2 text-sm">{car.title}</h3>

        <div className="space-y-1.5 text-xs text-slate-400 mb-4 flex-1">
          {car.mileage && car.mileage !== 'N/A' && (
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{car.mileage}</span>
            </div>
          )}
          {car.trim && (
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{car.trim}</span>
            </div>
          )}
          {car.fuel && (
            <div className="flex items-center gap-2">
              <Fuel className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{car.fuel}{car.transmission ? ` · ${car.transmission}` : ''}</span>
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
              <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{car.distance}</span>
            </div>
          )}
          {car.rating && (
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span>{car.rating}</span>
            </div>
          )}
          {car.vin && (
            <div className="text-slate-600 font-mono text-xs pt-1 truncate">VIN: {car.vin}</div>
          )}
        </div>

        {car.url && (
          <a href={car.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:border-blue-500 hover:text-blue-400 text-slate-300 text-xs py-2 rounded-lg transition-colors mt-auto">
            View on Cars.com <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
