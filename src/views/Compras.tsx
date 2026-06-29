import { useState } from 'react'
import { useFinStore } from '../store/useFinStore'
import { parcelaMes, totComprasMes } from '../utils/finance'
import { fmt, fmtDate } from '../utils/format'
import { Panel } from '../components/ui/Panel'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { BANCO_LABELS } from '../components/CartaoSheet'
import { Search, Pencil, Trash2 } from 'lucide-react'
import type { Compra, TipoCompra, CategoriaCompra } from '../types'

const CATS: CategoriaCompra[] = ['alimentacao', 'transporte', 'saude', 'lazer', 'vestuario', 'educacao', 'casa', 'outro']

interface PurchaseForm {
  desc: string
  data: string
  tipo: TipoCompra
  valor: string
  parcela: string
  nparc: string
  cartao: string
  cat: string
  obs: string
  fechamentoCartao: string
}

const emptyForm = (): PurchaseForm => ({
  desc: '',
  data: new Date().toISOString().slice(0, 10),
  tipo: 'avista',
  valor: '',
  parcela: '',
  nparc: '1',
  cartao: '',
  cat: '',
  obs: '',
  fechamentoCartao: '',
})

function formFromCompra(c: Compra): PurchaseForm {
  return {
    desc: c.desc,
    data: c.data,
    tipo: c.tipo,
    valor: String(c.valor),
    parcela: String(c.parcela),
    nparc: String(c.nparc),
    cartao: c.cartao != null ? String(c.cartao) : '',
    cat: c.cat ?? '',
    obs: c.obs ?? '',
    fechamentoCartao: c.fechamentoCartao ? String(c.fechamentoCartao) : '',
  }
}

interface PurchaseSheetProps {
  open: boolean
  onClose: () => void
  editing: Compra | null
}

export function PurchaseSheet({ open, onClose, editing }: PurchaseSheetProps) {
  const addCompra = useFinStore((s) => s.addCompra)
  const updateCompra = useFinStore((s) => s.updateCompra)
  const cartoes = useFinStore((s) => s.cartoes)
  const [form, setForm] = useState<PurchaseForm>(() => editing ? formFromCompra(editing) : emptyForm())

  const set = (k: keyof PurchaseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCartaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idStr = e.target.value
    const card = cartoes.find((c) => String(c.id) === idStr)
    setForm((f) => ({ ...f, cartao: idStr, fechamentoCartao: card?.fechamento ? String(card.fechamento) : '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nparc = parseInt(form.nparc) || 1
    const parcela = form.tipo === 'parcelado' ? parseFloat(form.parcela) || 0 : parseFloat(form.valor) || 0
    const valor = form.tipo === 'parcelado' ? parcela * nparc : parcela
    const payload = {
      desc: form.desc,
      data: form.data,
      tipo: form.tipo,
      valor,
      parcela,
      nparc,
      cartao: form.cartao ? parseInt(form.cartao) : undefined,
      cat: (form.cat || undefined) as CategoriaCompra | undefined,
      obs: form.obs || undefined,
      fechamentoCartao: parseInt(form.fechamentoCartao) || undefined,
    }
    if (editing) updateCompra(editing.id, payload)
    else addCompra(payload)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar compra' : 'Nova compra'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Descricao *</label>
          <input value={form.desc} onChange={set('desc')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Data</label>
            <input type="date" value={form.data} onChange={set('data')} />
          </div>
          <div>
            <label>Tipo</label>
            <select value={form.tipo} onChange={set('tipo')}>
              <option value="avista">A vista</option>
              <option value="parcelado">Parcelado</option>
            </select>
          </div>
        </div>
        {form.tipo === 'avista' ? (
          <div>
            <label>Valor (R$) *</label>
            <input type="number" step="0.01" value={form.valor} onChange={set('valor')} required />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Parcela (R$) *</label>
              <input type="number" step="0.01" value={form.parcela} onChange={set('parcela')} required />
            </div>
            <div>
              <label>N. parcelas *</label>
              <input type="number" min="1" value={form.nparc} onChange={set('nparc')} required />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Cartao</label>
            <select value={form.cartao} onChange={handleCartaoChange}>
              <option value="">Outro</option>
              {cartoes.map((c) => <option key={c.id} value={String(c.id)}>{c.apelido || BANCO_LABELS[c.banco]}</option>)}
            </select>
          </div>
          <div>
            <label>Categoria</label>
            <select value={form.cat} onChange={set('cat')}>
              <option value="">Nenhuma</option>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label>Observacao</label>
          <input value={form.obs} onChange={set('obs')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </BottomSheet>
  )
}

interface ComprasProps {
  sheetOpen: boolean
  onSheetClose: () => void
}

export function Compras({ sheetOpen, onSheetClose }: ComprasProps) {
  const state = useFinStore()
  const { mesRef, anoRef, compras: allCompras } = state
  const removeCompra = useFinStore((s) => s.removeCompra)

  const [search, setSearch] = useState('')
  const [cardFilter, setCardFilter] = useState('')
  const [editing, setEditing] = useState<Compra | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [sheetEditOpen, setSheetEditOpen] = useState(false)

  const visibleCompras = allCompras.filter((c) => {
    const inMonth = parcelaMes(c, mesRef, anoRef) > 0
    const matchSearch = !search || c.desc.toLowerCase().includes(search.toLowerCase())
    const matchCard = !cardFilter || c.cartao === parseInt(cardFilter)
    return inMonth && matchSearch && matchCard
  })

  const cartaoLabel = (id: number | undefined) => {
    if (id == null) return '-'
    const c = state.cartoes.find((ct) => ct.id === id)
    return c ? (c.apelido || BANCO_LABELS[c.banco]) : '-'
  }

  const totalMes = totComprasMes(state, mesRef, anoRef)
  const parcelado = visibleCompras
    .filter((c) => c.tipo === 'parcelado')
    .reduce((acc, c) => acc + parcelaMes(c, mesRef, anoRef), 0)
  const avista = visibleCompras
    .filter((c) => c.tipo === 'avista')
    .reduce((acc, c) => acc + parcelaMes(c, mesRef, anoRef), 0)

  const handleEdit = (c: Compra) => {
    setEditing(c)
    setSheetEditOpen(true)
  }

  const handleSheetClose = () => {
    onSheetClose()
    setEditing(null)
    setSheetEditOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">Total Mes</p>
          <p className="text-base font-semibold">{fmt(totalMes)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">Parcelado</p>
          <p className="text-base font-semibold text-[var(--blue)]">{fmt(parcelado)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">A vista</p>
          <p className="text-base font-semibold text-[var(--green)]">{fmt(avista)}</p>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input
            className="pl-8"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-32"
          value={cardFilter}
          onChange={(e) => setCardFilter(e.target.value)}
        >
          <option value="">Todos cartoes</option>
          {state.cartoes.map((c) => <option key={c.id} value={String(c.id)}>{c.apelido || BANCO_LABELS[c.banco]}</option>)}
        </select>
      </div>

      <Panel title={`Compras (${visibleCompras.length})`}>
        {visibleCompras.length === 0 ? (
          <p className="text-xs text-[var(--text-dim)]">Nenhuma compra no mes</p>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-[var(--text-dim)] border-b border-[var(--border)]">
                    <th className="text-left py-2 font-medium">Descricao</th>
                    <th className="text-left py-2 font-medium">Data</th>
                    <th className="text-left py-2 font-medium">Tipo</th>
                    <th className="text-right py-2 font-medium">Valor</th>
                    <th className="text-left py-2 font-medium">Cartao</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {visibleCompras.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                      <td className="py-2 max-w-[200px] truncate">{c.desc}</td>
                      <td className="py-2 text-[var(--text-dim)]">{fmtDate(c.data)}</td>
                      <td className="py-2">
                        <Badge variant={c.tipo === 'parcelado' ? 'blue' : 'green'}>
                          {c.tipo === 'parcelado' ? `${c.nparc}x` : 'A vista'}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-medium">{fmt(parcelaMes(c, mesRef, anoRef))}</td>
                      <td className="py-2 text-[var(--text-dim)]">{cartaoLabel(c.cartao)}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button className="text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer bg-transparent border-0 p-1" onClick={() => handleEdit(c)}>
                            <Pencil size={13} />
                          </button>
                          <button className="text-[var(--red)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setDeleteConfirm(c.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {visibleCompras.map((c) => (
                <div key={c.id} className="bg-[var(--surface)] rounded-[var(--r)] p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{c.desc}</p>
                    <p className="text-xs text-[var(--text-dim)]">{fmtDate(c.data)} &bull; {cartaoLabel(c.cartao)}</p>
                    <Badge variant={c.tipo === 'parcelado' ? 'blue' : 'green'} className="mt-1">
                      {c.tipo === 'parcelado' ? `${c.nparc}x` : 'A vista'}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold">{fmt(parcelaMes(c, mesRef, anoRef))}</span>
                    <div className="flex gap-1">
                      <button className="text-[var(--text-dim)] cursor-pointer bg-transparent border-0 p-1" onClick={() => handleEdit(c)}>
                        <Pencil size={13} />
                      </button>
                      <button className="text-[var(--red)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setDeleteConfirm(c.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>

      <PurchaseSheet
        open={sheetOpen || sheetEditOpen}
        onClose={handleSheetClose}
        editing={editing}
      />

      {deleteConfirm !== null && (
        <ConfirmModal
          message="Remover esta compra?"
          onConfirm={() => { removeCompra(deleteConfirm); setDeleteConfirm(null) }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
