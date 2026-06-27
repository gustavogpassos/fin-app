import { useState } from 'react'
import { useFinStore } from '../store/useFinStore'
import { totReceitas, totFixos, totComprasMes, saldoMes, parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'
import { Card } from '../components/ui/Card'
import { Panel } from '../components/ui/Panel'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Target } from 'lucide-react'

function MetaModal({ onClose }: { onClose: () => void }) {
  const mesRef = useFinStore((s) => s.mesRef)
  const anoRef = useFinStore((s) => s.anoRef)
  const metas = useFinStore((s) => s.metas)
  const addMeta = useFinStore((s) => s.addMeta)
  const removeMeta = useFinStore((s) => s.removeMeta)

  const key = `${anoRef}-${String(mesRef).padStart(2, '0')}`
  const existing = metas.find((m) => m.mesAno === key)
  const [valor, setValor] = useState(existing ? String(existing.valorMeta) : '')

  const handleSave = () => {
    const v = parseFloat(valor)
    if (isNaN(v) || v <= 0) return
    addMeta({ mesAno: key, valorMeta: v })
    onClose()
  }

  const handleRemove = () => {
    if (existing) removeMeta(existing.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-[var(--card)] rounded-[var(--r)] p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-4">Meta do mês</h2>
        <div className="mb-4">
          <label>Valor da meta (R$)</label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            autoFocus
          />
        </div>
        <div className="flex justify-between gap-2">
          {existing && (
            <Button variant="danger" size="sm" onClick={handleRemove}>Remover</Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const state = useFinStore()
  const { mesRef, anoRef, metas, compras: allCompras } = state

  const receitas = totReceitas(state)
  const fixos = totFixos(state)
  const compras = totComprasMes(state, mesRef, anoRef)
  const saldo = saldoMes(state, mesRef, anoRef)

  const [showMetaModal, setShowMetaModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const removeCompra = useFinStore((s) => s.removeCompra)

  const key = `${anoRef}-${String(mesRef).padStart(2, '0')}`
  const meta = metas.find((m) => m.mesAno === key)

  const comprasByCard = allCompras.reduce<Record<string, number>>((acc, c) => {
    if (c.tipo !== 'parcelado' || !c.cartao) return acc
    const val = parcelaMes(c, mesRef, anoRef)
    if (val > 0) acc[c.cartao] = (acc[c.cartao] ?? 0) + val
    return acc
  }, {})

  const comprasByCat = allCompras.reduce<Record<string, number>>((acc, c) => {
    if (!c.cat) return acc
    const val = parcelaMes(c, mesRef, anoRef)
    if (val > 0) acc[c.cat] = (acc[c.cat] ?? 0) + val
    return acc
  }, {})

  const sortedCats = Object.entries(comprasByCat).sort(([, a], [, b]) => b - a)
  const maxCat = sortedCats[0]?.[1] ?? 1

  const recent8 = [...allCompras].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">Receitas</p>
          <p className="text-lg font-semibold text-[var(--green)]">{fmt(receitas)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">Fixos</p>
          <p className="text-lg font-semibold text-[var(--red)]">{fmt(fixos)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--text-dim)] mb-1">Compras</p>
          <p className="text-lg font-semibold text-[var(--blue)]">{fmt(compras)}</p>
        </Card>
        <Card accent={saldo >= 0 ? 'green' : 'red'}>
          <p className="text-xs text-[var(--text-dim)] mb-1">Saldo</p>
          <p className={`text-lg font-semibold ${saldo >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {fmt(saldo)}
          </p>
        </Card>
      </div>

      {meta ? (
        <Panel
          title="Meta do mês"
          action={
            <Button variant="ghost" size="sm" onClick={() => setShowMetaModal(true)}>
              <Target size={14} /> Editar
            </Button>
          }
        >
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-dim)]">
              <span>Saldo atual</span>
              <span>{fmt(Math.max(0, saldo))} / {fmt(meta.valorMeta)}</span>
            </div>
            <ProgressBar
              value={Math.max(0, saldo)}
              max={meta.valorMeta}
              color={saldo >= meta.valorMeta ? 'var(--green)' : 'var(--gold)'}
            />
            {saldo >= meta.valorMeta && (
              <p className="text-xs text-[var(--green)]">Meta atingida!</p>
            )}
          </div>
        </Panel>
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowMetaModal(true)}>
            <Target size={14} /> Definir meta
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Parcelas por cartão">
          {Object.keys(comprasByCard).length === 0 ? (
            <p className="text-xs text-[var(--text-dim)]">Nenhuma parcela no mês</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(comprasByCard).map(([card, val]) => (
                <div key={card} className="flex justify-between text-sm">
                  <span className="capitalize">{card}</span>
                  <span className="text-[var(--blue)]">{fmt(val)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Gastos por categoria">
          {sortedCats.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)]">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {sortedCats.map(([cat, val]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{cat}</span>
                    <span>{fmt(val)}</span>
                  </div>
                  <ProgressBar value={val} max={maxCat} color="var(--blue)" />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Ultimas 8 compras">
        {recent8.length === 0 ? (
          <p className="text-xs text-[var(--text-dim)]">Nenhuma compra registrada</p>
        ) : (
          <div className="space-y-2">
            {recent8.map((c) => (
              <div key={c.id} className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm truncate">{c.desc}</p>
                  <p className="text-xs text-[var(--text-dim)]">{c.data}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium whitespace-nowrap">
                    {fmt(c.tipo === 'avista' ? c.valor : c.parcela)}
                  </span>
                  <button
                    className="text-[var(--red)] text-sm cursor-pointer bg-transparent border-0 leading-none"
                    onClick={() => setDeleteConfirm(c.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {showMetaModal && <MetaModal onClose={() => setShowMetaModal(false)} />}

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
