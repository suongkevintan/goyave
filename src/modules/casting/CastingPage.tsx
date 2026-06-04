import { useState } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { Input, Modal, fieldStyle } from '@/components/ui'
import { PARTICIPANT_STATUS_LABEL, useTrip } from '@/lib/store'
import type { Participant, ParticipantStatus } from '@/types'

const STATUS_ORDER: ParticipantStatus[] = ['confirmed', 'uncertain', 'withdrawn']

const STATUS_BADGE: Record<ParticipantStatus, string> = {
  confirmed: 'badge badge--success',
  uncertain: 'badge badge--warning',
  withdrawn: 'badge badge--muted',
}

export default function CastingPage() {
  const { participants, actions } = useTrip()
  const [editing, setEditing] = useState<Participant | null>(null)
  const [creating, setCreating] = useState(false)

  const confirmed = participants.filter((p) => p.status === 'confirmed').length

  return (
    <ModulePage icon="🗂️" title="Casting" subtitle="Les participants du voyage">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div className="card__meta">
          <strong style={{ color: 'var(--color-ink)', fontSize: 16 }}>{participants.length}</strong>{' '}
          participant·es · <strong style={{ color: 'var(--color-success)' }}>{confirmed}</strong>{' '}
          confirmé·es
        </div>
        <button className="btn btn--primary" onClick={() => setCreating(true)}>
          + Ajouter
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {participants.map((p) => (
          <article key={p.id} className="card">
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar name={p.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card__title">{p.name}</div>
                <span className={STATUS_BADGE[p.status]} style={{ marginTop: 2 }}>
                  {PARTICIPANT_STATUS_LABEL[p.status]}
                </span>
              </div>
            </header>

            <dl style={{ margin: 0, display: 'grid', gap: 6 }}>
              {p.phone && <Field label="Téléphone" value={p.phone} />}
              {p.allergies && <Field label="Allergies" value={p.allergies} />}
              {p.notes && <Field label="Notes" value={p.notes} />}
            </dl>

            <footer style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn--secondary" onClick={() => setEditing(p)}>
                Modifier
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  if (confirm(`Retirer ${p.name} du voyage ?`)) actions.removeParticipant(p.id)
                }}
              >
                Supprimer
              </button>
            </footer>
          </article>
        ))}
      </div>

      {(creating || editing) && (
        <ParticipantForm
          participant={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={(data) => {
            if (editing) actions.updateParticipant(editing.id, data)
            else actions.addParticipant({ name: data.name ?? 'Sans nom', ...data })
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </ModulePage>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
      <dt className="card__meta" style={{ minWidth: 72 }}>
        {label}
      </dt>
      <dd style={{ margin: 0, color: 'var(--color-body)' }}>{value}</dd>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-brand-lavender)',
        color: 'var(--color-ink)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function ParticipantForm({
  participant,
  onClose,
  onSubmit,
}: {
  participant: Participant | null
  onClose: () => void
  onSubmit: (data: Partial<Participant>) => void
}) {
  const [form, setForm] = useState<Partial<Participant>>({
    name: participant?.name ?? '',
    phone: participant?.phone ?? '',
    allergies: participant?.allergies ?? '',
    notes: participant?.notes ?? '',
    status: participant?.status ?? 'confirmed',
  })

  const set = (patch: Partial<Participant>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <Modal title={participant ? 'Modifier le participant' : 'Nouveau participant'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.name?.trim()) return
          onSubmit({
            name: form.name.trim(),
            phone: form.phone?.trim() || null,
            allergies: form.allergies?.trim() || null,
            notes: form.notes?.trim() || null,
            status: form.status,
          })
        }}
        style={{ display: 'grid', gap: 14 }}
      >
        <Input label="Nom / pseudo" value={form.name ?? ''} onChange={(v) => set({ name: v })} autoFocus required />
        <Input label="Téléphone" value={form.phone ?? ''} onChange={(v) => set({ phone: v })} />
        <Input label="Allergies" value={form.allergies ?? ''} onChange={(v) => set({ allergies: v })} />
        <Input label="Notes" value={form.notes ?? ''} onChange={(v) => set({ notes: v })} />

        <label style={{ display: 'grid', gap: 6 }}>
          <span className="card__meta">Statut</span>
          <select
            value={form.status}
            onChange={(e) => set({ status: e.target.value as ParticipantStatus })}
            style={fieldStyle}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {PARTICIPANT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            {participant ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
