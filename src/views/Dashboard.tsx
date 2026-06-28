import { Link } from 'react-router-dom'
import { Bell, Eye, ArrowRight, QrCode, ArrowLeft, TrendingUp, Utensils, Car, Heart, Music, ShoppingBag, BookOpen, Home, Tag, Banknote } from 'lucide-react'
import { useFinStore } from '../store/useFinStore'
import { totReceitas, totFixos, totComprasMes, saldoMes, parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'
import type { CategoriaCompra } from '../types'

const CAT_CFG: Record<CategoriaCompra | 'receita', { bg: string; color: string; Icon: React.ElementType }> = {
  alimentacao: { bg: '#FFF3EB', color: '#F97316', Icon: Utensils },
  transporte:  { bg: '#EEF3FF', color: '#1A6BFF', Icon: Car },
  saude:       { bg: '#E8F8F2', color: '#00B37E', Icon: Heart },
  lazer:       { bg: '#F3EEFF', color: '#7C3AED', Icon: Music },
  vestuario:   { bg: '#FEF3C7', color: '#D97706', Icon: ShoppingBag },
  educacao:    { bg: '#EEF3FF', color: '#1A6BFF', Icon: BookOpen },
  casa:        { bg: '#FFF3EB', color: '#F97316', Icon: Home },
  outro:       { bg: '#F4F6FB', color: '#6B7A95', Icon: Tag },
  receita:     { bg: '#E8F8F2', color: '#00B37E', Icon: Banknote },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function Dashboard() {
  const state = useFinStore()
  const { mesRef, anoRef, compras } = state

  const receitas = totReceitas(state)
  const despesas = totFixos(state) + totComprasMes(state, mesRef, anoRef)
  const saldo = saldoMes(state, mesRef, anoRef)

  const recent = [...compras]
    .filter(c => parcelaMes(c, mesRef, anoRef) > 0)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3)

  return (
    <div>
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 18px' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#6B7A95' }}>{greeting()},</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.5px', marginTop: 2 }}>Bem-vindo!</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} color="#6B7A95" />
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#1A6BFF,#60A5FA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
            F
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: '0 20px', padding: '22px 24px', background: 'linear-gradient(148deg,#1A6BFF 0%,#0A3FCC 100%)', borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -40, bottom: -70, width: 210, height: 210, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Saldo disponível</div>
          <Eye size={18} color="rgba(255,255,255,0.4)" />
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 20 }}>{fmt(saldo)}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }}>Receitas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{fmt(receitas)}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }}>Despesas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFAAB8' }}>{fmt(despesas)}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 4, padding: '20px 20px 0' }}>
        {([
          { icon: <ArrowRight size={22} color="#1A6BFF" />, label: 'Transferir' },
          { icon: <QrCode size={22} color="#1A6BFF" />, label: 'Pagar' },
          { icon: <ArrowLeft size={22} color="#1A6BFF" />, label: 'Receber' },
          { icon: <TrendingUp size={22} color="#1A6BFF" />, label: 'Investir' },
        ] as const).map(({ icon, label }) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: '#EEF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0D1B2A' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 20px 12px' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0D1B2A' }}>Transações recentes</div>
        <Link to="/extrato" style={{ fontSize: 13, fontWeight: 700, color: '#1A6BFF', textDecoration: 'none' }}>Ver tudo</Link>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 14, color: '#B0B8C8', fontWeight: 500 }}>
            Nenhuma transação este mês
          </div>
        ) : (
          recent.map((c) => {
            const cfg = CAT_CFG[c.cat ?? 'outro']
            const { Icon } = cfg
            const amount = c.tipo === 'avista' ? c.valor : c.parcela
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', borderRadius: 20, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={19} color={cfg.color} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{c.desc}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7A95' }}>{c.cat ?? 'Outro'} · {c.data}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F03E5E', flexShrink: 0 }}>−{fmt(amount)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
