import { dismiss, useToasts, type ToastType } from '@/lib/toast'

const STYLE: Record<ToastType, { bg: string; fg: string }> = {
  error: { bg: 'var(--color-error)', fg: '#fff' },
  success: { bg: 'var(--color-success)', fg: '#fff' },
  info: { bg: 'var(--color-surface-dark)', fg: 'var(--color-on-dark)' },
}

export function Toaster() {
  const toasts = useToasts()
  if (toasts.length === 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
        width: 'min(420px, calc(100vw - 32px))',
      }}
    >
      {toasts.map((t) => {
        const s = STYLE[t.type]
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              background: s.bg,
              color: s.fg,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 500,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            }}
          >
            {t.message}
          </button>
        )
      })}
    </div>
  )
}
