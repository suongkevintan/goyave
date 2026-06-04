import { useState } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { fieldStyle } from '@/components/ui'
import { useTrip } from '@/lib/store'
import { useBeacons } from './useBeacons'

const MAX = 140
const EMOJIS = ['😀', '🏔️', '🍺', '🚗', '☔', '🏰', '😴', '🎉']

export default function BeaconPage() {
  const { trip, currentParticipant, currentParticipantId } = useTrip()
  const { ready, loading, error, beacons, addBeacon } = useBeacons(trip.id)
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const me = currentParticipantId

  if (!ready) {
    return (
      <ModulePage icon="📍" title="Balise" subtitle="Statut pendant le voyage">
        <div className="card card--soft">
          <p className="card__meta">
            Supabase non configuré. Renseigne <code>.env.local</code> puis relance <code>bun dev</code>.
          </p>
        </div>
      </ModulePage>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || !me) return
    setSending(true)
    await addBeacon(me, text.slice(0, MAX), emoji)
    setMessage('')
    setEmoji(null)
    setSending(false)
  }

  return (
    <ModulePage icon="📍" title="Balise" subtitle="Statut pendant le voyage — en temps réel">
      {/* Composer */}
      <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
        <div className="card__meta" style={{ marginBottom: 10 }}>
          Publié en tant que{' '}
          <strong style={{ color: 'var(--color-ink)' }}>{currentParticipant?.name ?? '— choisis ton identité dans le menu —'}</strong>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
            placeholder="Où en es-tu ? (140 caractères max)"
            style={{ ...fieldStyle, flex: 1 }}
            maxLength={MAX}
          />
          <button type="submit" className="btn btn--primary" disabled={!message.trim() || sending}>
            Publier
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          {EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => setEmoji(emoji === e ? null : e)}
              style={{
                fontSize: 18,
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                border: emoji === e ? '2px solid var(--color-ink)' : '1px solid var(--color-hairline)',
                background: 'var(--color-canvas)',
                cursor: 'pointer',
              }}
            >
              {e}
            </button>
          ))}
          <span className="card__meta" style={{ marginLeft: 'auto' }}>
            {message.length}/{MAX}
          </span>
        </div>
      </form>

      {error && (
        <div className="card" style={{ marginBottom: 16, background: 'color-mix(in srgb, var(--color-error) 10%, white)' }}>
          <p className="card__meta" style={{ color: 'var(--color-error)' }}>Erreur : {error}</p>
        </div>
      )}

      {/* Fil chronologique */}
      {loading ? (
        <p className="card__meta">Chargement…</p>
      ) : beacons.length === 0 ? (
        <div className="card card--soft">
          <p className="card__meta">Aucune balise pour l’instant. Publie la première !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {beacons.map((b) => (
            <article key={b.id} className="card" style={{ padding: 16, display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }} aria-hidden>
                {b.emoji ?? '📍'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--color-ink)' }}>{b.message}</div>
                <div className="card__meta" style={{ marginTop: 4 }}>
                  {b.authorName} · {formatWhen(b.createdAt)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </ModulePage>
  )
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
