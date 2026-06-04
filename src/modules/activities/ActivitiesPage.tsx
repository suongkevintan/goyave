import { useMemo, useState } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { Input, Modal, Textarea, fieldStyle } from '@/components/ui'
import { ACTIVITY_STATUS_LABEL, useTrip } from '@/lib/store'
import type { Activity, ActivityStatus, Participant } from '@/types'

const STATUS_ORDER: ActivityStatus[] = ['idea', 'validated', 'scheduled', 'done']

export default function ActivitiesPage() {
  const { activities, participants, votes, comments, currentParticipantId, actions } = useTrip()
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<ActivityStatus | 'all'>('all')

  const nameOf = useMemo(() => {
    const map = new Map(participants.map((p) => [p.id, p.name]))
    return (pid: string | null) => (pid ? (map.get(pid) ?? 'Inconnu') : 'Inconnu')
  }, [participants])

  const shown = filter === 'all' ? activities : activities.filter((a) => a.status === filter)

  return (
    <ModulePage icon="🎯" title="Activités" subtitle="Ce qu’on veut faire">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Toutes ({activities.length})
          </FilterChip>
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {ACTIVITY_STATUS_LABEL[s]} ({activities.filter((a) => a.status === s).length})
            </FilterChip>
          ))}
        </div>
        <button className="btn btn--primary" onClick={() => setCreating(true)}>
          + Proposer
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {shown.length === 0 && (
          <div className="card card--soft">
            <p className="card__meta">Aucune activité dans cette vue.</p>
          </div>
        )}

        {shown.map((a) => {
          const aVotes = votes.filter((v) => v.activityId === a.id)
          const aComments = comments.filter((c) => c.activityId === a.id)
          const myVote = aVotes.find((v) => v.participantId === currentParticipantId)?.type
          return (
            <article key={a.id} className="card">
              <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div className="card__title" style={{ fontSize: 20 }}>
                    {a.title}
                  </div>
                  <div className="card__meta" style={{ marginTop: 2 }}>
                    Proposé par {nameOf(a.proposedBy)}
                    {a.location && ` · 📍 ${a.location}`}
                  </div>
                </div>
                <select
                  value={a.status}
                  onChange={(e) => actions.setActivityStatus(a.id, e.target.value as ActivityStatus)}
                  style={{ ...fieldStyle, width: 'auto' }}
                  aria-label="Statut de l’activité"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {ACTIVITY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </header>

              {a.description && (
                <p style={{ color: 'var(--color-body)', margin: '12px 0 0' }}>{a.description}</p>
              )}

              <div className="card__meta" style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {a.durationMin != null && <span>⏱️ {formatDuration(a.durationMin)}</span>}
                {a.costPerPerson != null && <span>💶 {a.costPerPerson} € / pers.</span>}
              </div>

              {/* Votes */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <VoteButton
                  emoji="👍"
                  count={aVotes.filter((v) => v.type === 'like').length}
                  active={myVote === 'like'}
                  onClick={() => actions.toggleVote(a.id, 'like')}
                />
                <VoteButton
                  emoji="❤️"
                  count={aVotes.filter((v) => v.type === 'love').length}
                  active={myVote === 'love'}
                  onClick={() => actions.toggleVote(a.id, 'love')}
                />
                <button
                  className="btn btn--ghost"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => {
                    if (confirm(`Supprimer « ${a.title} » ?`)) actions.removeActivity(a.id)
                  }}
                >
                  Supprimer
                </button>
              </div>

              {/* Commentaires */}
              <Comments
                comments={aComments.map((c) => ({ ...c, author: nameOf(c.participantId) }))}
                onAdd={(content) => actions.addComment(a.id, content)}
              />
            </article>
          )
        })}
      </div>

      {creating && (
        <ActivityForm
          author={participants.find((p) => p.id === currentParticipantId)}
          onClose={() => setCreating(false)}
          onSubmit={(data) => {
            actions.addActivity({ title: data.title ?? 'Sans titre', ...data })
            setCreating(false)
          }}
        />
      )}
    </ModulePage>
  )
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="badge"
      style={{
        cursor: 'pointer',
        border: 'none',
        padding: '6px 12px',
        background: active ? 'var(--color-primary)' : 'var(--color-surface-strong)',
        color: active ? 'var(--color-on-primary)' : 'var(--color-body)',
      }}
    >
      {children}
    </button>
  )
}

function VoteButton({
  emoji,
  count,
  active,
  onClick,
}: {
  emoji: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="btn btn--secondary"
      style={{
        height: 36,
        padding: '0 14px',
        background: active ? 'var(--color-brand-peach)' : undefined,
        boxShadow: active ? 'none' : undefined,
      }}
    >
      <span aria-hidden>{emoji}</span> {count}
    </button>
  )
}

function Comments({
  comments,
  onAdd,
}: {
  comments: Array<{ id: string; author: string; content: string; createdAt: string }>
  onAdd: (content: string) => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <section style={{ marginTop: 16, borderTop: '1px solid var(--color-hairline)', paddingTop: 12 }}>
      {comments.map((c) => (
        <div key={c.id} style={{ fontSize: 14, marginBottom: 8 }}>
          <strong style={{ color: 'var(--color-ink)' }}>{c.author}</strong>{' '}
          <span style={{ color: 'var(--color-body)' }}>{c.content}</span>
        </div>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const v = draft.trim()
          if (!v) return
          onAdd(v)
          setDraft('')
        }}
        style={{ display: 'flex', gap: 8, marginTop: 8 }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ajouter un commentaire…"
          style={{ ...fieldStyle, flex: 1 }}
        />
        <button type="submit" className="btn btn--secondary" disabled={!draft.trim()}>
          Envoyer
        </button>
      </form>
    </section>
  )
}

function ActivityForm({
  author,
  onClose,
  onSubmit,
}: {
  author: Participant | undefined
  onClose: () => void
  onSubmit: (data: Partial<Activity>) => void
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    durationMin: '',
    costPerPerson: '',
  })
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <Modal title="Proposer une activité" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.title.trim()) return
          onSubmit({
            title: form.title.trim(),
            description: form.description.trim() || null,
            location: form.location.trim() || null,
            durationMin: form.durationMin ? Number(form.durationMin) : null,
            costPerPerson: form.costPerPerson ? Number(form.costPerPerson) : null,
            proposedBy: author?.id ?? null,
          })
        }}
        style={{ display: 'grid', gap: 14 }}
      >
        <Input label="Titre" value={form.title} onChange={(v) => set({ title: v })} autoFocus required />
        <Textarea label="Description" value={form.description} onChange={(v) => set({ description: v })} />
        <Input label="Lieu" value={form.location} onChange={(v) => set({ location: v })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Durée (min)"
            value={form.durationMin}
            onChange={(v) => set({ durationMin: v })}
            type="number"
            min={0}
          />
          <Input
            label="Coût / pers. (€)"
            value={form.costPerPerson}
            onChange={(v) => set({ costPerPerson: v })}
            type="number"
            min={0}
          />
        </div>
        <p className="card__meta">Proposé par {author?.name ?? '—'}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            Proposer
          </button>
        </div>
      </form>
    </Modal>
  )
}
