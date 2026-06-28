import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, Receita, DespesaFixa, Compra, Cartao, Meta } from '../types'

const getDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open('finapp', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('kv')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

// ponytail: one-time migration from localStorage on first IDB miss
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await getDB()
    return new Promise((resolve) => {
      const r = db.transaction('kv').objectStore('kv').get(name)
      r.onsuccess = () => {
        if (r.result != null) { resolve(r.result); return }
        const ls = localStorage.getItem(name)
        if (ls) {
          idbStorage.setItem(name, ls).then(() => localStorage.removeItem(name))
        }
        resolve(ls)
      }
      r.onerror = () => resolve(null)
    })
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').put(value, name)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await getDB()
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readwrite')
      tx.objectStore('kv').delete(name)
      tx.oncomplete = () => resolve()
    })
  },
}

type StoreData = Omit<AppState,
  | 'setMesRef' | 'setAnoRef'
  | 'addReceita' | 'updateReceita' | 'removeReceita'
  | 'addFixo' | 'updateFixo' | 'removeFixo'
  | 'addCompra' | 'updateCompra' | 'removeCompra'
  | 'addCartao' | 'updateCartao' | 'removeCartao'
  | 'addMeta' | 'updateMeta' | 'removeMeta'
>

const now = new Date()

export const useFinStore = create<AppState>()(
  persist(
    (set, get) => ({
      mesRef: now.getMonth() + 1,
      anoRef: now.getFullYear(),
      receitas: [] as Receita[],
      fixos: [] as DespesaFixa[],
      compras: [] as Compra[],
      cartoes: [] as Cartao[],
      metas: [] as Meta[],
      nid: 1,

      setMesRef: (mes) => set({ mesRef: mes }),
      setAnoRef: (ano) => set({ anoRef: ano }),

      addReceita: (r) => {
        const nid = get().nid
        set((s) => ({ receitas: [...s.receitas, { ...r, id: nid }], nid: nid + 1 }))
      },
      updateReceita: (id, r) =>
        set((s) => ({ receitas: s.receitas.map((x) => (x.id === id ? { ...x, ...r } : x)) })),
      removeReceita: (id) =>
        set((s) => ({ receitas: s.receitas.filter((x) => x.id !== id) })),

      addFixo: (f) => {
        const nid = get().nid
        set((s) => ({ fixos: [...s.fixos, { ...f, id: nid }], nid: nid + 1 }))
      },
      updateFixo: (id, f) =>
        set((s) => ({ fixos: s.fixos.map((x) => (x.id === id ? { ...x, ...f } : x)) })),
      removeFixo: (id) =>
        set((s) => ({ fixos: s.fixos.filter((x) => x.id !== id) })),

      addCompra: (c) => {
        const nid = get().nid
        set((s) => ({ compras: [...s.compras, { ...c, id: nid }], nid: nid + 1 }))
      },
      updateCompra: (id, c) =>
        set((s) => ({ compras: s.compras.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCompra: (id) =>
        set((s) => ({ compras: s.compras.filter((x) => x.id !== id) })),

      addCartao: (c) => {
        const nid = get().nid
        set((s) => ({ cartoes: [...s.cartoes, { ...c, id: nid }], nid: nid + 1 }))
      },
      updateCartao: (id, c) =>
        set((s) => ({ cartoes: s.cartoes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      removeCartao: (id) =>
        set((s) => ({ cartoes: s.cartoes.filter((x) => x.id !== id) })),

      addMeta: (m) => {
        const nid = get().nid
        const existing = get().metas.find((x) => x.mesAno === m.mesAno)
        if (existing) {
          set((s) => ({ metas: s.metas.map((x) => (x.mesAno === m.mesAno ? { ...x, valorMeta: m.valorMeta } : x)) }))
        } else {
          set((s) => ({ metas: [...s.metas, { ...m, id: nid }], nid: nid + 1 }))
        }
      },
      updateMeta: (id, m) =>
        set((s) => ({ metas: s.metas.map((x) => (x.id === id ? { ...x, ...m } : x)) })),
      removeMeta: (id) =>
        set((s) => ({ metas: s.metas.filter((x) => x.id !== id) })),
    }),
    {
      name: 'fin2',
      storage: createJSONStorage(() => idbStorage),
      migrate: (persisted, _version) => {
        const data = persisted as Partial<StoreData>
        return {
          mesRef: data.mesRef ?? now.getMonth() + 1,
          anoRef: data.anoRef ?? now.getFullYear(),
          receitas: data.receitas ?? [],
          fixos: data.fixos ?? [],
          compras: data.compras ?? [],
          cartoes: data.cartoes ?? [],
          metas: data.metas ?? [],
          nid: data.nid ?? 1,
        } satisfies StoreData
      },
      version: 0,
    },
  ),
)
