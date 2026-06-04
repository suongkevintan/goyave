import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { Activity } from '@/types'

// Correctif standard des icônes Leaflet sous bundler (chemins d'images).
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const SCOTLAND: [number, number] = [56.8, -4.2]

export function ItineraryMap({ points }: { points: Activity[] }) {
  const located = points.filter((a) => a.lat != null && a.lng != null)
  const center: [number, number] = located.length
    ? [located[0].lat!, located[0].lng!]
    : SCOTLAND
  const line = located.map((a) => [a.lat!, a.lng!] as [number, number])

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', height: 460 }}>
      <MapContainer center={center} zoom={located.length ? 8 : 6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line.length >= 2 && <Polyline positions={line} pathOptions={{ color: '#1a3a3a', weight: 3, dashArray: '6 8' }} />}
        {located.map((a, i) => (
          <Marker key={a.id} position={[a.lat!, a.lng!]}>
            <Popup>
              <strong>
                {i + 1}. {a.title}
              </strong>
              {a.location && (
                <>
                  <br />
                  {a.location}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
