import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getMisEmprendimientos, getModulos, toggleModulo, setTokenGetter } from '../services/api'

interface Emprendimiento {
    id: number
    nombre: string
    descripcion?: string
    logoUrl?: string
}

export interface Modulo {
    id: number
    nombre: string
    descripcion?: string
    habilitado: boolean
}

interface EmprendimientoContextType {
    emprendimientoActivo: Emprendimiento | null
    emprendimientos: Emprendimiento[]
    setEmprendimientoActivo: (e: Emprendimiento) => void
    loading: boolean
    recargar: () => Promise<void>
    modulos: Modulo[]
    moduloHabilitado: (nombre: string) => boolean
    cambiarModulo: (moduloId: number, habilitado: boolean) => Promise<void>
}

const EmprendimientoContext = createContext<EmprendimientoContextType | null>(null)

export const EmprendimientoProvider = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth()
    const [emprendimientos, setEmprendimientos] = useState<Emprendimiento[]>([])
    const [emprendimientoActivo, setEmprendimientoActivo] = useState<Emprendimiento | null>(null)
    const [loading, setLoading] = useState(true)
    const [modulos, setModulos] = useState<Modulo[]>([])

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

    useEffect(() => {
        if (!emprendimientoActivo) {
            setModulos([])
            return
        }
        getModulos(emprendimientoActivo.id)
            .then(setModulos)
            .catch(err => console.error('Error cargando módulos:', err))
    }, [emprendimientoActivo])

    // Mientras no cargaron los módulos, no ocultamos nada (evita parpadeo/menú vacío)
    const moduloHabilitado = useCallback((nombre: string) => {
        if (modulos.length === 0) return true
        const modulo = modulos.find(m => m.nombre === nombre)
        return modulo ? modulo.habilitado : true
    }, [modulos])

    const cambiarModulo = useCallback(async (moduloId: number, habilitado: boolean) => {
        if (!emprendimientoActivo) return
        await toggleModulo(emprendimientoActivo.id, moduloId, habilitado)
        setModulos(prev => prev.map(m => m.id === moduloId ? { ...m, habilitado } : m))
    }, [emprendimientoActivo])

    return (
        <EmprendimientoContext.Provider
            value={{
                emprendimientoActivo, emprendimientos, setEmprendimientoActivo, loading, recargar,
                modulos, moduloHabilitado, cambiarModulo,
            }}
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