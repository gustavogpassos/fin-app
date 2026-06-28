import { useState } from 'react'
import { useFinStore } from '../store/useFinStore'
import { totReceitas, totComprasMes, saldoMes, parcelaMes } from '../utils/finance'
import { fmt } from '../utils/format'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Panel } from '../components/ui/Panel'
import type { TipoCompra, CategoriaCompra, BancoCartao, Compra } from '../types'

const CARTOES: BancoCartao[] = ['nubank', 'inter', 'itau', 'bradesco', 'xp', 'c6', 'outro']
const CATS: CategoriaCompra[] = ['alimentacao', 'transporte', 'saude', 'lazer', 'vestuario', 'educacao', 'casa', 'outro']

const MES_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function Simulador() {
  const state = useFinStore()
  const { mesRef, anoRef } = state

  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<TipoCompra>('avista')
  const [nparc, setNparc] = useState('1')
  const [cartao, setCartao] = useState('')
  const [cat, setCat] = useState('')

  const valorNum = parseFloat(valor) || 0
  const nParcNum = parseInt(nparc) || 1
  const parcela = tipo === 'avista' ? valorNum : valorNum / nParcNum

  const simCompra: Compra = {
    id: -1,
    desc: desc || 'Simulacao',
    data: `${anoRef}-${String(mesRef).padStart(2, '0')}-01`,
    tipo,
    valor: valorNum,
    parcela,
    nparc: nParcNum,
    cartao: (cartao || undefined) as BancoCartao | undefined,
    cat: (cat || undefined) as CategoriaCompra | undefined,
  }

  const simParcelaMes = parcelaMes(simCompra, mesRef, anoRef)
  const currentSaldo = saldoMes(state, mesRef, anoRef)
  const newSaldo = currentSaldo - simParcelaMes
  const currentCompras = totComprasMes(state, mesRef, anoRef)
  const newCompras = currentCompras + simParcelaMes
  const receitas = totReceitas(state)
  const impacto = receitas > 0 ? (simParcelaMes / receitas) * 100 : 0
  const viavel = newSaldo >= 0

  const projection = Array.from({ length: 24 }, (_, i) => {
    const total = anoRef * 12 + mesRef - 1 + i
    const projAno = Math.floor(total / 12)
    const projMes = (total % 12) + 1
    const simVal = parcelaMes(simCompra, projMes, projAno)
    const base = saldoMes(state, projMes, projAno)
    return { mes: projMes, ano: projAno, saldo: base - simVal }
  })

  return (
    <div className="space-y-4">
      <div className="bg-[var(--card)] rounded-[var(--r)] p-4 space-y-3">
        <h3 className="text-sm font-semibold">Simular compra</h3>
        <div>
          <label>Descricao</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Nome da compra" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Valor total (R$)</label>
            <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoCompra)}>
              <option value="avista">A vista</option>
              <option value="parcelado">Parcelado</option>
            </select>
          </div>
        </div>
        {tipo === 'parcelado' && (
          <div>
            <label>N. parcelas</label>
            <input type="number" min="1" value={nparc} onChange={(e) => setNparc(e.target.value)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Cartao</label>
            <select value={cartao} onChange={(e) => setCartao(e.target.value)}>
              <option value="">Nenhum</option>
              {CARTOES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Categoria</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Nenhuma</option>
              {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {valorNum > 0 && (
        <>
          <div className="flex items-center gap-3">
            <Badge variant={viavel ? 'green' : 'red'}>
              {viavel ? 'Viavel' : 'Inviavel'}
            </Badge>
            <span className="text-xs text-[var(--text-dim)]">
              {tipo === 'parcelado' ? `${nParcNum}x de ${fmt(parcela)}` : `A vista ${fmt(valorNum)}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-[var(--text-dim)] mb-1">Parcela este mes</p>
              <p className="text-base font-semibold text-[var(--blue)]">{fmt(simParcelaMes)}</p>
            </Card>
            <Card accent={newSaldo >= 0 ? 'green' : 'red'}>
              <p className="text-xs text-[var(--text-dim)] mb-1">Novo saldo</p>
              <p className={`text-base font-semibold ${newSaldo >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {fmt(newSaldo)}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-[var(--text-dim)] mb-1">Novo total compras</p>
              <p className="text-base font-semibold">{fmt(newCompras)}</p>
            </Card>
            <Card>
              <p className="text-xs text-[var(--text-dim)] mb-1">Impacto na renda</p>
              <p className="text-base font-semibold">{impacto.toFixed(1)}%</p>
            </Card>
          </div>

          <Panel title="Projecao 24 meses">
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {projection.map(({ mes, ano, saldo }, i) => (
                <div
                  key={i}
                  className={`flex justify-between text-sm px-2 py-1 rounded ${saldo < 0 ? 'bg-[var(--red)]/10' : ''}`}
                >
                  <span className="text-[var(--text-dim)]">{MES_NAMES[mes - 1]}/{ano}</span>
                  <span className={saldo >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                    {fmt(saldo)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
