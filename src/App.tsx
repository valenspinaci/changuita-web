import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import React from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/LoadingScreen'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Gastos from './pages/Gastos'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Pedidos from './pages/Pedidos'
import Reportes from './pages/Reportes'
import ProximamentePage from './components/ProximamentePage'
import { EmprendimientoProvider, useEmprendimiento } from './context/EmprendimientoContext'
import SeleccionEmprendimiento from './pages/SeleccionEmprendimiento'
import { useAuth } from './context/AuthContext'

const ProtectedContent = () => {
    const { emprendimientoActivo, loading } = useEmprendimiento()
    if (loading) return <LoadingScreen />
    if (!emprendimientoActivo) return <SeleccionEmprendimiento />
    return <Outlet />
}

const ProtectedRoute = () => {
    const { token, loading } = useAuth()
    if (loading) return <LoadingScreen />
    if (!token) return <Navigate to="/login" />
    return (
        <EmprendimientoProvider>
            <ProtectedContent />
        </EmprendimientoProvider>
    )
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, loading } = useAuth()
    if (loading) return <LoadingScreen />
    if (token) return <Navigate to="/" />
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
                    <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
                    <Route path="/integraciones" element={
                        <Layout><ProximamentePage titulo="Integraciones" emoji="🔗" descripcion="Conectá tu negocio con MercadoPago, TiendaNube y WhatsApp. Muy pronto." /></Layout>
                    } />
                    <Route path="/perfil" element={
                        <Layout><ProximamentePage titulo="Mi Perfil" emoji="👤" descripcion="Gestioná tu cuenta y configuración personal." /></Layout>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App