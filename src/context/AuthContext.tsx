import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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
}

function parseJwt(token: string): AuthUser {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
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
            throw new Error(err.error_description || 'Credenciales incorrectas')
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
            throw new Error(err.description || 'No se pudo crear la cuenta')
        }

        await login(email, password)
    }, [login])

    const logout = useCallback(() => {
        localStorage.removeItem('changuita_token')
        localStorage.removeItem('changuita_user')
        setToken(null)
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
    return ctx
}