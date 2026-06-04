import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

/**
 * Petit kit de primitives de formulaire / modale, partagé entre modules.
 * (Les modules ne doivent pas s'importer entre eux — cf. CONVENTIONS.md.)
 */

export const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-hairline)',
  background: 'var(--color-canvas)',
  font: 'inherit',
  fontSize: 14,
}

export function Input({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="card__meta">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} {...rest} />
    </label>
  )
}

export function Textarea({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span className="card__meta">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...fieldStyle, resize: 'vertical', minHeight: 72 }}
        {...rest}
      />
    </label>
  )
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,10,10,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          background: 'var(--color-canvas)',
          width: '100%',
          maxWidth: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--color-ink)' }}>{title}</h2>
        {children}
      </div>
    </div>
  )
}
