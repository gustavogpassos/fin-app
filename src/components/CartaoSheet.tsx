import { useState } from 'react'
import { useFinStore } from '../store/useFinStore'
import { BottomSheet } from './ui/BottomSheet'
import { Button } from './ui/Button'
import type { Cartao, BancoCartao } from '../types'

export const BANCO_LABELS: Record<BancoCartao, string> = {
  nubank: 'Nubank', inter: 'Inter', itau: 'Itaú',
  bradesco: 'Bradesco', xp: 'XP', c6: 'C6 Bank', outro: 'Outro',
}

const BANCOS = Object.keys(BANCO_LABELS) as BancoCartao[]

interface CartaoSheetProps {
  open: boolean
  onClose: () => void
  editing: Cartao | null
}

export function CartaoSheet({ open, onClose, editing }: CartaoSheetProps) {
  const { addCartao, updateCartao } = useFinStore()
  const [banco, setBanco] = useState<BancoCartao>(editing?.banco ?? 'nubank')
  const [apelido, setApelido] = useState(editing?.apelido ?? '')
  const [limite, setLimite] = useState(editing ? String(editing.limite) : '')
  const [fechamento, setFechamento] = useState(editing?.fechamento ? String(editing.fechamento) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      banco,
      apelido: apelido.trim() || undefined,
      limite: parseFloat(limite) || 0,
      fechamento: parseInt(fechamento) || undefined,
    }
    if (editing) updateCartao(editing.id, payload)
    else addCartao(payload)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar cartão' : 'Novo cartão'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Banco</label>
          <select value={banco} onChange={(e) => setBanco(e.target.value as BancoCartao)}>
            {BANCOS.map((b) => <option key={b} value={b}>{BANCO_LABELS[b]}</option>)}
          </select>
        </div>
        <div>
          <label>Apelido (opcional)</label>
          <input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Ex: Cartão principal" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Limite (R$) *</label>
            <input type="number" step="0.01" min="0" value={limite} onChange={(e) => setLimite(e.target.value)} required autoFocus />
          </div>
          <div>
            <label>Fechamento (dia)</label>
            <input type="number" min="1" max="31" value={fechamento} onChange={(e) => setFechamento(e.target.value)} placeholder="Ex: 15" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </BottomSheet>
  )
}
