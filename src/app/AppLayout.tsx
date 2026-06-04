import { useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { MODULES } from '@/config/modules'
import { Logo } from '@/components/Logo'
import { useTrip } from '@/lib/store'
import { tripPath } from '@/config/demo'

/**
 * Layout principal : barre latérale + zone de contenu.
 * Monté sous /t/:token → tous les liens sont préfixés par le token (accès par lien).
 */
export function AppLayout() {
  const { token = '' } = useParams()
  const { trip, tripStatus, participants, currentParticipantId, actions } = useTrip()

  if (tripStatus === 'loading') {
    return <CenterMessage>Chargement du voyage…</CenterMessage>
  }
  if (tripStatus === 'notfound') {
    return (
      <CenterMessage>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: 'var(--color-ink)', fontWeight: 600 }}>Voyage introuvable</p>
          <p className="card__meta" style={{ marginBottom: 16 }}>Le lien est peut-être invalide ou expiré.</p>
          <Link to="/" className="btn btn--primary">Retour à l’accueil</Link>
        </div>
      </CenterMessage>
    )
  }

  return (
    <div className="app-shell" style={{ minHeight: '100%', display: 'flex' }}>
      <aside
        className="app-shell__nav"
        style={{
          width: 248,
          flexShrink: 0,
          borderRight: '1px solid var(--color-hairline)',
          background: 'var(--color-surface-soft)',
          padding: 20,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
            <Logo />
          </Link>
        </div>

        <div className="card card--soft" style={{ padding: 12, marginBottom: 12 }}>
          <div className="card__meta" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Voyage
          </div>
          <div style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 14 }}>{trip.name}</div>
          {trip.destination && <div className="card__meta">{trip.destination}</div>}
        </div>

        <ShareButton token={token} />

        <nav className="nav" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
          <NavItem to={tripPath(token)} icon="🏠" label="Dashboard" end />
          {MODULES.map((m) => (
            <NavItem key={m.id} to={tripPath(token, m.id)} icon={m.icon} label={m.label} />
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <label htmlFor="identity" className="card__meta" style={{ display: 'block', marginBottom: 6 }}>
            Vous êtes
          </label>
          <select
            id="identity"
            value={currentParticipantId}
            onChange={(e) => actions.setCurrentParticipant(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-hairline)',
              background: 'var(--color-canvas)',
              font: 'inherit',
              fontSize: 14,
            }}
          >
            {participants.length === 0 && <option value="">— aucun participant —</option>}
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <main className="app-shell__content" style={{ flex: 1, padding: 32, maxWidth: 1100 }}>
        <Outlet />
      </main>
    </div>
  )
}

function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = `${window.location.origin}${tripPath(token)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard indisponible */
    }
  }
  return (
    <button className="btn btn--secondary" style={{ width: '100%' }} onClick={share}>
      {copied ? '✓ Lien copié' : '🔗 Partager le lien'}
    </button>
  )
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'var(--color-muted)' }}>
      {children}
    </div>
  )
}

function NavItem({ to, icon, label, end }: { to: string; icon: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="nav__item"
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 600,
        color: isActive ? 'var(--color-on-primary)' : 'var(--color-body)',
        background: isActive ? 'var(--color-primary)' : 'transparent',
      })}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </NavLink>
  )
}
