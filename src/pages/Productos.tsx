import { useState, useEffect } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, getCategoriasProducto, crearCategoriaProducto, eliminarCategoriaProducto } from '../services/api'

type EstadoStock = 'AGOTADO' | 'BAJO STOCK' | 'ÓPTIMO'

interface ProductoAPI {
    id: number
    nombre: string
    descripcion?: string
    precio: string
    stockTotal: number
    stockMinimo: number
    activo: boolean
    categoriaId?: number
    categoria?: { id: number; nombre: string }
}

interface CategoriaAPI {
    id: number
    nombre: string
}

export default function Productos() {
    const { emprendimientoActivo } = useEmprendimiento()
    const [productos, setProductos] = useState<ProductoAPI[]>([])
    const [categorias, setCategorias] = useState<CategoriaAPI[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null)
    const [busqueda, setBusqueda] = useState('')

    // Modal producto
    const [mostrarModal, setMostrarModal] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [productoEditando, setProductoEditando] = useState<ProductoAPI | null>(null)

    // Modal categorías
    const [mostrarModalCategorias, setMostrarModalCategorias] = useState(false)
    const [eliminandoCategoria, setEliminandoCategoria] = useState<number | null>(null)

    // Formulario producto
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [precio, setPrecio] = useState('')
    const [stockTotal, setStockTotal] = useState('')
    const [stockMinimo, setStockMinimo] = useState('5')
    const [categoriaId, setCategoriaId] = useState<string>('')
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    // Nueva categoría inline
    const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
    const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState('')
    const [creandoCategoria, setCreandoCategoria] = useState(false)

    const cargarDatos = async () => {
        if (!emprendimientoActivo) return
        try {
            setLoading(true)
            const [productosData, categoriasData] = await Promise.all([
                getProductos(emprendimientoActivo.id),
                getCategoriasProducto(emprendimientoActivo.id),
            ])
            setProductos(productosData)
            setCategorias(categoriasData)
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { cargarDatos() }, [emprendimientoActivo])

    const limpiarFormulario = () => {
        setNombre(''); setDescripcion(''); setPrecio('')
        setStockTotal(''); setStockMinimo('5'); setCategoriaId('')
        setProductoEditando(null)
        setMostrarNuevaCategoria(false); setNombreNuevaCategoria('')
    }

    const abrirModalNuevo = () => {
        limpiarFormulario()
        setModoEdicion(false)
        setMostrarModal(true)
    }

    const abrirModalEdicion = (producto: ProductoAPI) => {
        setNombre(producto.nombre)
        setDescripcion(producto.descripcion || '')
        setPrecio(String(parseFloat(producto.precio)))
        setStockTotal(String(producto.stockTotal))
        setStockMinimo(String(producto.stockMinimo))
        setCategoriaId(producto.categoriaId ? String(producto.categoriaId) : '')
        setProductoEditando(producto)
        setModoEdicion(true)
        setMostrarModal(true)
    }

    const handleCrearCategoria = async () => {
        if (!emprendimientoActivo || !nombreNuevaCategoria.trim()) return
        try {
            setCreandoCategoria(true)
            const nueva = await crearCategoriaProducto(emprendimientoActivo.id, { nombre: nombreNuevaCategoria.trim() })
            setCategorias(prev => [...prev, nueva])
            setCategoriaId(String(nueva.id))
            setNombreNuevaCategoria('')
            setMostrarNuevaCategoria(false)
        } catch (err: any) {
            alert(err.message || 'Error al crear categoría')
        } finally {
            setCreandoCategoria(false)
        }
    }

    const handleEliminarCategoria = async (categoriaId: number, nombreCat: string) => {
        if (!emprendimientoActivo) return
        const productosEnCategoria = productos.filter(p => p.categoriaId === categoriaId).length
        if (productosEnCategoria > 0) {
            alert(`No podés eliminar "${nombreCat}" porque tiene ${productosEnCategoria} producto${productosEnCategoria > 1 ? 's' : ''} asignado${productosEnCategoria > 1 ? 's' : ''}.`)
            return
        }
        if (!window.confirm(`¿Seguro que querés eliminar la categoría "${nombreCat}"?`)) return
        try {
            setEliminandoCategoria(categoriaId)
            await eliminarCategoriaProducto(emprendimientoActivo.id, categoriaId)
            setCategorias(prev => prev.filter(c => c.id !== categoriaId))
            if (categoriaActiva === categoriaId) setCategoriaActiva(null)
        } catch (err: any) {
            alert(err.message || 'Error al eliminar categoría')
        } finally {
            setEliminandoCategoria(null)
        }
    }

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emprendimientoActivo || !nombre.trim() || !precio) return
        try {
            setGuardando(true)
            const data = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                precio: parseFloat(precio),
                stockTotal: parseInt(stockTotal) || 0,
                stockMinimo: parseInt(stockMinimo) || 5,
                categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
            }
            if (modoEdicion && productoEditando) {
                await actualizarProducto(emprendimientoActivo.id, productoEditando.id, data)
            } else {
                await crearProducto(emprendimientoActivo.id, data)
            }
            limpiarFormulario()
            setMostrarModal(false)
            await cargarDatos()
        } catch (err: any) {
            alert(err.message || 'Error al guardar producto')
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminar = async () => {
        if (!emprendimientoActivo || !productoEditando) return
        if (!window.confirm(`¿Seguro que querés eliminar "${productoEditando.nombre}"?`)) return
        try {
            setEliminando(true)
            await eliminarProducto(emprendimientoActivo.id, productoEditando.id)
            limpiarFormulario()
            setMostrarModal(false)
            await cargarDatos()
        } catch (err: any) {
            alert(err.message || 'Error al eliminar producto')
        } finally {
            setEliminando(false)
        }
    }

    const getEstadoStock = (producto: ProductoAPI): EstadoStock => {
        if (producto.stockTotal === 0) return 'AGOTADO'
        if (producto.stockTotal <= producto.stockMinimo) return 'BAJO STOCK'
        return 'ÓPTIMO'
    }

    const getStockConfig = (estado: EstadoStock) => {
        switch (estado) {
            case 'AGOTADO': return { color: '#ba1a1a', bg: 'rgba(255,218,214,0.3)', textColor: '#ba1a1a' }
            case 'BAJO STOCK': return { color: '#8a383e', bg: 'rgba(255,218,218,0.4)', textColor: '#8a383e' }
            case 'ÓPTIMO': return { color: '#006039', bg: '#cbe6d3', textColor: '#006039' }
        }
    }

    const totalUnidades = productos.reduce((acc, p) => acc + p.stockTotal, 0)
    const stockBajo = productos.filter(p => getEstadoStock(p) === 'BAJO STOCK').length
    const agotados = productos.filter(p => getEstadoStock(p) === 'AGOTADO').length

    const productosFiltrados = productos.filter(p => {
        const matchCategoria = categoriaActiva === null || p.categoriaId === categoriaActiva
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        return matchCategoria && matchBusqueda && p.activo
    })

    return (
        <div className="flex flex-col gap-8">

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="md:col-span-2 bg-[#006039] rounded-[16px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute bg-[rgba(255,255,255,0.1)] blur-[32px] bottom-[-40px] right-[-40px] rounded-full w-48 h-48" />
                    <div>
                        <p className="text-[rgba(255,255,255,0.7)] text-[12px] font-medium tracking-[1.2px] uppercase mb-2">Total de Inventario</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-[48px] font-extrabold leading-none">{totalUnidades.toLocaleString('es-AR')}</span>
                            <span className="text-[rgba(255,255,255,0.6)] text-[20px]">uds.</span>
                        </div>
                    </div>
                    <span className="bg-[rgba(255,255,255,0.2)] text-white text-[12px] px-3 py-1 rounded-full self-start">
                        {productos.length} productos activos
                    </span>
                </div>
                <div className="bg-white rounded-[16px] px-6 py-4 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[28px]">⚠️</span>
                        <span className="text-[#8a383e] text-[12px] font-bold tracking-[0.5px] uppercase">Acción Requerida</span>
                    </div>
                    <p className="text-[#191c1b] text-[30px] font-extrabold leading-tight">{stockBajo}</p>
                    <p className="text-[#6f7a71] text-[14px]">Productos con Stock Bajo</p>
                </div>
                <div className="bg-white rounded-[16px] px-6 py-4 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[28px]">🚫</span>
                        <span className="text-[#ba1a1a] text-[12px] font-bold tracking-[0.5px] uppercase">Crítico</span>
                    </div>
                    <p className="text-[#191c1b] text-[30px] font-extrabold leading-tight">{agotados}</p>
                    <p className="text-[#6f7a71] text-[14px]">Sin Existencias</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-[#191c1b] text-[24px] font-bold tracking-[-0.6px]">Gestión de Productos</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar producto..."
                            className="bg-[#f2f4f2] rounded-full px-4 py-2 text-[14px] text-[#191c1b] placeholder-[#6f7a71] outline-none focus:ring-2 focus:ring-[#006039]" />
                        <button onClick={() => setCategoriaActiva(null)}
                            className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${categoriaActiva === null ? 'bg-[#006039] text-white' : 'bg-[#cbe6d3] text-[#506859]'}`}>
                            Todos
                        </button>
                        {categorias.map((c) => (
                            <button key={c.id} onClick={() => setCategoriaActiva(c.id)}
                                className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${categoriaActiva === c.id ? 'bg-[#006039] text-white' : 'bg-[#cbe6d3] text-[#506859]'}`}>
                                {c.nombre}
                            </button>
                        ))}
                        {/* Botón gestionar categorías */}
                        <button onClick={() => setMostrarModalCategorias(true)}
                            className="px-4 py-2 rounded-full text-[14px] font-semibold bg-[#f2f4f2] text-[#3f4941] hover:bg-[#e6e9e7] transition-colors"
                            title="Gestionar categorías">
                            ⚙️ Categorías
                        </button>
                    </div>
                </div>

                <div className="bg-[#f2f4f2] rounded-[16px] overflow-hidden">
                    <div className="bg-[#e6e9e7] grid grid-cols-12 px-4 md:px-8 py-4">
                        <div className="col-span-8 md:col-span-5">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Producto</span>
                        </div>
                        <div className="hidden md:flex md:col-span-2 justify-center">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Categoría</span>
                        </div>
                        <div className="hidden md:flex md:col-span-2 justify-center">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Precio</span>
                        </div>
                        <div className="col-span-3 md:col-span-2 flex justify-center">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Stock</span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Acción</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-[#3f4941] text-[14px]">Cargando productos...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-[#ba1a1a] text-[14px]">{error}</p>
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <span className="text-[32px]">📦</span>
                            <p className="text-[#3f4941] text-[16px] font-bold">
                                {busqueda || categoriaActiva !== null ? 'No hay resultados' : 'No hay productos todavía'}
                            </p>
                            {!busqueda && categoriaActiva === null && (
                                <p className="text-[#6f7a71] text-[14px]">Agregá tu primer producto con el botón +</p>
                            )}
                        </div>
                    ) : (
                        productosFiltrados.map((producto, i) => {
                            const estado = getEstadoStock(producto)
                            const config = getStockConfig(estado)
                            return (
                                <div key={producto.id}
                                    className={`grid grid-cols-12 px-4 md:px-8 py-5 md:py-6 items-center ${i > 0 ? 'border-t border-[rgba(0,0,0,0.04)]' : ''}`}>
                                    <div className="col-span-8 md:col-span-5 flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e1e3e1] rounded-[12px] flex items-center justify-center text-[20px] shrink-0">📦</div>
                                        <div>
                                            <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{producto.nombre}</p>
                                            {producto.descripcion && (
                                                <p className="text-[#6f7a71] text-[12px] truncate max-w-[180px]">{producto.descripcion}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex md:col-span-2 justify-center">
                                        <span className="bg-[#cee9d6] text-[#344c3e] text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.5px] uppercase">
                                            {producto.categoria?.nombre || 'General'}
                                        </span>
                                    </div>
                                    <div className="hidden md:flex md:col-span-2 justify-center">
                                        <span className="text-[#006039] text-[16px] font-bold">
                                            ${parseFloat(producto.precio).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="col-span-3 md:col-span-2 flex flex-col items-center gap-1">
                                        <span className="font-extrabold text-[16px] md:text-[18px]" style={{ color: config.color }}>
                                            {producto.stockTotal}
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] uppercase"
                                            style={{ backgroundColor: config.bg, color: config.textColor }}>
                                            {estado}
                                        </span>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button onClick={() => abrirModalEdicion(producto)}
                                            className="p-2 rounded-full hover:bg-[#e6e9e7] transition-colors text-[#6f7a71]">
                                            ✏️
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* FAB */}
            <div className="fixed bottom-8 right-8 z-50">
                <button onClick={abrirModalNuevo}
                    className="w-16 h-16 bg-[#006039] rounded-full flex items-center justify-center text-white text-[24px] shadow-[0px_12px_16px_rgba(0,96,57,0.3)] hover:bg-[#1a7a4d] transition-colors"
                    title="Agregar Producto">
                    +
                </button>
            </div>

            {/* Modal producto */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] w-full max-w-[520px] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.2)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[#191c1b] text-[22px] font-extrabold">
                                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={() => { setMostrarModal(false); limpiarFormulario() }}
                                className="text-[#6f7a71] hover:text-[#191c1b] text-[18px]">✕</button>
                        </div>

                        <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Nombre *</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Yerba Mate 1kg" required
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Descripción (opcional)</label>
                                <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                                    placeholder="Ej: Marca Playadito, paquete 1kg"
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Precio *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#006039] font-bold">$</span>
                                        <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                                            placeholder="0" required
                                            className="bg-[#eceeec] rounded-[10px] pl-7 pr-3 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Stock actual</label>
                                    <input type="number" value={stockTotal} onChange={e => setStockTotal(e.target.value)}
                                        placeholder="0"
                                        className="bg-[#eceeec] rounded-[10px] px-3 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Stock mínimo</label>
                                    <input type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)}
                                        placeholder="5"
                                        className="bg-[#eceeec] rounded-[10px] px-3 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                </div>
                            </div>

                            {/* Categoría */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Categoría</label>
                                    <button type="button" onClick={() => setMostrarNuevaCategoria(!mostrarNuevaCategoria)}
                                        className="text-[#006039] text-[11px] font-bold hover:underline">
                                        + Nueva
                                    </button>
                                </div>

                                {mostrarNuevaCategoria && (
                                    <div className="flex gap-2">
                                        <input type="text" value={nombreNuevaCategoria} onChange={e => setNombreNuevaCategoria(e.target.value)}
                                            placeholder="Nombre de la categoría"
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCrearCategoria() } }}
                                            className="bg-[#eceeec] rounded-[8px] px-3 py-2 text-[13px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] flex-1" />
                                        <button type="button" onClick={handleCrearCategoria}
                                            disabled={creandoCategoria || !nombreNuevaCategoria.trim()}
                                            className="bg-[#006039] text-white px-3 py-2 rounded-[8px] text-[12px] font-bold disabled:opacity-50">
                                            {creandoCategoria ? '...' : 'Crear'}
                                        </button>
                                    </div>
                                )}

                                {categorias.length === 0 ? (
                                    <p className="text-[#6f7a71] text-[13px] italic">No hay categorías. Creá una arriba.</p>
                                ) : (
                                    <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)}
                                        className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full appearance-none">
                                        <option value="">Sin categoría</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                {modoEdicion && (
                                    <button type="button" onClick={handleEliminar} disabled={eliminando}
                                        className="px-4 py-2 rounded-[10px] text-[#ba1a1a] text-[14px] font-bold hover:bg-[#ffdada] transition-colors disabled:opacity-50">
                                        {eliminando ? 'Eliminando...' : '🗑️ Eliminar'}
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button type="button" onClick={() => { setMostrarModal(false); limpiarFormulario() }}
                                        className="px-5 py-3 rounded-[10px] text-[#3f4941] text-[15px] font-bold bg-[#f2f4f2]">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={guardando || !nombre.trim() || !precio}
                                        className="px-6 py-3 rounded-[10px] text-white text-[15px] font-bold disabled:opacity-50"
                                        style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                        {guardando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal gestión de categorías */}
            {mostrarModalCategorias && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] w-full max-w-[440px] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[#191c1b] text-[22px] font-extrabold">Gestionar Categorías</h2>
                            <button onClick={() => setMostrarModalCategorias(false)}
                                className="text-[#6f7a71] hover:text-[#191c1b] text-[18px]">✕</button>
                        </div>

                        {/* Crear nueva categoría */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Nueva Categoría</label>
                            <div className="flex gap-2">
                                <input type="text" value={nombreNuevaCategoria} onChange={e => setNombreNuevaCategoria(e.target.value)}
                                    placeholder="Ej: Bebidas, Lácteos..."
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCrearCategoria() } }}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] flex-1" />
                                <button onClick={handleCrearCategoria}
                                    disabled={creandoCategoria || !nombreNuevaCategoria.trim()}
                                    className="bg-[#006039] text-white px-4 py-3 rounded-[10px] text-[13px] font-bold disabled:opacity-50 whitespace-nowrap">
                                    {creandoCategoria ? '...' : '+ Crear'}
                                </button>
                            </div>
                        </div>

                        {/* Lista de categorías */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">
                                Categorías existentes ({categorias.length})
                            </label>
                            {categorias.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-2">
                                    <span className="text-[28px]">🏷️</span>
                                    <p className="text-[#6f7a71] text-[14px]">No hay categorías todavía</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                                    {categorias.map((cat) => {
                                        const cantProductos = productos.filter(p => p.categoriaId === cat.id).length
                                        return (
                                            <div key={cat.id}
                                                className="flex items-center justify-between bg-[#f8faf8] rounded-[10px] px-4 py-3 border border-[#eceeec]">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-[#cee9d6] text-[#344c3e] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                        {cat.nombre}
                                                    </span>
                                                    <span className="text-[#6f7a71] text-[12px]">
                                                        {cantProductos} producto{cantProductos !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                                                    disabled={eliminandoCategoria === cat.id}
                                                    className="p-1.5 rounded-[8px] hover:bg-[#ffdada] transition-colors text-[#ba1a1a] disabled:opacity-50 text-[14px]"
                                                    title={cantProductos > 0 ? 'Tiene productos asignados' : 'Eliminar categoría'}>
                                                    {eliminandoCategoria === cat.id ? '...' : '🗑️'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setMostrarModalCategorias(false)}
                            className="w-full py-3 rounded-[10px] bg-[#f2f4f2] text-[#3f4941] text-[15px] font-bold">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}