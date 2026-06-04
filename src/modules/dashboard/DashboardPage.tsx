import { Link } from 'react-router-dom'
import { MODULES } from '@/config/modules'
import { useTrip } from '@/lib/store'

export default function DashboardPage() {
  const { trip, participants, activities } = useTrip()

  const confirmed = participants.filter((p) => p.status === 'confirmed').length
  const ideas = activities.filter((a) => a.status === 'idea').length
  const validated = activities.filter((a) => a.status === 'validated').length
  const estCostPerPerson = activities.reduce((sum, a) => sum + (a.costPerPerson ?? 0), 0)
  const nights = tripNights(trip.startDate, trip.endDate)

  return (
    <section className="dashboard">
      <header style={{ marginBottom: 28 }}>
        <p className="card__meta" style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Single Source of Truth
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 600, color: 'var(--color-ink)', margin: '4px 0 8px' }}>
          {trip.name}
        </h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: 560 }}>
          {trip.destination}
          {nights != null && ` · ${nights} nuits`}
          {trip.startDate && ` · du ${formatDate(trip.startDate)} au ${formatDate(trip.endDate)}`}
        </p>
      </header>

      {/* Stats temps réel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Stat label="Participants confirmés" value={`${confirmed}/${participants.length}`} />
        <Stat label="Idées d’activités" value={ideas} />
        <Stat label="Activités validées" value={validated} />
        <Stat label="Coût estimé / pers." value={`${estCostPerPerson} €`} />
      </div>

      {/* Accès modules */}
      <h2 style={{ fontSize: 18, color: 'var(--color-ink)', margin: '0 0 12px' }}>Modules</h2>
      <div
        className="dashboard__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {MODULES.map((m) => (
          <Link key={m.id} to={`/${m.id}`} className="card" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }} aria-hidden>
              {m.icon}
            </div>
            <div className="card__title">{m.label}</div>
            <div className="card__meta" style={{ marginTop: 4 }}>
              {m.blurb}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card card--soft">
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-ink)' }}>{value}</div>
      <div className="card__meta" style={{ marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

function tripNights(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / 86_400_000))
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
