import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui'
import { isSupabaseEnabled } from '@/lib/supabase'
import { createTrip } from '@/lib/trips'
import { DEMO_SHARE_TOKEN, tripPath } from '@/config/demo'

export default function Landing() {
  const [form, setForm] = useState({ name: '', destination: '', startDate: '', endDate: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    setError(null)
    const token = await createTrip({
      name: form.name.trim(),
      destination: form.destination.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })
    if (token) {
      // navigation "dure" → le client Supabase ré-init avec le bon x-share-token
      window.location.assign(tripPath(token))
    } else {
      setError("Impossible de créer le voyage. Supabase est-il configuré ?")
      setCreating(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Logo />
      </div>
      <p className="card__meta" style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
        Single Source of Truth
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 600, color: 'var(--color-ink)', margin: '4px 0 8px' }}>
        Pilotez vos voyages en groupe
      </h1>
      <p style={{ color: 'var(--color-muted)', maxWidth: 520, marginBottom: 32 }}>
        Participants, idées, itinéraire, budget, dispos — tout au même endroit, en temps
        réel, accessible par un simple lien. Sans compte.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Créer */}
        <form onSubmit={submit} className="card">
          <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--color-ink)' }}>Nouveau voyage</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <Input label="Nom du voyage" value={form.name} onChange={(v) => set({ name: v })} required placeholder="Road trip en Écosse" />
            <Input label="Destination" value={form.destination} onChange={(v) => set({ destination: v })} placeholder="Highlands, Écosse" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Début" value={form.startDate} onChange={(v) => set({ startDate: v })} type="date" />
              <Input label="Fin" value={form.endDate} onChange={(v) => set({ endDate: v })} type="date" />
            </div>
            {error && <p className="card__meta" style={{ color: 'var(--color-error)' }}>{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={creating || !isSupabaseEnabled}>
              {creating ? 'Création…' : 'Créer le voyage'}
            </button>
            {!isSupabaseEnabled && (
              <p className="card__meta">Supabase non configuré — création indisponible.</p>
            )}
          </div>
        </form>

        {/* Démo */}
        <div className="card card--soft" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--color-ink)' }}>Découvrir</h2>
          <p className="card__meta" style={{ flex: 1 }}>
            Explore un voyage de démonstration (road trip en Écosse) avec tous les modules
            remplis.
          </p>
          <Link to={tripPath(DEMO_SHARE_TOKEN)} className="btn btn--secondary" style={{ marginTop: 16 }}>
            Ouvrir le voyage de démo →
          </Link>
        </div>
      </div>
    </div>
  )
}
