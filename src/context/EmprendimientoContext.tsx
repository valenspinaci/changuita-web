import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
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
    const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0()
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
        // Esperamos que Auth0 termine de inicializar
        if (authLoading) return

        // Si no está autenticado, no hacemos nada
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

const init = async () => {
    try {
        setLoading(true)
        const token = await getAccessTokenSilently({
            authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        })

        if (token) {
            setTokenGetter(() =>
                getAccessTokenSilently({
                    authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
                })
            )
            await recargar()
        }
    } catch (err) {
        console.error('Error inicializando:', err)
        setLoading(false)
    }
}

        init()
    }, [isAuthenticated, authLoading, getAccessTokenSilently, recargar])

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