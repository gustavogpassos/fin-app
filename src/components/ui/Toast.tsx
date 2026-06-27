import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

const typeStyles: Record<string, string> = {
  success: 'bg-[var(--green)]/10 border-[var(--green)] text-[var(--green)]',
  error: 'bg-[var(--red)]/10 border-[var(--red)] text-[var(--red)]',
  info: 'bg-[var(--blue)]/10 border-[var(--blue)] text-[var(--blue)]',
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-[var(--r)] border text-sm font-medium shadow-lg transition-all duration-300 ${typeStyles[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ bottom: `calc(var(--nav-h) + 16px)` }}
    >
      {message}
    </div>
  )
}

interface ToastState {
  id: number
  message: string
  type?: 'success' | 'error' | 'info'
}

let toastId = 0
let addToastFn: ((msg: string, type?: ToastState['type']) => void) | null = null

export function showToast(message: string, type: ToastState['type'] = 'info') {
  addToastFn?.(message, type)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, type }])
    }
    return () => { addToastFn = null }
  }, [])

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
      ))}
    </>
  )
}
