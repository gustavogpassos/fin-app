import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useMediaQuery } from './hooks/useMediaQuery'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import { MobileTopbar } from './components/layout/MobileTopbar'
import { FAB } from './components/layout/FAB'
import { ConfirmModal } from './components/ui/ConfirmModal'
import { ToastContainer, showToast } from './components/ui/Toast'
import { Dashboard } from './views/Dashboard'
import { Compras } from './views/Compras'
import { Fixos } from './views/Fixos'
import { Evolucao } from './views/Evolucao'
import { Simulador } from './views/Simulador'
import { importData } from './utils/dataIO'

function AppLayout() {
  const isMobile = useMediaQuery('(max-width: 600px)')
  const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false)
  const [importConfirm, setImportConfirm] = useState(false)
  const pendingFile = useRef<File | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setPurchaseSheetOpen(true)
      }
      if (e.key === 'Escape') {
        setPurchaseSheetOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    pendingFile.current = file
    setImportConfirm(true)
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    setImportConfirm(false)
    if (!pendingFile.current) return
    const result = await importData(pendingFile.current)
    pendingFile.current = null
    if (result === 'success') showToast('Dados importados com sucesso!', 'success')
    else showToast('Arquivo invalido. Nenhum dado foi alterado.', 'error')
  }

  const content = (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/compras" element={<Compras sheetOpen={purchaseSheetOpen} onSheetClose={() => setPurchaseSheetOpen(false)} />} />
      <Route path="/fixos" element={<Fixos />} />
      <Route path="/evolucao" element={<Evolucao />} />
      <Route path="/simulador" element={<Simulador />} />
    </Routes>
  )

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          <MobileTopbar />
          <main
            className="flex-1 overflow-y-auto p-4"
            style={{ paddingTop: 'calc(52px + 16px)', paddingBottom: 'calc(var(--nav-h) + 16px)' }}
          >
            {content}
          </main>
          <BottomNav />
          <FAB onClick={() => setPurchaseSheetOpen(true)} />
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar onImport={handleImportClick} />
          <main className="flex-1 overflow-y-auto p-6">
            {content}
          </main>
        </div>
      )}

      {importConfirm && (
        <ConfirmModal
          message="Importar este arquivo? Todos os dados atuais serao substituidos."
          onConfirm={handleImportConfirm}
          onCancel={() => { setImportConfirm(false); pendingFile.current = null }}
        />
      )}

      <ToastContainer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
