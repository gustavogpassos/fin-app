import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/layout/BottomNav'
import { FAB } from './components/layout/FAB'
import { AddSheet } from './components/AddSheet'
import { ToastContainer } from './components/ui/Toast'
import { Dashboard } from './views/Dashboard'
import { Cartoes } from './views/Cartoes'
import { Extrato } from './views/Extrato'
import { Metas } from './views/Metas'

export default function App() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--nav-h)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/extrato" element={<Extrato />} />
            <Route path="/metas" element={<Metas />} />
          </Routes>
        </main>
        <FAB onClick={() => setAddOpen(true)} />
        <BottomNav />
      </div>
      <AddSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <ToastContainer />
    </BrowserRouter>
  )
}
