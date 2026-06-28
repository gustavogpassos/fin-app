import { SlidersHorizontal, Utensils, Car, Heart, Music, ShoppingBag, BookOpen, Home, Tag } from 'lucide-react'
import { useFinStore } from '../store/useFinStore'
import { totReceitas, totFixos, totComprasMes, parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'
import type { CategoriaCompra } from '../types'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const CAT_CFG: Record<CategoriaCompra, { bg: string; color: string; Icon: React.ElementType }> = {
  alimentacao: { bg: '#FFF3EB', color: '#F97316', Icon: Utensils },
  transporte:  { bg: '#EEF3FF', color: '#1A6BFF', Icon: Car },
  saude:       { bg: '#E8F8F2', color: '#00B37E', Icon: Heart },
  lazer:       { bg: '#F3EEFF', color: '#7C3AED', Icon: Music },
  vestuario:   { bg: '#FEF3C7', color: '#D97706', Icon: ShoppingBag },
  educacao:    { bg: '#EEF3FF', color: '#1A6BFF', Icon: BookOpen },
  casa:        { bg: '#FFF3EB', color: '#F97316', Icon: Home },
  outro:       { bg: '#F4F6FB', color: '#6B7A95', Icon: Tag },
}

function getMonthTabs(mesRef: number, anoRef: number) {
  const tabs = []
  for (let i = 0; i < 6; i++) {
    let m = mesRef - i
    let y = anoRef
    if (m <= 0) { m += 12; y-- }
    tabs.push({ mes: m, ano: y, label: MONTHS[m - 1] })
  }
  return tabs
}

function padZ(n: number) { return String(n).padStart(2, '0') }

export function Extrato() {
  const state = useFinStore()
  const { mesRef, anoRef, compras, fixos, setMesRef, setAnoRef } = state

  const tabs = getMonthTabs(mesRef, anoRef)
  const receitas = totReceitas(state)
  const despesas = totFixos(state) + totComprasMes(state, mesRef, anoRef)

  // Build unified transaction list for the selected month
  type TxItem = { id: string; desc: string; date: string; cat: string; amount: number }
  const txs: TxItem[] = []

  compras.forEach(c => {
    const amt = parcelaMes(c, mesRef, anoRef)
    if (amt <= 0) return
    txs.push({ id: `c${c.id}`, desc: c.desc, date: c.data, cat: c.cat ?? 'outro', amount: amt })
  })

  fixos.forEach(f => {
    const date = `${anoRef}-${padZ(mesRef)}-${padZ(f.dia)}`
    txs.push({ id: `f${f.id}`, desc: f.desc, date, cat: f.cat, amount: f.valor })
  })

  txs.sort((a, b) => b.date.localeCompare(a.date))

  // Group by date
  const groups = txs.reduce<{ date: string; items: TxItem[] }[]>((acc, tx) => {
    const last = acc[acc.length - 1]
    if (last && last.date === tx.date) { last.items.push(tx); return acc }
    acc.push({ date: tx.date, items: [tx] })
    return acc
  }, [])

  function formatDateLabel(iso: string) {
    const [y, m, d] = iso.split('-').map(Number)
    const today = new Date()
    const dt = new Date(y, m - 1, d)
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const diff = Math.round((todayMid.getTime() - dt.getTime()) / 86400000)
    if (diff === 0) return `Hoje · ${d} ${MONTHS[m - 1]}`
    if (diff === 1) return `Ontem · ${d} ${MONTHS[m - 1]}`
    return `${d} ${MONTHS[m - 1]}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.5px' }}>Extrato</div>
        <div style={{ width: 40, height: 40, borderRadius: 13, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SlidersHorizontal size={18} color="#6B7A95" />
        </div>
      </div>

      {/* Month Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 4px', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
        {tabs.map(t => {
          const isActive = t.mes === mesRef && t.ano === anoRef
          return (
            <button
              key={`${t.ano}-${t.mes}`}
              onClick={() => { setMesRef(t.mes); setAnoRef(t.ano) }}
              style={{
                padding: '7px 18px',
                background: isActive ? '#EEF3FF' : 'transparent',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#1A6BFF' : '#6B7A95',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
                flexShrink: 0,
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 20px' }}>
        <div style={{ flex: 1, background: '#E8F8F2', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#00B37E', textTransform: 'uppercase' as const, letterSpacing: 0.4, marginBottom: 5 }}>Receitas</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#00B37E' }}>+{fmt(receitas)}</div>
        </div>
        <div style={{ flex: 1, background: '#FEEAEE', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F03E5E', textTransform: 'uppercase' as const, letterSpacing: 0.4, marginBottom: 5 }}>Despesas</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#F03E5E' }}>−{fmt(despesas)}</div>
        </div>
      </div>

      {/* Transactions */}
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 14, color: '#B0B8C8', fontWeight: 500 }}>
          Nenhuma transação neste mês
        </div>
      ) : (
        groups.map(g => (
          <div key={g.date}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#B0B8C8', textTransform: 'uppercase' as const, letterSpacing: 0.8, padding: '4px 20px 10px' }}>
              {formatDateLabel(g.date)}
            </div>
            <div style={{ padding: '0 20px' }}>
              {g.items.map((tx, i) => {
                const cfg = CAT_CFG[tx.cat as CategoriaCompra] ?? CAT_CFG.outro
                const { Icon } = cfg
                return (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 20, marginBottom: i < g.items.length - 1 ? 10 : 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={19} color={cfg.color} strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{tx.desc}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7A95' }}>{tx.cat} · {tx.date.split('-').reverse().slice(0, 2).join('/')}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F03E5E', flexShrink: 0 }}>−{fmt(tx.amount)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
      <div style={{ height: 8 }} />
    </div>
  )
}
