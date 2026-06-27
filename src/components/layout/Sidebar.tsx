import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Wallet, TrendingUp, Calculator, Download, Upload } from 'lucide-react'
import { MonthYearSelector } from '../ui/MonthYearSelector'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { exportData } from '../../utils/dataIO'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compras', icon: ShoppingCart, label: 'Compras' },
  { to: '/fixos', icon: Wallet, label: 'Fixos' },
  { to: '/evolucao', icon: TrendingUp, label: 'Evolução' },
  { to: '/simulador', icon: Calculator, label: 'Simulador' },
]

interface SidebarProps {
  onImport: () => void
}

export function Sidebar({ onImport }: SidebarProps) {
  const collapsed = useMediaQuery('(max-width: 900px)')

  return (
    <aside
      className="h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col flex-shrink-0 transition-all duration-200"
      style={{ width: collapsed ? '60px' : '200px' }}
    >
      <div className="flex items-center justify-center h-14 border-b border-[var(--border)]">
        {collapsed ? (
          <span className="text-[var(--gold)] font-bold text-base">F</span>
        ) : (
          <span className="text-[var(--gold)] font-bold text-base tracking-wide">FinApp</span>
        )}
      </div>

      <nav className="flex-1 py-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-[var(--r)] transition-colors no-underline ${
                isActive
                  ? 'bg-[var(--gold)]/10 text-[var(--gold)]'
                  : 'text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--card)]'
              }`
            }
          >
            <Icon size={18} />
            {!collapsed && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-3 space-y-3">
        {!collapsed && (
          <div className="space-y-2">
            <button
              className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] w-full cursor-pointer bg-transparent border-0"
              onClick={exportData}
            >
              <Download size={14} />
              Exportar
            </button>
            <button
              className="flex items-center gap-2 text-xs text-[var(--text-dim)] hover:text-[var(--text)] w-full cursor-pointer bg-transparent border-0"
              onClick={onImport}
            >
              <Upload size={14} />
              Importar
            </button>
          </div>
        )}
        {!collapsed && <MonthYearSelector />}
      </div>
    </aside>
  )
}
