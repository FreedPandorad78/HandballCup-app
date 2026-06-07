import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/ui/Navbar'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'

import HomePage from './pages/public/HomePage'
import FixturePage from './pages/public/FixturePage'
import EstadisticasPage from './pages/public/EstadisticasPage'

import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import CategoriasPage from './pages/admin/CategoriasPage'
import EquiposPage from './pages/admin/EquiposPage'
import JugadoresPage from './pages/admin/JugadoresPage'
import FixtureAdminPage from './pages/admin/FixtureAdminPage'
import PlanillaPage from './pages/admin/PlanillaPage'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/fixture" element={<FixturePage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
          </Route>

          {/* Admin protegido */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="equipos" element={<EquiposPage />} />
            <Route path="jugadores" element={<JugadoresPage />} />
            <Route path="fixture" element={<FixtureAdminPage />} />
            <Route path="planilla/:partidoId" element={<PlanillaPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
