import { NavLink } from 'react-router-dom'

const S = {
  nav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#fff',
    borderTop: '1.5px solid #F0F2F7',
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
    zIndex: 30,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
    paddingBottom: 2,
    textDecoration: 'none',
  },
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? '#1A6BFF' : '#B0B8C8'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function CardsIcon({ active }: { active: boolean }) {
  const c = active ? '#1A6BFF' : '#B0B8C8'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  )
}

function ExtractIcon({ active }: { active: boolean }) {
  const c = active ? '#1A6BFF' : '#B0B8C8'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="7" x2="20" y2="7"/>
      <line x1="8" y1="12" x2="20" y2="12"/>
      <line x1="8" y1="17" x2="20" y2="17"/>
      <circle cx="4" cy="7" r="1.5" fill={c} stroke="none"/>
      <circle cx="4" cy="12" r="1.5" fill={c} stroke="none"/>
      <circle cx="4" cy="17" r="1.5" fill={c} stroke="none"/>
    </svg>
  )
}

function SobraIcon({ active }: { active: boolean }) {
  const c = active ? '#1A6BFF' : '#B0B8C8'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 7-8"/>
      <path d="M16 8h5v5"/>
    </svg>
  )
}

const NAV = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/cartoes', label: 'Cartões', Icon: CardsIcon },
  { to: '/extrato', label: 'Extrato', Icon: ExtractIcon },
  { to: '/metas', label: 'Sobra', Icon: SobraIcon },
]

export function BottomNav() {
  return (
    <nav style={S.nav}>
      {NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={S.tab}
        >
          {({ isActive }) => (
            <>
              <Icon active={isActive} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 600, color: isActive ? '#1A6BFF' : '#B0B8C8' }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
