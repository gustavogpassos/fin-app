import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinStore } from '../../store/useFinStore'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthYearSelector() {
  const mesRef = useFinStore((s) => s.mesRef)
  const anoRef = useFinStore((s) => s.anoRef)
  const setMesRef = useFinStore((s) => s.setMesRef)
  const setAnoRef = useFinStore((s) => s.setAnoRef)

  return (
    <div className="flex flex-col gap-1">
      <select
        value={mesRef}
        onChange={(e) => setMesRef(Number(e.target.value))}
        className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs rounded px-2 py-1"
      >
        {MONTHS.map((m, i) => (
          <option key={i} value={i + 1}>{m}</option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          className="p-0.5 text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0"
          onClick={() => setAnoRef(anoRef - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs text-[var(--text)] flex-1 text-center">{anoRef}</span>
        <button
          className="p-0.5 text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0"
          onClick={() => setAnoRef(anoRef + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
