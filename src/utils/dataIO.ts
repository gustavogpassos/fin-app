import { useFinStore } from '../store/useFinStore'

export function exportData() {
  const state = useFinStore.getState()
  const { mesRef, anoRef, receitas, fixos, compras, metas, nid } = state
  const data = { mesRef, anoRef, receitas, fixos, compras, metas, nid }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `finapp-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const REQUIRED_KEYS = ['receitas', 'fixos', 'compras', 'nid', 'mesRef']

export function importData(file: File): Promise<'success' | 'error'> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        if (!REQUIRED_KEYS.every((k) => k in parsed)) {
          resolve('error')
          return
        }
        useFinStore.setState({
          mesRef: parsed.mesRef,
          anoRef: parsed.anoRef ?? new Date().getFullYear(),
          receitas: parsed.receitas,
          fixos: parsed.fixos,
          compras: parsed.compras,
          metas: parsed.metas ?? [],
          nid: parsed.nid,
        })
        resolve('success')
      } catch {
        resolve('error')
      }
    }
    reader.readAsText(file)
  })
}
