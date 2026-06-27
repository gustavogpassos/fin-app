import { useState } from 'react'
import { useFinStore } from '../store/useFinStore'
import { totReceitas, totFixos, diasParaVencer } from '../utils/finance'
import { fmt } from '../utils/format'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Receita, DespesaFixa, TipoReceita, CategoriaFixo } from '../types'

const TIPOS_RECEITA: TipoReceita[] = ['salario', 'freelance', 'outro']
const CATS_FIXO: CategoriaFixo[] = ['moradia', 'transporte', 'saude', 'educacao', 'lazer', 'outro']

function ReceitaModal({
  editing,
  onClose,
}: {
  editing: Receita | null
  onClose: () => void
}) {
  const addReceita = useFinStore((s) => s.addReceita)
  const updateReceita = useFinStore((s) => s.updateReceita)
  const mesRef = useFinStore((s) => s.mesRef)
  const anoRef = useFinStore((s) => s.anoRef)

  const mesAnoKey = `${anoRef}-${String(mesRef).padStart(2, '0')}`
  const mesOverride = editing?.valorMeses?.[mesAnoKey]

  const [desc, setDesc] = useState(editing?.desc ?? '')
  const [valor, setValor] = useState(String(editing?.valor ?? ''))
  const [tipo, setTipo] = useState<TipoReceita>(editing?.tipo ?? 'salario')
  const [override, setOverride] = useState(mesOverride !== undefined ? String(mesOverride) : '')
  const [useOverride, setUseOverride] = useState(mesOverride !== undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const valorNum = parseFloat(valor) || 0
    const valorMeses = editing?.valorMeses ? { ...editing.valorMeses } : {}
    if (useOverride && override) {
      valorMeses[mesAnoKey] = parseFloat(override)
    } else {
      delete valorMeses[mesAnoKey]
    }
    const payload = { desc, valor: valorNum, tipo, valorMeses: Object.keys(valorMeses).length ? valorMeses : undefined }
    if (editing) updateReceita(editing.id, payload)
    else addReceita({ desc, valor: valorNum, tipo })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[var(--card)] rounded-[var(--r)] p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-4">{editing ? 'Editar receita' : 'Nova receita'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label>Descricao</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <div>
            <label>Valor base (R$)</label>
            <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
          </div>
          <div>
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoReceita)}>
              {TIPOS_RECEITA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {editing && (
            <div className="border border-[var(--border)] rounded-[var(--r)] p-3 space-y-2">
              <p className="text-xs text-[var(--text-dim)] font-medium">Ajustar por mes ({mesAnoKey})</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="w-auto"
                  checked={useOverride}
                  onChange={(e) => setUseOverride(e.target.checked)}
                />
                Valor diferente neste mes
              </label>
              {useOverride && (
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor para este mes"
                  value={override}
                  onChange={(e) => setOverride(e.target.value)}
                />
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FixoModal({ editing, onClose }: { editing: DespesaFixa | null; onClose: () => void }) {
  const addFixo = useFinStore((s) => s.addFixo)
  const updateFixo = useFinStore((s) => s.updateFixo)

  const [desc, setDesc] = useState(editing?.desc ?? '')
  const [valor, setValor] = useState(String(editing?.valor ?? ''))
  const [cat, setCat] = useState<CategoriaFixo>(editing?.cat ?? 'outro')
  const [dia, setDia] = useState(String(editing?.dia ?? 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { desc, valor: parseFloat(valor) || 0, cat, dia: parseInt(dia) || 1 }
    if (editing) updateFixo(editing.id, payload)
    else addFixo(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-[var(--card)] rounded-[var(--r)] p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-4">{editing ? 'Editar fixo' : 'Novo fixo'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label>Descricao</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Valor (R$)</label>
              <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required />
            </div>
            <div>
              <label>Dia vencimento</label>
              <input type="number" min="1" max="31" value={dia} onChange={(e) => setDia(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Categoria</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as CategoriaFixo)}>
              {CATS_FIXO.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Fixos() {
  const state = useFinStore()
  const { receitas, fixos } = state
  const removeReceita = useFinStore((s) => s.removeReceita)
  const removeFixo = useFinStore((s) => s.removeFixo)

  const [receitaModal, setReceitaModal] = useState<Receita | null | 'new'>(null)
  const [fixoModal, setFixoModal] = useState<DespesaFixa | null | 'new'>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'receita' | 'fixo'; id: number } | null>(null)

  const totalReceitas = totReceitas(state)
  const totalFixos = totFixos(state)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Receitas"
          action={
            <Button size="sm" onClick={() => setReceitaModal('new')}>
              <Plus size={14} /> Adicionar
            </Button>
          }
        >
          <div className="space-y-2">
            {receitas.length === 0 && (
              <p className="text-xs text-[var(--text-dim)]">Nenhuma receita</p>
            )}
            {receitas.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{r.desc}</p>
                  <p className="text-xs text-[var(--text-dim)] capitalize">{r.tipo}</p>
                </div>
                <span className="text-sm font-medium text-[var(--green)] whitespace-nowrap">{fmt(r.valor)}</span>
                <div className="flex gap-1">
                  <button className="text-[var(--text-dim)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setReceitaModal(r)}>
                    <Pencil size={13} />
                  </button>
                  <button className="text-[var(--red)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setDeleteConfirm({ type: 'receita', id: r.id })}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-dim)]">Total</span>
            <span className="text-sm font-semibold text-[var(--green)]">{fmt(totalReceitas)}</span>
          </div>
        </Panel>

        <Panel
          title="Despesas Fixas"
          action={
            <Button size="sm" onClick={() => setFixoModal('new')}>
              <Plus size={14} /> Adicionar
            </Button>
          }
        >
          <div className="space-y-2">
            {fixos.length === 0 && (
              <p className="text-xs text-[var(--text-dim)]">Nenhuma despesa fixa</p>
            )}
            {fixos.map((f) => {
              const dias = diasParaVencer(f.dia)
              return (
                <div key={f.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{f.desc}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[var(--text-dim)] capitalize">{f.cat} &bull; dia {f.dia}</p>
                      {dias <= 3 && <Badge variant="red">Vence em {dias}d</Badge>}
                      {dias > 3 && dias <= 7 && <Badge variant="gold">Vence em {dias}d</Badge>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[var(--red)] whitespace-nowrap">{fmt(f.valor)}</span>
                  <div className="flex gap-1">
                    <button className="text-[var(--text-dim)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setFixoModal(f)}>
                      <Pencil size={13} />
                    </button>
                    <button className="text-[var(--red)] cursor-pointer bg-transparent border-0 p-1" onClick={() => setDeleteConfirm({ type: 'fixo', id: f.id })}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-dim)]">Total</span>
            <span className="text-sm font-semibold text-[var(--red)]">{fmt(totalFixos)}</span>
          </div>
        </Panel>
      </div>

      {receitaModal !== null && (
        <ReceitaModal
          editing={receitaModal === 'new' ? null : receitaModal}
          onClose={() => setReceitaModal(null)}
        />
      )}

      {fixoModal !== null && (
        <FixoModal
          editing={fixoModal === 'new' ? null : fixoModal}
          onClose={() => setFixoModal(null)}
        />
      )}

      {deleteConfirm !== null && (
        <ConfirmModal
          message={`Remover esta ${deleteConfirm.type === 'receita' ? 'receita' : 'despesa'}?`}
          onConfirm={() => {
            if (deleteConfirm.type === 'receita') removeReceita(deleteConfirm.id)
            else removeFixo(deleteConfirm.id)
            setDeleteConfirm(null)
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
