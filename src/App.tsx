import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Registro from './pages/Registro'

const Dashboard = () => <Layout><div>Dashboard</div></Layout>
const Ventas = () => <Layout><div>Ventas</div></Layout>
const Gastos = () => <Layout><div>Gastos</div></Layout>
const Clientes = () => <Layout><div>Clientes</div></Layout>
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
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><Gastos /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App