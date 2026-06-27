import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Nova compra"
      className="fixed right-4 z-30 w-14 h-14 rounded-full bg-[var(--gold)] text-black flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity cursor-pointer border-0"
      style={{ bottom: `calc(var(--nav-h) + 16px)` }}
    >
      <Plus size={24} />
    </button>
  )
}
