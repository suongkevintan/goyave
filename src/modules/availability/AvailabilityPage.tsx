import { useMemo } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { useTrip } from '@/lib/store'
import { AVAILABILITY_WINDOW } from '@/data/seed'
import type { AvailabilityPeriod } from '@/types'

const PERIODS: AvailabilityPeriod[] = ['morning', 'evening']
const PERIOD_LABEL: Record<AvailabilityPeriod, string> = { morning: 'Matin', evening: 'Soir' }

function buildDates(start: string, days: number): string[] {
  const out: string[] = []
  const d0 = new Date(start)
  for (let i = 0; i < days; i++) {
    const d = new Date(d0)
    d.setDate(d0.getDate() + i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export default function AvailabilityPage() {
  const { participants, availabilities, currentParticipant, currentParticipantId, actions } = useTrip()

  const dates = useMemo(() => buildDates(AVAILABILITY_WINDOW.start, AVAILABILITY_WINDOW.days), [])
  const totalPeople = participants.length || 1

  // index : `${date}|${period}` -> nombre de dispos
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of availabilities) {
      if (!a.available) continue
      const k = `${a.availDate}|${a.period}`
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return map
  }, [availabilities])

  const mine = useMemo(
    () => new Set(availabilities.filter((a) => a.participantId === currentParticipantId).map((a) => `${a.availDate}|${a.period}`)),
    [availabilities, currentParticipantId],
  )

  // Meilleur(s) jour(s) : score = dispos matin + soir
  const dayScore = (date: string) =>
    (counts.get(`${date}|morning`) ?? 0) + (counts.get(`${date}|evening`) ?? 0)
  const bestScore = Math.max(0, ...dates.map(dayScore))

  return (
    <ModulePage icon="📆" title="Dispo" subtitle="Trouver les bonnes dates">
      <p className="card__meta" style={{ marginBottom: 16 }}>
        Tu remplis les créneaux pour <strong style={{ color: 'var(--color-ink)' }}>{currentParticipant?.name ?? '—'}</strong>.
        Clique pour basculer ta disponibilité. La couleur indique le nombre de personnes disponibles.
      </p>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, fontSize: 12, color: 'var(--color-muted)' }}>Date</th>
              {PERIODS.map((p) => (
                <th key={p} style={{ padding: 8, fontSize: 12, color: 'var(--color-muted)' }}>
                  {PERIOD_LABEL[p]}
                </th>
              ))}
              <th style={{ padding: 8, fontSize: 12, color: 'var(--color-muted)' }}></th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const isBest = bestScore > 0 && dayScore(date) === bestScore
              return (
                <tr key={date}>
                  <td style={{ padding: 8, fontSize: 14, whiteSpace: 'nowrap', color: 'var(--color-body)' }}>
                    {formatDate(date)}
                  </td>
                  {PERIODS.map((period) => {
                    const k = `${date}|${period}`
                    const count = counts.get(k) ?? 0
                    const isMine = mine.has(k)
                    return (
                      <td key={period} style={{ padding: 4, textAlign: 'center' }}>
                        <button
                          onClick={() => actions.toggleAvailability(date, period)}
                          title={`${count}/${participants.length} dispo`}
                          style={{
                            width: 56,
                            height: 40,
                            borderRadius: 'var(--radius-sm)',
                            border: isMine ? '2px solid var(--color-ink)' : '1px solid var(--color-hairline)',
                            background: heatColor(count, totalPeople),
                            color: count > totalPeople / 2 ? 'white' : 'var(--color-body)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {count}
                        </button>
                      </td>
                    )
                  })}
                  <td style={{ padding: 8 }}>
                    {isBest && <span className="badge badge--success">⭐ Meilleur</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <span className="card__meta">Moins dispo</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span
            key={n}
            style={{
              width: 24,
              height: 16,
              borderRadius: 4,
              background: heatColor((n / 4) * totalPeople, totalPeople),
              display: 'inline-block',
            }}
          />
        ))}
        <span className="card__meta">Plus dispo</span>
        <span className="card__meta" style={{ marginLeft: 12 }}>
          ▢ bordure épaisse = ta dispo
        </span>
      </div>
    </ModulePage>
  )
}

/** Dégradé du crème (peu de monde) vers le teal de marque (tout le monde). */
function heatColor(count: number, total: number): string {
  if (count <= 0) return 'var(--color-surface-soft)'
  const ratio = Math.min(1, count / total)
  // mélange surface-strong → brand-teal
  return `color-mix(in srgb, var(--color-brand-teal) ${Math.round(ratio * 100)}%, var(--color-surface-strong))`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}
