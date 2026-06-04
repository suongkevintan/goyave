import { useMemo, useState } from 'react'
import { ModulePage } from '@/components/ModulePage'
import { Input, Modal, fieldStyle } from '@/components/ui'
import {
  BUDGET_CATEGORY_LABEL,
  BUDGET_STATUS_LABEL,
  useTrip,
} from '@/lib/store'
import type { BudgetCategory, BudgetItem, BudgetStatus } from '@/types'

const CATEGORIES = Object.keys(BUDGET_CATEGORY_LABEL) as BudgetCategory[]
const STATUSES = Object.keys(BUDGET_STATUS_LABEL) as BudgetStatus[]

const STATUS_BADGE: Record<BudgetStatus, string> = {
  to_book: 'badge badge--warning',
  booked: 'badge badge--muted',
  paid: 'badge badge--success',
}

export default function BudgetPage() {
  const { budgetItems, participants, actions } = useTrip()
  const [editing, setEditing] = useState<BudgetItem | null>(null)
  const [creating, setCreating] = useState(false)

  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length || 1

  const total = useMemo(
    () => budgetItems.reduce((sum, b) => sum + (b.totalCost ?? 0), 0),
    [budgetItems],
  )
  const toConfirm = useMemo(
    () =>
      budgetItems
        .filter((b) => b.status === 'to_book')
        .reduce((sum, b) => sum + (b.totalCost ?? 0), 0),
    [budgetItems],
  )
  const perPerson = Math.round(total / confirmedCount)

  // Regroupement par catégorie
  const byCategory = useMemo(() => {
    const map = new Map<BudgetCategory, BudgetItem[]>()
    for (const b of budgetItems) {
      const list = map.get(b.category) ?? []
      list.push(b)
      map.set(b.category, list)
    }
    return map
  }, [budgetItems])

  return (
    <ModulePage icon="💰" title="Budget" subtitle="Les coûts prévisionnels">
      {/* Synthèse */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Stat label="Total estimé" value={`${total} €`} />
        <Stat label={`Par pers. (${confirmedCount} confirmé·es)`} value={`${perPerson} €`} />
        <Stat label="Reste à réserver" value={`${toConfirm} €`} accent />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <a className="btn btn--secondary" href="https://tricount.com" target="_blank" rel="noreferrer">
          🔗 Suivi des dépenses réelles (Tricount)
        </a>
        <button className="btn btn--primary" onClick={() => setCreating(true)}>
          + Ligne
        </button>
      </div>

      {/* Lignes par catégorie */}
      <div style={{ display: 'grid', gap: 20 }}>
        {CATEGORIES.filter((c) => byCategory.has(c)).map((cat) => {
          const items = byCategory.get(cat)!
          const catTotal = items.reduce((s, b) => s + (b.totalCost ?? 0), 0)
          return (
            <section key={cat}>
              <h2
                style={{
                  fontSize: 14,
                  color: 'var(--color-muted)',
                  margin: '0 0 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{BUDGET_CATEGORY_LABEL[cat]}</span>
                <span>{catTotal} €</span>
              </h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {items.map((b) => (
                  <article
                    key={b.id}
                    className="card"
                    style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{b.description}</div>
                      <div className="card__meta" style={{ marginTop: 2 }}>
                        {b.totalCost != null && `${b.totalCost} € · ${Math.round((b.totalCost ?? 0) / confirmedCount)} €/pers.`}
                        {b.linkUrl && (
                          <>
                            {' · '}
                            <a href={b.linkUrl} target="_blank" rel="noreferrer">
                              lien
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={STATUS_BADGE[b.status]}>{BUDGET_STATUS_LABEL[b.status]}</span>
                    <button className="btn btn--secondary" style={{ height: 36 }} onClick={() => setEditing(b)}>
                      Modifier
                    </button>
                    <button
                      className="btn btn--ghost"
                      style={{ height: 36 }}
                      onClick={() => {
                        if (confirm(`Supprimer « ${b.description} » ?`)) actions.removeBudgetItem(b.id)
                      }}
                    >
                      ✕
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
        {budgetItems.length === 0 && (
          <div className="card card--soft">
            <p className="card__meta">Aucune ligne de budget. Ajoute-en une pour commencer.</p>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <BudgetForm
          item={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSubmit={(data) => {
            if (editing) actions.updateBudgetItem(editing.id, data)
            else actions.addBudgetItem({ description: data.description ?? 'Sans nom', ...data })
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </ModulePage>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card card--soft">
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? 'var(--color-warning)' : 'var(--color-ink)' }}>
        {value}
      </div>
      <div className="card__meta" style={{ marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

function BudgetForm({
  item,
  onClose,
  onSubmit,
}: {
  item: BudgetItem | null
  onClose: () => void
  onSubmit: (data: Partial<BudgetItem>) => void
}) {
  const [form, setForm] = useState({
    description: item?.description ?? '',
    category: item?.category ?? ('transport' as BudgetCategory),
    totalCost: item?.totalCost != null ? String(item.totalCost) : '',
    status: item?.status ?? ('to_book' as BudgetStatus),
    linkUrl: item?.linkUrl ?? '',
  })
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <Modal title={item ? 'Modifier la ligne' : 'Nouvelle ligne de budget'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.description.trim()) return
          onSubmit({
            description: form.description.trim(),
            category: form.category,
            totalCost: form.totalCost ? Number(form.totalCost) : null,
            status: form.status,
            linkUrl: form.linkUrl.trim() || null,
          })
        }}
        style={{ display: 'grid', gap: 14 }}
      >
        <Input label="Description" value={form.description} onChange={(v) => set({ description: v })} autoFocus required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="card__meta">Catégorie</span>
            <select value={form.category} onChange={(e) => set({ category: e.target.value as BudgetCategory })} style={fieldStyle}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {BUDGET_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <Input label="Coût total (€)" value={form.totalCost} onChange={(v) => set({ totalCost: v })} type="number" min={0} />
        </div>
        <label style={{ display: 'grid', gap: 6 }}>
          <span className="card__meta">Statut</span>
          <select value={form.status} onChange={(e) => set({ status: e.target.value as BudgetStatus })} style={fieldStyle}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {BUDGET_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <Input label="Lien (réservation / doc)" value={form.linkUrl} onChange={(v) => set({ linkUrl: v })} placeholder="https://…" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            {item ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
