import type { ReactNode } from 'react'

/**
 * En-tête de page de module réutilisable.
 * Sert de squelette commun aux 7 modules en phase 1 (contenu = placeholder).
 */
export function ModulePage({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <section className="module-page">
      <header className="module-page__header" style={{ marginBottom: 24 }}>
        <h1
          className="module-page__title"
          style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}
        >
          <span aria-hidden>{icon}</span>
          {title}
        </h1>
        {subtitle && (
          <p className="module-page__subtitle" style={{ color: 'var(--color-muted)', marginTop: 8 }}>
            {subtitle}
          </p>
        )}
      </header>
      <div className="module-page__body">
        {children ?? (
          <div className="card card--soft">
            <p className="card__meta">Module en cours de construction — phase 1.</p>
          </div>
        )}
      </div>
    </section>
  )
}
