import { describe, it, expect } from 'vitest'
import { parcelaMes, saldoMes } from './finance'
import type { Compra, AppState } from '../types'

function makeCompra(overrides: Partial<Compra> = {}): Compra {
  return {
    id: 1,
    desc: 'Test',
    data: '2025-06-01',
    tipo: 'parcelado',
    valor: 1200,
    parcela: 100,
    nparc: 12,
    ...overrides,
  }
}

describe('parcelaMes', () => {
  it('returns installment amount in range', () => {
    const c = makeCompra({ data: '2025-06-01', parcela: 100, nparc: 3 })
    expect(parcelaMes(c, 6, 2025)).toBe(100)
  })

  it('returns installment in last month of range', () => {
    const c = makeCompra({ data: '2025-06-01', parcela: 100, nparc: 3 })
    expect(parcelaMes(c, 8, 2025)).toBe(100)
  })

  it('returns 0 before range', () => {
    const c = makeCompra({ data: '2025-06-01', parcela: 100, nparc: 3 })
    expect(parcelaMes(c, 5, 2025)).toBe(0)
  })

  it('returns 0 after range', () => {
    const c = makeCompra({ data: '2025-06-01', parcela: 100, nparc: 3 })
    expect(parcelaMes(c, 9, 2025)).toBe(0)
  })

  it('handles installment spanning year boundary', () => {
    const c = makeCompra({ data: '2025-12-01', parcela: 50, nparc: 3 })
    expect(parcelaMes(c, 1, 2026)).toBe(50)
    expect(parcelaMes(c, 2, 2026)).toBe(50)
    expect(parcelaMes(c, 3, 2026)).toBe(0)
  })
})

describe('saldoMes', () => {
  const baseState = {
    mesRef: 6,
    anoRef: 2025,
    receitas: [{ id: 1, desc: 'Salario', valor: 5000, tipo: 'salario' as const }],
    fixos: [{ id: 1, desc: 'Aluguel', valor: 1500, cat: 'moradia' as const, dia: 10 }],
    compras: [makeCompra({ data: '2025-06-01', parcela: 500, nparc: 1, tipo: 'avista', valor: 500 })],
  } satisfies Pick<AppState, 'receitas' | 'fixos' | 'compras' | 'mesRef' | 'anoRef'>

  it('returns positive balance when income exceeds expenses', () => {
    const result = saldoMes(baseState, 6, 2025)
    expect(result).toBe(3000) // 5000 - 1500 - 500
  })

  it('returns negative balance when expenses exceed income', () => {
    const state = {
      ...baseState,
      fixos: [{ id: 1, desc: 'Aluguel', valor: 6000, cat: 'moradia' as const, dia: 10 }],
    }
    const result = saldoMes(state, 6, 2025)
    expect(result).toBe(-1500) // 5000 - 6000 - 500
  })
})
