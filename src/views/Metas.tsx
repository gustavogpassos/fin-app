import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFinStore } from '../store/useFinStore'
import { saldoMes, totReceitas, totFixos, totComprasMes, parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'

const MES_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function parcelaIndex(dataIso: string, mes: number, ano: number): number {
  const dt = new Date(dataIso + 'T00:00:00')
  const start = dt.getFullYear() * 12 + dt.getMonth()
  return ano * 12 + (mes - 1) - start + 1
}

export function Metas() {
  const state = useFinStore()
  const { receitas, fixos, compras } = state
  const [openKey, setOpenKey] = useState<string | null>(null)

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { mes: d.getMonth() + 1, ano: d.getFullYear() }
  })

  const rows = months.map(({ mes, ano }) => ({
    mes, ano,
    key: `${ano}-${mes}`,
    label: MES_NAMES[mes - 1],
    sobra: saldoMes(state, mes, ano),
    rec: totReceitas({ receitas, mesRef: mes, anoRef: ano }),
    fix: totFixos(state),
    comp: totComprasMes(state, mes, ano),
  }))

  // Line chart geometry
  const W = 320, H = 130, padX = 14, padTop = 14, padBottom = 26
  const vals = rows.map(r => r.sobra)
  const maxV = Math.max(0, ...vals)
  const minV = Math.min(0, ...vals)
  const span = maxV - minV || 1
  const chartH = H - padTop - padBottom
  const stepX = (W - padX * 2) / Math.max(1, rows.length - 1)
  const x = (i: number) => padX + i * stepX
  const y = (v: number) => padTop + (maxV - v) / span * chartH
  const zeroY = y(0)
  const points = rows.map((r, i) => `${x(i)},${y(r.sobra)}`).join(' ')

  const totalSobra = rows.reduce((a, r) => a + r.sobra, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.5px' }}>Sobra do Mês</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#6B7A95', marginTop: 2 }}>Evolução dos próximos 6 meses</div>
      </div>

      {/* Chart Card */}
      <div style={{ margin: '0 20px', padding: '18px 14px 10px', background: '#fff', borderRadius: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '0 6px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A95', textTransform: 'uppercase' as const, letterSpacing: 0.6 }}>Sobra acumulada (6 meses)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: totalSobra >= 0 ? '#00B37E' : '#F03E5E', marginTop: 2 }}>{fmt(totalSobra)}</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {/* zero baseline */}
          <line x1={padX} x2={W - padX} y1={zeroY} y2={zeroY} stroke="#E6EAF2" strokeWidth={1} strokeDasharray="3 3" />
          {/* line */}
          <polyline points={points} fill="none" stroke="#1A6BFF" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {/* dots + labels */}
          {rows.map((r, i) => (
            <g key={r.key}>
              <circle cx={x(i)} cy={y(r.sobra)} r={4} fill={r.sobra >= 0 ? '#00B37E' : '#F03E5E'} />
              <text x={x(i)} y={H - 10} textAnchor="middle" fontSize={10} fontWeight={600} fill="#6B7A95">{r.label}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Month list */}
      <div style={{ padding: '20px 20px 20px' }}>
        {rows.map((r) => {
          const isOpen = openKey === r.key
          const monthCompras = compras
            .filter(c => parcelaMes(c, r.mes, r.ano) > 0)
            .sort((a, b) => a.data.localeCompare(b.data))
          return (
            <div key={r.key} style={{ background: '#fff', borderRadius: 20, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenKey(isOpen ? null : r.key)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B2A' }}>{r.label} {r.ano}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7A95', marginTop: 2 }}>
                    Receitas {fmt(r.rec)} · Despesas {fmt(r.fix + r.comp)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: r.sobra >= 0 ? '#00B37E' : '#F03E5E' }}>{fmt(r.sobra)}</span>
                  <ChevronDown size={18} color="#B0B8C8" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '0 16px 16px' }}>
                  <div style={{ borderTop: '1px solid #F0F2F7', paddingTop: 12 }}>
                    {/* Receitas */}
                    <Row label="Receitas do mês" value={`+${fmt(r.rec)}`} color="#00B37E" bold />

                    {/* Fixos */}
                    {fixos.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <SectionLabel>Despesas fixas</SectionLabel>
                        {fixos.map(f => (
                          <Row key={f.id} label={f.desc} sub={`${f.cat} · dia ${f.dia}`} value={`−${fmt(f.valor)}`} color="#F03E5E" />
                        ))}
                      </div>
                    )}

                    {/* Compras / Parcelas */}
                    {monthCompras.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <SectionLabel>Compras e parcelas</SectionLabel>
                        {monthCompras.map(c => {
                          const amount = parcelaMes(c, r.mes, r.ano)
                          const parcInfo = c.tipo === 'parcelado' ? `parcela ${parcelaIndex(c.data, r.mes, r.ano)}/${c.nparc}` : 'à vista'
                          return (
                            <Row key={c.id} label={c.desc} sub={`${c.cat ?? 'outro'} · ${parcInfo}`} value={`−${fmt(amount)}`} color="#F03E5E" />
                          )
                        })}
                      </div>
                    )}

                    {fixos.length === 0 && monthCompras.length === 0 && (
                      <div style={{ fontSize: 13, color: '#B0B8C8', padding: '8px 0' }}>Nenhuma despesa neste mês</div>
                    )}

                    {/* Total */}
                    <div style={{ borderTop: '1px solid #F0F2F7', marginTop: 12, paddingTop: 12 }}>
                      <Row label="Sobra do mês" value={fmt(r.sobra)} color={r.sobra >= 0 ? '#00B37E' : '#F03E5E'} bold />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B8C8', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 6 }}>{children}</div>
}

function Row({ label, sub, value, color, bold }: { label: string; sub?: string; value: string; color: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '5px 0' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: bold ? 700 : 500, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#6B7A95' }}>{sub}</div>}
      </div>
      <span style={{ fontSize: 14, fontWeight: bold ? 800 : 600, color, flexShrink: 0 }}>{value}</span>
    </div>
  )
}
