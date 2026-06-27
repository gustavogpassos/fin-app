export type TipoReceita = 'salario' | 'freelance' | 'outro'

export interface Receita {
  id: number
  desc: string
  valor: number
  tipo: TipoReceita
  valorMeses?: Record<string, number>
}

export type CategoriaFixo = 'moradia' | 'transporte' | 'saude' | 'educacao' | 'lazer' | 'outro'

export interface DespesaFixa {
  id: number
  desc: string
  valor: number
  cat: CategoriaFixo
  dia: number
}

export type TipoCompra = 'avista' | 'parcelado'

export type CategoriaCompra =
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'vestuario'
  | 'educacao'
  | 'casa'
  | 'outro'

export type Cartao = 'nubank' | 'inter' | 'itau' | 'bradesco' | 'xp' | 'c6' | 'outro'

export interface Compra {
  id: number
  desc: string
  data: string
  tipo: TipoCompra
  valor: number
  parcela: number
  nparc: number
  cartao?: Cartao
  cat?: CategoriaCompra
  obs?: string
}

export interface Meta {
  id: number
  mesAno: string
  valorMeta: number
}

export interface AppState {
  mesRef: number
  anoRef: number
  receitas: Receita[]
  fixos: DespesaFixa[]
  compras: Compra[]
  metas: Meta[]
  nid: number
  setMesRef: (mes: number) => void
  setAnoRef: (ano: number) => void
  addReceita: (r: Omit<Receita, 'id'>) => void
  updateReceita: (id: number, r: Partial<Omit<Receita, 'id'>>) => void
  removeReceita: (id: number) => void
  addFixo: (f: Omit<DespesaFixa, 'id'>) => void
  updateFixo: (id: number, f: Partial<Omit<DespesaFixa, 'id'>>) => void
  removeFixo: (id: number) => void
  addCompra: (c: Omit<Compra, 'id'>) => void
  updateCompra: (id: number, c: Partial<Omit<Compra, 'id'>>) => void
  removeCompra: (id: number) => void
  addMeta: (m: Omit<Meta, 'id'>) => void
  updateMeta: (id: number, m: Partial<Omit<Meta, 'id'>>) => void
  removeMeta: (id: number) => void
}
