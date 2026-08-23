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
export const actualizarEmprendimiento = (id: number, data: { nombre?: string; descripcion?: string }) =>
    request('PUT', `/emprendimientos/${id}`, data)

// ── Perfil ───────────────────────────────────────────────────
export const actualizarPerfil = (data: { nombre: string }) => request('PUT', '/auth/me', data)

// ── Módulos ──────────────────────────────────────────────────
export const getModulos = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/modulos`)
export const toggleModulo = (emprendimientoId: number, moduloId: number, habilitado: boolean) =>
    request('PATCH', `/emprendimientos/${emprendimientoId}/modulos/${moduloId}`, { habilitado })

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
// Note: crearProducto is already declared above in the Productos section.
// Duplicate declaration removed to avoid "cannot redeclare block-scoped variable 'crearProducto'" error.

// ── Pedidos ──────────────────────────────────────────────────
export const getPedidos = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/pedidos`)

export const actualizarEstadoVenta = (emprendimientoId: number, ventaId: number, estado: string) =>
    request('PATCH', `/emprendimientos/${emprendimientoId}/ventas/${ventaId}/estado`, { estado })

export const eliminarVenta = (emprendimientoId: number, ventaId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/ventas/${ventaId}`)

export const getCategorias = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/categorias-gasto`)

export const crearCategoria = (emprendimientoId: number, data: { nombre: string }) =>
    request('POST', `/emprendimientos/${emprendimientoId}/categorias-gasto`, data)

export const eliminarCategoria = (emprendimientoId: number, categoriaId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/categorias-gasto/${categoriaId}`)

export const eliminarGasto = (emprendimientoId: number, gastoId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/gastos/${gastoId}`)

export const eliminarCliente = (emprendimientoId: number, clienteId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/clientes/${clienteId}`)

export const actualizarCliente = (emprendimientoId: number, clienteId: number, data: unknown) =>
    request('PUT', `/emprendimientos/${emprendimientoId}/clientes/${clienteId}`, data)

export const crearProducto = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/productos`, data)

export const actualizarProducto = (emprendimientoId: number, productoId: number, data: unknown) =>
    request('PUT', `/emprendimientos/${emprendimientoId}/productos/${productoId}`, data)

export const eliminarProducto = (emprendimientoId: number, productoId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/productos/${productoId}`)

export const getCategoriasProducto = (emprendimientoId: number) =>
    request('GET', `/emprendimientos/${emprendimientoId}/categorias-producto`)

export const crearCategoriaProducto = (emprendimientoId: number, data: { nombre: string }) =>
    request('POST', `/emprendimientos/${emprendimientoId}/categorias-producto`, data)

export const eliminarCategoriaProducto = (emprendimientoId: number, categoriaId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/categorias-producto/${categoriaId}`)

export const crearPedido = (emprendimientoId: number, data: unknown) =>
    request('POST', `/emprendimientos/${emprendimientoId}/pedidos`, data)

export const actualizarEstadoPedido = (emprendimientoId: number, pedidoId: number, estado: string) =>
    request('PATCH', `/emprendimientos/${emprendimientoId}/pedidos/${pedidoId}/estado`, { estado })

export const actualizarPedido = (emprendimientoId: number, pedidoId: number, data: unknown) =>
    request('PUT', `/emprendimientos/${emprendimientoId}/pedidos/${pedidoId}`, data)

export const eliminarPedido = (emprendimientoId: number, pedidoId: number) =>
    request('DELETE', `/emprendimientos/${emprendimientoId}/pedidos/${pedidoId}`)

export const descontarStock = (emprendimientoId: number, productoId: number, cantidad: number) =>
  request('PATCH', `/emprendimientos/${emprendimientoId}/productos/${productoId}/stock`, { cantidad })