import { useSyncExternalStore } from 'react'

/**
 * Mini bus de notifications (toasts), sans dépendance ni contexte React.
 * Utilisable partout (y compris hors composants : store, helpers).
 */
export type ToastType = 'error' | 'success' | 'info'
export interface Toast {
  id: string
  message: string
  type: ToastType
}

let toasts: Toast[] = []
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

export function notify(message: string, type: ToastType = 'info') {
  const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random())
  toasts = [...toasts, { id, message, type }]
  emit()
  setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500)
}

export const notifyError = (message: string) => notify(message, 'error')
export const notifySuccess = (message: string) => notify(message, 'success')

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => toasts,
    () => toasts,
  )
}
