import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { actualizarPerfil } from '../services/api'

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN!
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID!
const AUTH0_AUDIENCE = process.env.REACT_APP_AUTH0_AUDIENCE!
const API_URL = process.env.REACT_APP_API_URL!

interface AuthUser {
    sub: string
    email?: string
    name?: string
    picture?: string
}

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    logout: () => void
    actualizarNombre: (nombre: string) => Promise<void>
}

function parseJwt(token: string): AuthUser {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
}

const NOMBRES_TIPO_CARACTER: Record<string, string> = {
    lowerCase: 'minúsculas',
    upperCase: 'mayúsculas',
    numbers: 'números',
    specialCharacters: 'caracteres especiales',
}

function describirRegla(rule: any): string | null {
    if (rule.verified !== false) return null
    if (rule.code === 'lengthAtLeast') {
        return `al menos ${rule.format?.[0]} caracteres`
    }
    if (rule.code === 'containsAtLeast' && Array.isArray(rule.items)) {
        const faltantes = rule.items
            .filter((i: any) => i.verified === false)
            .map((i: any) => NOMBRES_TIPO_CARACTER[i.code] || i.message)
        if (faltantes.length > 0) {
            return `combinar ${rule.format?.[0]} tipos de caracteres (te falta: ${faltantes.join(', ')})`
        }
    }
    return null
}

function extractAuth0ErrorMessage(err: any, fallback: string): string {
    // Auth0 usa este código genérico tanto para "el email ya existe" como para
    // bloqueos de la connection, sin exponer el motivo real por seguridad.
    if (err?.code === 'invalid_signup') {
        return 'Ya existe una cuenta con este correo electrónico. Iniciá sesión en su lugar.'
    }

    // PasswordStrengthError: description es un objeto con las reglas incumplidas, no un string
    if (err?.code === 'invalid_password' && Array.isArray(err?.description?.rules)) {
        const detalles = err.description.rules
            .map(describirRegla)
            .filter((d: string | null): d is string => Boolean(d))
        if (detalles.length > 0) {
            return `La contraseña es muy débil: necesita ${detalles.join(' y ')}.`
        }
        return 'La contraseña no cumple los requisitos de seguridad.'
    }

    if (typeof err?.description === 'string') return err.description
    if (typeof err?.message === 'string') return err.message
    return fallback
}

function extractAuth0LoginErrorMessage(err: any): string {
    if (err?.error === 'too_many_attempts') {
        return 'Demasiados intentos fallidos. Tu cuenta quedó bloqueada temporalmente por seguridad — probá de nuevo en unos minutos.'
    }
    if (err?.error === 'unauthorized' && /blocked/i.test(err?.error_description ?? '')) {
        return 'Tu cuenta está bloqueada. Contactanos si creés que es un error.'
    }
    if (err?.error === 'invalid_grant') {
        return 'Correo o contraseña incorrectos.'
    }
    if (typeof err?.error_description === 'string') return err.error_description
    return 'No pudimos iniciar sesión. Intentá de nuevo.'
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('changuita_token')
        const savedUser = localStorage.getItem('changuita_user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const saveSession = (accessToken: string, authUser: AuthUser) => {
        localStorage.setItem('changuita_token', accessToken)
        localStorage.setItem('changuita_user', JSON.stringify(authUser))
        setToken(accessToken)
        setUser(authUser)
    }

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'password',
                username: email,
                password,
                audience: AUTH0_AUDIENCE,
                scope: 'openid profile email',
                client_id: AUTH0_CLIENT_ID,
            }),
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(extractAuth0LoginErrorMessage(err))
        }

        const data = await res.json()
        const authUser = parseJwt(data.access_token)
        saveSession(data.access_token, authUser)

        // POST /auth/sync justo después del login
        await fetch(`${API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.access_token}`,
            },
        })
    }, [])

    const register = useCallback(async (email: string, password: string, name: string) => {
        const res = await fetch(`https://${AUTH0_DOMAIN}/dbconnections/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: AUTH0_CLIENT_ID,
                email,
                password,
                name,
                connection: 'Username-Password-Authentication',
            }),
        })

        if (!res.ok) {
            const err = await res.json()
            throw new Error(extractAuth0ErrorMessage(err, 'No se pudo crear la cuenta'))
        }

        await login(email, password)
    }, [login])

    const logout = useCallback(() => {
        localStorage.removeItem('changuita_token')
        localStorage.removeItem('changuita_user')
        setToken(null)
        setUser(null)
    }, [])

    const actualizarNombre = useCallback(async (nombre: string) => {
        await actualizarPerfil({ nombre })
        setUser(prev => {
            if (!prev) return prev
            const actualizado = { ...prev, name: nombre }
            localStorage.setItem('changuita_user', JSON.stringify(actualizado))
            return actualizado
        })
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, actualizarNombre }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return ctx
}