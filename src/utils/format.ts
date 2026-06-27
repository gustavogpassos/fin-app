export function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function fmtSigned(v: number): string {
  const s = fmt(Math.abs(v))
  return v >= 0 ? `+${s}` : `-${s}`
}

export function parseDt(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

export function fmtDate(iso: string): string {
  return parseDt(iso).toLocaleDateString('pt-BR')
}
