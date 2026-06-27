import { MonthYearSelector } from '../ui/MonthYearSelector'

export function MobileTopbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 z-30"
      style={{ height: '52px' }}
    >
      <span className="text-[var(--gold)] font-bold text-base">FinApp</span>
      <MonthYearSelector />
    </header>
  )
}
