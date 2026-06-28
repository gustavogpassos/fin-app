import { useState } from 'react'
import { ShoppingBag, Banknote, Repeat, CreditCard } from 'lucide-react'
import { BottomSheet } from './ui/BottomSheet'
import { PurchaseSheet } from '../views/Compras'
import { ReceitaModal, FixoModal } from '../views/Fixos'
import { CartaoSheet } from './CartaoSheet'

type Form = 'compra' | 'receita' | 'fixo' | 'cartao' | null

const OPTIONS: { key: Exclude<Form, null>; label: string; desc: string; Icon: React.ElementType; color: string; bg: string }[] = [
  { key: 'compra',  label: 'Nova compra',  desc: 'Gasto à vista ou parcelado', Icon: ShoppingBag, color: '#1A6BFF', bg: '#EEF3FF' },
  { key: 'receita', label: 'Nova receita', desc: 'Salário, freelance...',      Icon: Banknote,    color: '#00B37E', bg: '#E8F8F2' },
  { key: 'fixo',    label: 'Despesa fixa', desc: 'Conta recorrente mensal',    Icon: Repeat,      color: '#F03E5E', bg: '#FEEAEE' },
  { key: 'cartao',  label: 'Novo cartão',  desc: 'Cadastrar cartão e limite',  Icon: CreditCard,  color: '#7C3AED', bg: '#F3EEFF' },
]

interface AddSheetProps {
  open: boolean
  onClose: () => void
}

export function AddSheet({ open, onClose }: AddSheetProps) {
  const [form, setForm] = useState<Form>(null)

  const close = () => { setForm(null); onClose() }

  return (
    <>
      <BottomSheet open={open && form === null} onClose={onClose} title="O que deseja adicionar?">
        <div className="space-y-3 space-x-3">
          {OPTIONS.map(({ key, label, desc, Icon, color, bg }) => (
            <button
              key={key}
              onClick={() => setForm(key)}
              className="flex items-center gap-3 w-full text-left p-3 rounded-2xl bg-[var(--surface)] border-0 cursor-pointer hover:opacity-80"
            >
              <span style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text)]">{label}</span>
                <span className="block text-xs text-[var(--text-dim)]">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <PurchaseSheet open={open && form === 'compra'} onClose={close} editing={null} />
      {open && form === 'receita' && <ReceitaModal editing={null} onClose={close} />}
      {open && form === 'fixo' && <FixoModal editing={null} onClose={close} />}
      <CartaoSheet open={open && form === 'cartao'} onClose={close} editing={null} />
    </>
  )
}
