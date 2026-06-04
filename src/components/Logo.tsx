/**
 * Logo — PLACEHOLDER.
 * La direction artistique (logo définitif) sera appliquée en phase 2.
 * On garde une marque texte neutre + une pastille pour réserver l'espace.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo" aria-label="Voyage">
      <span
        className="logo__mark"
        // placeholder visuel — remplacé par l'asset de marque en phase 2
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          fontWeight: 700,
        }}
      >
        V
      </span>
      {!compact && (
        <span
          className="logo__word"
          style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-ink)' }}
        >
          Voyage
        </span>
      )}
    </span>
  )
}
