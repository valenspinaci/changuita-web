const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

let getTokenFn: (() => Promise<string>) | null = null

export const setTokenGetter = (fn: () => Promise<string>) => {
    getTokenFn = fn
}

const getHeaders = async () => {
    const token = getTokenFn ? await getTokenFn() : null
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

const request = async (method: string, path: string, body?: unknown) => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(error?.error || 'Error en la API')
    }
    return res.json()
}

// ── Emprendimientos ──────────────────────────────────────────
export const getMisEmprendimientos = () => request('GET', '/emprendimientos')
export const crearEmprendimiento = (data: { nombre: string; descripcion?: string }) =>
    request('POST', '/emprendimientos', data)

// ── Ventas ──────────────────────────────────────────────────
export const getVentas = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/ventas`)
export const crearVenta = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/ventas`, data)

// ── Gastos ──────────────────────────────────────────────────
export const getGastos = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/gastos`)
export const crearGasto = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/gastos`, data)

// ── Clientes ─────────────────────────────────────────────────
export const getClientes = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/clientes`)
export const crearCliente = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/clientes`, data)

// ── Productos ─────────────────────────────────────────────────
export const getProductos = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/productos`)
export const crearProducto = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/productos`, data)

// ── Pedidos ──────────────────────────────────────────────────
export const getPedidos = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/pedidos`)