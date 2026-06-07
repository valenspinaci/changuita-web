import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getMisEmprendimientos, setTokenGetter } from '../services/api'

interface Emprendimiento {
    id: number
    nombre: string
    descripcion?: string
    logoUrl?: string
}

interface EmprendimientoContextType {
    emprendimientoActivo: Emprendimiento | null
    emprendimientos: Emprendimiento[]
    setEmprendimientoActivo: (e: Emprendimiento) => void
    loading: boolean
    recargar: () => Promise<void>
}

const EmprendimientoContext = createContext<EmprendimientoContextType | null>(null)

export const EmprendimientoProvider = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth()
    const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([])
    const [emprendimientoActivo, setEmprendimientoActivo] = useState<Emprendimiento | null>(null)
    const [loading, setLoading] = useState(true)

    const recargar = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getMisEmprendimientos()
            setEmprendimientos(data)
        } catch (err) {
            console.error('Error cargando emprendimientos:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        setTokenGetter(() => Promise.resolve(token))
        recargar()
    }, [token, recargar])

    return (
        <EmprendimientoContext.Provider
            value={{ emprendimientoActivo, emprendimientos, setEmprendimientoActivo, loading, recargar }}
        >
            {children}
        </EmprendimientoContext.Provider>
    )
}

export const useEmprendimiento = () => {
    const ctx = useContext(EmprendimientoContext)
    if (!ctx) throw new Error('useEmprendimiento debe usarse dentro de EmprendimientoProvider')
    return ctx
}