import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ShoppingCart, Wallet, TrendingUp, Calculator } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compras', icon: ShoppingCart, label: 'Compras' },
  { to: '/fixos', icon: Wallet, label: 'Fixos' },
  { to: '/evolucao', icon: TrendingUp, label: 'Evolução' },
  { to: '/simulador', icon: Calculator, label: 'Sim.' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] flex z-30"
      style={{ height: 'var(--nav-h)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 no-underline transition-colors ${
              isActive ? 'text-[var(--gold)]' : 'text-[var(--text-dim)]'
            }`
          }
        >
          <Icon size={20} />
          <span className="text-[10px]">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
