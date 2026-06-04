import { NavLink, Outlet } from 'react-router-dom'
import { MODULES } from '@/config/modules'
import { Logo } from '@/components/Logo'

/**
 * Layout principal : barre latérale (desktop) / barre du bas (mobile) + zone de contenu.
 * Mobile-first conformément aux principes de design (note de cadrage §8).
 */
export function AppLayout() {
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
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <NavLink to="/" style={{ textDecoration: 'none', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
            <Logo />
          </NavLink>
        </div>

        <nav className="nav" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/" icon="🏠" label="Dashboard" end />
          {MODULES.map((m) => (
            <NavItem key={m.id} to={`/${m.id}`} icon={m.icon} label={m.label} />
          ))}
        </nav>
      </aside>

      <main className="app-shell__content" style={{ flex: 1, padding: 32, maxWidth: 1100 }}>
        <Outlet />
      </main>
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
