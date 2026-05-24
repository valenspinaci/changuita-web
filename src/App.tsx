import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import React from 'react'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Gastos from './pages/Gastos'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import { EmprendimientoProvider, useEmprendimiento } from './context/EmprendimientoContext'
import SeleccionEmprendimiento from './pages/SeleccionEmprendimiento'
import Pedidos from './pages/Pedidos'

// Wrapper interno que usa el contexto
const ProtectedContent = () => {
  const { emprendimientoActivo, loading } = useEmprendimiento()
  if (loading) return <div>Cargando...</div>
  if (!emprendimientoActivo) return <SeleccionEmprendimiento />
  return <Outlet />
}

// Ruta protegida — monta el provider UNA sola vez
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div>Cargando...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  return (
    <EmprendimientoProvider>
      <ProtectedContent />
    </EmprendimientoProvider>
  )
}

// Ruta pública
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div>Cargando...</div>
  if (isAuthenticated) return <Navigate to="/" />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/ventas" element={<Layout><Ventas /></Layout>} />
          <Route path="/gastos" element={<Layout><Gastos /></Layout>} />
          <Route path="/clientes" element={<Layout><Clientes /></Layout>} />
          <Route path="/productos" element={<Layout><Productos /></Layout>} />
          <Route path="/pedidos" element={<Layout><Pedidos /></Layout>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App