import { Link } from 'react-router-dom'
import { MODULES } from '@/config/modules'

export default function DashboardPage() {
  return (
    <section className="dashboard">
      <header style={{ marginBottom: 32 }}>
        <p className="card__meta" style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Single Source of Truth
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 600, color: 'var(--color-ink)', margin: '4px 0 8px' }}>
          Votre cockpit de voyage
        </h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: 560 }}>
          Centralisez tout — participants, idées, itinéraire, budget — au même endroit.
          Choisissez un module pour commencer.
        </p>
      </header>

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
