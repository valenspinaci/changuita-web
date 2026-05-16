import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'

// Páginas (las vamos a crear mañana)
const Login = () => <div>Login</div>
const Dashboard = () => <div>Dashboard</div>
const Ventas = () => <div>Ventas</div>
const Gastos = () => <div>Gastos</div>
const Clientes = () => <div>Clientes</div>
const Productos = () => <div>Productos</div>

// Ruta protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div>Cargando...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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