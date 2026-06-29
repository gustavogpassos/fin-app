import type { Compra, AppState, Receita } from '../types'

export function parcelaMes(compra: Compra, mes: number, ano: number): number {
  const dt = new Date(compra.data + 'T00:00:00')
  let startMes = dt.getMonth() + 1
  let startAno = dt.getFullYear()

  // Shift billing to next month when purchase is after card's closing date
  if (compra.fechamentoCartao && dt.getDate() > compra.fechamentoCartao) {
    startMes++
    if (startMes > 12) { startMes = 1; startAno++ }
  }

  if (compra.tipo === 'avista') {
    return startMes === mes && startAno === ano ? compra.valor : 0
  }

  const startTotal = startAno * 12 + startMes - 1
  const targetTotal = ano * 12 + mes - 1
  const diff = targetTotal - startTotal

  if (diff < 0 || diff >= compra.nparc) return 0
  return compra.parcela
}

function receitaMes(r: Receita, mes: number, ano: number): number {
  const key = `${ano}-${String(mes).padStart(2, '0')}`
  if (r.valorMeses && key in r.valorMeses) return r.valorMeses[key]
  return r.valor
}

export function totReceitas(state: Pick<AppState, 'receitas' | 'mesRef' | 'anoRef'>): number {
  return state.receitas.reduce((acc, r) => acc + receitaMes(r, state.mesRef, state.anoRef), 0)
}

export function totFixos(state: Pick<AppState, 'fixos'>): number {
  return state.fixos.reduce((acc, f) => acc + f.valor, 0)
}

export function totComprasMes(
  state: Pick<AppState, 'compras'>,
  mes: number,
  ano: number,
): number {
  return state.compras.reduce((acc, c) => acc + parcelaMes(c, mes, ano), 0)
}

export function saldoMes(
  state: Pick<AppState, 'receitas' | 'fixos' | 'compras' | 'mesRef' | 'anoRef'>,
  mes: number,
  ano: number,
): number {
  const rec = state.receitas.reduce((acc, r) => acc + receitaMes(r, mes, ano), 0)
  const fix = totFixos(state)
  const comp = totComprasMes(state, mes, ano)
  return rec - fix - comp
}

export function diasParaVencer(dia: number): number {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dia)
  let target = thisMonth

  if (thisMonth < today) {
    target = new Date(today.getFullYear(), today.getMonth() + 1, dia)
  }

  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}
