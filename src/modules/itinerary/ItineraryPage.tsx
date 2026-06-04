import { useMemo, useState } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { ITINERARY_PERIOD_LABEL, useTrip } from '@/lib/store'
import type { Activity, ItineraryPeriod, ItinerarySlot } from '@/types'
import { ItineraryMap } from './ItineraryMap'

const PERIODS: ItineraryPeriod[] = ['morning', 'afternoon', 'evening']

type DragPayload = { kind: 'pool' | 'slot'; activityId: string; slotId?: string }

function buildDays(start: string | null, end: string | null): string[] {
  if (!start || !end) return []
  const out: string[] = []
  const d = new Date(start)
  const last = new Date(end)
  let guard = 0
  while (d <= last && guard < 60) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
    guard++
  }
  return out
}

export default function ItineraryPage() {
  const { trip, activities, itinerarySlots, actions } = useTrip()
  const [view, setView] = useState<'plan' | 'map'>('plan')

  const days = useMemo(() => buildDays(trip.startDate, trip.endDate), [trip.startDate, trip.endDate])
  const [selectedDay, setSelectedDay] = useState<string>('')
  const activeDay = selectedDay || days[0] || ''

  const activityById = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities])
  const placedIds = useMemo(() => new Set(itinerarySlots.map((s) => s.activityId)), [itinerarySlots])
  // Pool : activités validées non encore placées au programme.
  const pool = useMemo(
    () => activities.filter((a) => !placedIds.has(a.id) && (a.status === 'validated' || a.status === 'idea')),
    [activities, placedIds],
  )

  const slotsOf = (date: string, period: ItineraryPeriod) =>
    itinerarySlots
      .filter((s) => s.slotDate === date && s.period === period)
      .sort((a, b) => a.orderIndex - b.orderIndex)

  const onDrop = (e: React.DragEvent, date: string, period: ItineraryPeriod) => {
    e.preventDefault()
    try {
      const p = JSON.parse(e.dataTransfer.getData('application/json')) as DragPayload
      if (p.kind === 'pool') actions.scheduleActivity(p.activityId, date, period)
      else if (p.slotId) actions.moveSlot(p.slotId, date, period)
    } catch {
      /* payload invalide */
    }
  }

  if (days.length === 0) {
    return (
      <ModulePage icon="📅" title="Itinéraire" subtitle="Le programme jour par jour">
        <div className="card card--soft">
          <p className="card__meta">Définis les dates du voyage pour générer le calendrier.</p>
        </div>
      </ModulePage>
    )
  }

  return (
    <ModulePage icon="📅" title="Itinéraire" subtitle="Le programme jour par jour">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${view === 'plan' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('plan')}>
          🗓️ Programme
        </button>
        <button className={`btn ${view === 'map' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('map')}>
          🗺️ Carte
        </button>
      </div>

      {view === 'plan' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* Pool d'activités à placer */}
          <aside className="card card--soft" style={{ position: 'sticky', top: 16 }}>
            <div className="card__title" style={{ fontSize: 15, marginBottom: 10 }}>
              À placer
            </div>
            {pool.length === 0 ? (
              <p className="card__meta">Tout est au programme 🎉</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {pool.map((a) => (
                  <ActivityChip key={a.id} activity={a} payload={{ kind: 'pool', activityId: a.id }} />
                ))}
              </div>
            )}
            <p className="card__meta" style={{ marginTop: 12 }}>
              Glisse une activité vers un créneau →
            </p>
          </aside>

          {/* Calendrier */}
          <div style={{ display: 'grid', gap: 16 }}>
            {days.map((date, i) => (
              <section key={date} className="card" style={{ padding: 16 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 16, color: 'var(--color-ink)' }}>
                  J{i + 1} · {formatDay(date)}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  {PERIODS.map((period) => {
                    const slots = slotsOf(date, period)
                    return (
                      <div
                        key={period}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDrop(e, date, period)}
                        style={{
                          background: 'var(--color-surface-soft)',
                          borderRadius: 'var(--radius-md)',
                          padding: 10,
                          minHeight: 90,
                        }}
                      >
                        <div className="card__meta" style={{ marginBottom: 8 }}>
                          {ITINERARY_PERIOD_LABEL[period]}
                        </div>
                        <div style={{ display: 'grid', gap: 6 }}>
                          {slots.map((s) => {
                            const a = s.activityId ? activityById.get(s.activityId) : undefined
                            if (!a) return null
                            return (
                              <ActivityChip
                                key={s.id}
                                activity={a}
                                payload={{ kind: 'slot', activityId: a.id, slotId: s.id }}
                                onRemove={() => actions.unscheduleSlot(s.id)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <MapView
          days={days}
          activeDay={activeDay}
          onSelectDay={setSelectedDay}
          slots={itinerarySlots.filter((s) => s.slotDate === activeDay)}
          activityById={activityById}
          onOptimize={(orderedIds) => actions.setDayOrder(orderedIds)}
        />
      )}
    </ModulePage>
  )
}

function ActivityChip({
  activity,
  payload,
  onRemove,
}: {
  activity: Activity
  payload: DragPayload
  onRemove?: () => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(payload))}
      className="card"
      style={{
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'grab',
        background: 'var(--color-canvas)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--color-ink)' }}>{activity.title}</span>
      {onRemove && (
        <button
          className="btn btn--ghost"
          style={{ height: 24, padding: '0 6px', fontSize: 12 }}
          onClick={onRemove}
          title="Retirer du programme"
        >
          ✕
        </button>
      )}
    </div>
  )
}

function MapView({
  days,
  activeDay,
  onSelectDay,
  slots,
  activityById,
  onOptimize,
}: {
  days: string[]
  activeDay: string
  onSelectDay: (d: string) => void
  slots: ItinerarySlot[]
  activityById: Map<string, Activity>
  onOptimize: (orderedIds: string[]) => void
}) {
  const ordered = [...slots].sort((a, b) => a.orderIndex - b.orderIndex)
  const points = ordered
    .map((s) => (s.activityId ? activityById.get(s.activityId) : undefined))
    .filter((a): a is Activity => !!a && a.lat != null && a.lng != null)

  const optimize = () => {
    const optimizedIds = nearestNeighbour(ordered, activityById)
    onOptimize(optimizedIds)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <select
          value={activeDay}
          onChange={(e) => onSelectDay(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-hairline)', font: 'inherit' }}
        >
          {days.map((d, i) => (
            <option key={d} value={d}>
              J{i + 1} · {formatDay(d)}
            </option>
          ))}
        </select>
        <button className="btn btn--secondary" onClick={optimize} disabled={points.length < 3}>
          ✨ Optimiser le trajet
        </button>
        <span className="card__meta">{points.length} étape·s géolocalisée·s</span>
      </div>
      <ItineraryMap points={points} />
    </div>
  )
}

/** TSP simplifié : plus proche voisin à partir de la 1re activité. Renvoie l'ordre des slot ids. */
function nearestNeighbour(slots: ItinerarySlot[], byId: Map<string, Activity>): string[] {
  const located = slots.filter((s) => {
    const a = s.activityId ? byId.get(s.activityId) : undefined
    return a && a.lat != null && a.lng != null
  })
  if (located.length < 2) return slots.map((s) => s.id)
  const remaining = [...located]
  const route: ItinerarySlot[] = [remaining.shift()!]
  while (remaining.length) {
    const last = byId.get(route[route.length - 1].activityId!)!
    let bestIdx = 0
    let bestDist = Infinity
    remaining.forEach((s, idx) => {
      const a = byId.get(s.activityId!)!
      const d = haversine(last.lat!, last.lng!, a.lat!, a.lng!)
      if (d < bestDist) {
        bestDist = d
        bestIdx = idx
      }
    })
    route.push(remaining.splice(bestIdx, 1)[0])
  }
  // les slots sans géoloc restent à la fin
  const unlocated = slots.filter((s) => !located.includes(s))
  return [...route, ...unlocated].map((s) => s.id)
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
}
