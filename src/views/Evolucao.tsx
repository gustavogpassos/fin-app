import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinStore } from '../store/useFinStore'
import { totFixos, totComprasMes } from '../utils/finance'
import { fmt } from '../utils/format'
import { BarChart } from '../components/charts/BarChart'

const MES_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function Evolucao() {
  const state = useFinStore()
  const anoRef = useFinStore((s) => s.anoRef)
  const [ano, setAno] = useState(anoRef)

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const rows = months.map((mes) => {
    const rec = state.receitas.reduce((acc, r) => {
      const key = `${ano}-${String(mes).padStart(2, '0')}`
      return acc + (r.valorMeses?.[key] ?? r.valor)
    }, 0)
    const fix = totFixos(state)
    const comp = totComprasMes(state, mes, ano)
    const bal = rec - fix - comp
    return { mes, rec, fix, comp, bal }
  })

  const groups = rows.map((r) => ({
    label: MES_NAMES[r.mes - 1],
    values: [r.rec, r.fix, r.comp] as [number, number, number],
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          className="p-1 text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0"
          onClick={() => setAno((y) => y - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-base font-semibold">{ano}</span>
        <button
          className="p-1 text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0"
          onClick={() => setAno((y) => y + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="bg-[var(--card)] rounded-[var(--r)] p-4">
        <BarChart groups={groups} />
        <div className="flex gap-4 mt-3 justify-center">
          {[
            { label: 'Receitas', color: 'var(--green)' },
            { label: 'Fixos', color: 'var(--red)' },
            { label: 'Compras', color: 'var(--blue)' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-[var(--text-dim)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[480px]">
          <thead>
            <tr className="text-[var(--text-dim)] border-b border-[var(--border)]">
              <th className="text-left py-2 font-medium">Mes</th>
              <th className="text-right py-2 font-medium">Receitas</th>
              <th className="text-right py-2 font-medium">Fixos</th>
              <th className="text-right py-2 font-medium">Compras</th>
              <th className="text-right py-2 font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ mes, rec, fix, comp, bal }) => (
              <tr key={mes} className="border-b border-[var(--border)]">
                <td className="py-2">{MES_NAMES[mes - 1]}</td>
                <td className="py-2 text-right text-[var(--green)]">{fmt(rec)}</td>
                <td className="py-2 text-right text-[var(--red)]">{fmt(fix)}</td>
                <td className="py-2 text-right text-[var(--blue)]">{fmt(comp)}</td>
                <td className={`py-2 text-right font-semibold ${bal >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {fmt(bal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
