import { useState } from 'react'
import { Plus, Pencil, Trash2, Utensils, Car, Heart, Music, ShoppingBag, BookOpen, Home, Tag } from 'lucide-react'
import { useFinStore } from '../store/useFinStore'
import { parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'
import { CartaoSheet, BANCO_LABELS } from '../components/CartaoSheet'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import type { CategoriaCompra, Cartao } from '../types'

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

export function Cartoes() {
  const state = useFinStore()
  const { mesRef, anoRef, compras, cartoes } = state
  const removeCartao = useFinStore((s) => s.removeCartao)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Cartao | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const faturaBanco = (banco: string) =>
    compras.reduce((acc, c) => (c.cartao === banco ? acc + parcelaMes(c, mesRef, anoRef) : acc), 0)

  const billItems = [...compras]
    .filter(c => c.cartao && parcelaMes(c, mesRef, anoRef) > 0)
    .sort((a, b) => b.data.localeCompare(a.data))

  const openNew = () => { setEditing(null); setSheetOpen(true) }
  const openEdit = (c: Cartao) => { setEditing(c); setSheetOpen(true) }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A', letterSpacing: '-0.5px' }}>Meus Cartões</div>
        <button onClick={openNew} aria-label="Novo cartão" style={{ width: 36, height: 36, borderRadius: 12, background: '#1A6BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </button>
      </div>

      {cartoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 14, color: '#B0B8C8', fontWeight: 500, marginBottom: 16 }}>Nenhum cartão cadastrado</div>
          <button onClick={openNew} style={{ background: '#1A6BFF', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Cadastrar cartão
          </button>
        </div>
      ) : (
        cartoes.map(card => {
          const fatura = faturaBanco(card.banco)
          const available = Math.max(0, card.limite - fatura)
          return (
            <div key={card.id} style={{ marginBottom: 4 }}>
              {/* Credit Card Visual */}
              <div style={{ margin: '0 20px', padding: 22, background: 'linear-gradient(135deg,#1E3A8A 0%,#1A6BFF 58%,#60A5FA 100%)', borderRadius: 24, position: 'relative', overflow: 'hidden', height: 200, boxSizing: 'border-box' as const }}>
                <div style={{ position: 'absolute', right: -20, top: -50, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: 30, bottom: -60, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div style={{ width: 42, height: 30, background: 'linear-gradient(135deg,#F6D860,#C8970A)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 2, padding: 5, boxSizing: 'border-box' as const }}>
                    <div style={{ background: 'rgba(150,100,0,0.35)', borderRadius: 2, gridColumn: 'span 2' }} />
                    <div style={{ background: 'rgba(150,100,0,0.35)', borderRadius: 2 }} />
                    <div style={{ background: 'rgba(150,100,0,0.35)', borderRadius: 2 }} />
                    <div style={{ background: 'rgba(150,100,0,0.35)', borderRadius: 2, gridColumn: 'span 2' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(card)} aria-label="Editar cartão" style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Pencil size={14} color="#fff" />
                    </button>
                    <button onClick={() => setDeleteId(card.id)} aria-label="Remover cartão" style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Trash2 size={14} color="#fff" />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.88)', letterSpacing: 3, marginBottom: 20 }}>•••• •••• •••• ••••</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 3 }}>Cartão</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{card.apelido || BANCO_LABELS[card.banco]}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'rgba(255,255,255,0.92)', letterSpacing: 1, fontStyle: 'italic', flexShrink: 0, marginLeft: 12 }}>
                    {BANCO_LABELS[card.banco]}
                  </span>
                </div>
              </div>

              {/* Card Stats */}
              <div style={{ display: 'flex', gap: 10, padding: '16px 20px 20px' }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '14px 10px', textAlign: 'center' as const, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7A95', textTransform: 'uppercase' as const, letterSpacing: 0.3, marginBottom: 5 }}>Limite</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0D1B2A' }}>{fmt(card.limite)}</div>
                </div>
                <div style={{ flex: 1, background: '#EEF3FF', borderRadius: 18, padding: '14px 10px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7A95', textTransform: 'uppercase' as const, letterSpacing: 0.3, marginBottom: 5 }}>Disponível</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1A6BFF' }}>{fmt(available)}</div>
                </div>
                <div style={{ flex: 1, background: '#FEEAEE', borderRadius: 18, padding: '14px 10px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7A95', textTransform: 'uppercase' as const, letterSpacing: 0.3, marginBottom: 5 }}>Fatura</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#F03E5E' }}>{fmt(fatura)}</div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Bill Section */}
      {cartoes.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 12px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0D1B2A' }}>Fatura atual</div>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            {billItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 14, color: '#B0B8C8', fontWeight: 500 }}>
                Nenhuma compra no cartão neste mês
              </div>
            ) : (
              billItems.map(c => {
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
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#6B7A95' }}>{c.cartao ? BANCO_LABELS[c.cartao] : '—'} · {c.data}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F03E5E', flexShrink: 0 }}>−{fmt(amount)}</div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <CartaoSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditing(null) }} editing={editing} />

      {deleteId !== null && (
        <ConfirmModal
          message="Remover este cartão?"
          onConfirm={() => { removeCartao(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
