import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Gastos from './pages/Gastos'
import Clientes from './pages/Clientes'

const DashboardPage = () => <Layout><Dashboard /></Layout>
const VentasPage = () => <Layout><Ventas /></Layout>
const GastosPage = () => <Layout><Gastos /></Layout>
const ClientesPage = () => <Layout><Clientes /></Layout>
const Productos = () => <Layout><div>Productos</div></Layout>

// Ruta protegida — redirige a login si no está autenticado
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div>Cargando...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  return <>{children}</>
}

// Ruta pública — redirige al dashboard si ya está autenticado
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
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/ventas" element={<ProtectedRoute><VentasPage /></ProtectedRoute>} />        
        <Route path="/gastos" element={<ProtectedRoute><GastosPage /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
        <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App