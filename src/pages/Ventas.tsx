import { useState, useEffect, useRef } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getVentas, crearVenta, actualizarEstadoVenta, eliminarVenta } from '../services/api'

type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

interface VentaAPI {
    id: number
    estado: string
    total: string
    fecha: string
    notas?: string
    detalles: any[]
    cliente?: { nombre: string }
}

// Componente fila con swipe mobile y acciones desktop
function FilaVenta({
    venta,
    index,
    onEliminar,
    eliminando,
    onCambiarEstado,
    actualizando,
    formatFecha,
    formatMonto,
    getBadgeEstado,
    getLabelEstado,
}: {
    venta: VentaAPI
    index: number
    onEliminar: (id: number) => void
    eliminando: number | null
    onCambiarEstado: (id: number, estado: string) => void
    actualizando: boolean
    formatFecha: (f: string) => string
    formatMonto: (m: string) => string
    getBadgeEstado: (e: string) => string
    getLabelEstado: (e: string) => string
}) {
    const [swipeX, setSwipeX] = useState(0)
    const [editandoEstado, setEditandoEstado] = useState(false)
    const startX = useRef(0)
    const THRESHOLD = 80

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        const diff = e.touches[0].clientX - startX.current
        if (diff < 0) setSwipeX(Math.max(diff, -THRESHOLD - 20))
        else setSwipeX(Math.min(diff, 0))
    }

    const handleTouchEnd = () => {
        if (swipeX < -THRESHOLD / 2) setSwipeX(-THRESHOLD)
        else setSwipeX(0)
    }

    return (
        <div className={`relative overflow-hidden ${index > 0 ? 'border-t border-[rgba(230,233,231,0.5)]' : ''}`}>

            {/* Botón eliminar detrás — solo mobile */}
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-[80px] bg-[#ba1a1a] flex items-center justify-center">
                <button onClick={() => onEliminar(venta.id)} disabled={eliminando === venta.id}
                    className="flex flex-col items-center gap-1 text-white">
                    <span className="text-[20px]">🗑️</span>
                    <span className="text-[10px] font-bold">Eliminar</span>
                </button>
            </div>

            {/* Fila */}
            <div
                className="grid grid-cols-12 px-4 md:px-6 py-4 items-center bg-[#f2f4f2] transition-transform"
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Detalle */}
                <div className="col-span-7 md:col-span-4 flex items-center gap-3">
                    <div className="hidden md:flex w-10 h-10 bg-[#cee9d6] rounded-[8px] items-center justify-center text-[18px] shrink-0">🛒</div>
                    <div>
                        <p className="text-[#191c1b] text-[13px] md:text-[14px] font-bold leading-tight">
                            {venta.notas || `Venta #${venta.id}`}
                        </p>
                        <p className="text-[#3f4941] text-[11px] md:text-[12px]">{formatFecha(venta.fecha)}</p>
                    </div>
                </div>

                {/* Monto */}
                <div className="col-span-3 md:col-span-2 text-right">
                    <p className="text-[#191c1b] text-[13px] md:text-[14px] font-extrabold">{formatMonto(venta.total)}</p>
                </div>

                {/* Estado desktop — clickeable */}
                <div className="hidden md:flex md:col-span-3 justify-center relative">
                    <div className="relative">
                        <button
                            onClick={() => setEditandoEstado(!editandoEstado)}
                            className={`px-3 py-1 rounded-full text-[12px] font-bold ${getBadgeEstado(venta.estado)}`}
                        >
                            {getLabelEstado(venta.estado)} ▾
                        </button>
                        {editandoEstado && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-[12px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] z-50 min-w-[160px] overflow-hidden border border-[#eceeec]">
                                {['COBRADA', 'PENDIENTE', 'CANCELADA'].map(estado => (
                                    <button key={estado} disabled={actualizando || venta.estado === estado}
                                        onClick={() => { onCambiarEstado(venta.id, estado); setEditandoEstado(false) }}
                                        className={`w-full text-left px-4 py-2.5 text-[12px] font-bold transition-colors hover:bg-[#f8faf8] ${venta.estado === estado ? 'opacity-40 cursor-default' : ''}`}
                                    >
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${estado === 'COBRADA' ? 'bg-[#344c3e]' : estado === 'PENDIENTE' ? 'bg-[#856404]' : 'bg-[#7b2c33]'}`} />
                                        {venta.estado === estado ? '✓ ' : ''}{getLabelEstado(estado)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones desktop — lápiz y tacho */}
                <div className="hidden md:flex md:col-span-3 justify-end gap-2">
                    <button
                        onClick={() => setEditandoEstado(!editandoEstado)}
                        className="p-2 rounded-[8px] hover:bg-[#e6e9e7] transition-colors text-[#506859]"
                        title="Editar estado"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onEliminar(venta.id)}
                        disabled={eliminando === venta.id}
                        className="p-2 rounded-[8px] hover:bg-[#ffdada] transition-colors text-[#ba1a1a] disabled:opacity-50"
                        title="Eliminar venta"
                    >
                        🗑️
                    </button>
                </div>

                {/* Indicador swipe — solo mobile */}
                <div className="col-span-2 md:hidden flex justify-end">
                    <span className="text-[#bec9bf] text-[18px]">‹</span>
                </div>
            </div>
        </div>
    )
}

export default function Ventas() {
    const { emprendimientoActivo } = useEmprendimiento()
    const [ventas, setVentas] = useState<VentaAPI[]>([])
    const [loadingVentas, setLoadingVentas] = useState(true)
    const [errorVentas, setErrorVentas] = useState('')

    // Formulario
    const [producto, setProducto] = useState('')
    const [cliente, setCliente] = useState('')
    const [cantidad, setCantidad] = useState('1')
    const [precio, setPrecio] = useState('')
    const [cobrado, setCobrado] = useState(false)
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
    const [guardando, setGuardando] = useState(false)
    const [actualizando, setActualizando] = useState(false)
    const [eliminando, setEliminando] = useState<number | null>(null)

    const cargarVentas = async () => {
        if (!emprendimientoActivo) return
        try {
            setLoadingVentas(true)
            const data = await getVentas(emprendimientoActivo.id)
            setVentas(data)
        } catch (err: any) {
            setErrorVentas(err.message || 'Error al cargar ventas')
        } finally {
            setLoadingVentas(false)
        }
    }

    useEffect(() => { cargarVentas() }, [emprendimientoActivo])

    const handleConfirmar = async () => {
        if (!emprendimientoActivo || !precio) return
        try {
            setGuardando(true)
            await crearVenta(emprendimientoActivo.id, {
                total: parseFloat(precio) * parseInt(cantidad),
                notas: producto,
                estado: cobrado ? 'COBRADA' : 'PENDIENTE',
                detalles: [],
            })
            setProducto(''); setCliente(''); setCantidad('1'); setPrecio(''); setCobrado(false); setMetodoPago('efectivo')
            await cargarVentas()
        } catch (err: any) {
            alert(err.message || 'Error al registrar venta')
        } finally {
            setGuardando(false)
        }
    }

    const handleActualizarEstado = async (ventaId: number, nuevoEstado: string) => {
        if (!emprendimientoActivo) return
        try {
            setActualizando(true)
            await actualizarEstadoVenta(emprendimientoActivo.id, ventaId, nuevoEstado)
            await cargarVentas()
        } catch (err: any) {
            alert(err.message || 'Error al actualizar estado')
        } finally {
            setActualizando(false)
        }
    }

    const handleEliminar = async (ventaId: number) => {
        if (!emprendimientoActivo) return
        if (!window.confirm('¿Seguro que querés eliminar esta venta?')) return
        try {
            setEliminando(ventaId)
            await eliminarVenta(emprendimientoActivo.id, ventaId)
            await cargarVentas()
        } catch (err: any) {
            alert(err.message || 'Error al eliminar venta')
        } finally {
            setEliminando(null)
        }
    }

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha)
        const esHoy = d.toDateString() === new Date().toDateString()
        if (esHoy) return `Hoy, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }

    const formatMonto = (monto: string) => `$${parseFloat(monto).toLocaleString('es-AR')}`

    const getBadgeEstado = (estado: string) => {
        switch (estado) {
            case 'COBRADA': return 'bg-[#cee9d6] text-[#344c3e]'
            case 'PENDIENTE': return 'bg-[#fff3cd] text-[#856404]'
            case 'CANCELADA': return 'bg-[#ffdada] text-[#7b2c33]'
            default: return 'bg-[#eceeec] text-[#3f4941]'
        }
    }

    const getLabelEstado = (estado: string) => {
        switch (estado) {
            case 'COBRADA': return 'Completado'
            case 'PENDIENTE': return 'Pendiente'
            case 'CANCELADA': return 'Cancelado'
            default: return estado
        }
    }

    const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === new Date().toDateString())
    const totalHoy = ventasHoy.reduce((acc, v) => acc + parseFloat(v.total), 0)
    const ticketPromedio = ventas.length > 0 ? ventas.reduce((acc, v) => acc + parseFloat(v.total), 0) / ventas.length : 0

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            <div className="flex flex-col gap-1">
                <h1 className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold tracking-[-0.75px] leading-tight">Ventas</h1>
                <p className="text-[#3f4941] text-[16px] font-medium">Registrá los ingresos de hoy en tu emprendimiento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Formulario */}
                <div className="md:col-span-5 bg-white rounded-[12px] p-6 md:p-8 shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#cbe6d3] rounded-full flex items-center justify-center text-[18px]">🛒</div>
                        <h2 className="text-[#191c1b] text-[20px] font-bold">¿Qué vendiste?</h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">Producto o Concepto</label>
                            <input type="text" value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej. Pan, Leche, Yerba..."
                                className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">Cliente</label>
                            <input type="text" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej. Juan Perez"
                                className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">Cantidad</label>
                                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">Precio Unitario</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f4941] text-[16px]">$</span>
                                    <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00"
                                        className="bg-[#eceeec] rounded-[8px] pl-8 pr-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-4 rounded-[12px] cursor-pointer transition-colors ${cobrado ? 'bg-[#cbe6d3]' : 'bg-[#f2f4f2]'}`} onClick={() => setCobrado(!cobrado)}>
                            <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors shrink-0 ${cobrado ? 'bg-[#006039] border-[#006039]' : 'border-[#bec9bf] bg-white'}`}>
                                {cobrado && <span className="text-white text-[12px] font-bold">✓</span>}
                            </div>
                            <span className={`text-[14px] font-bold ${cobrado ? 'text-[#006039]' : 'text-[#3f4941]'}`}>Ya fue cobrada</span>
                        </div>

                        {cobrado && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">Método de Pago</label>
                                <div className="flex gap-2">
                                    {(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[]).map((m) => (
                                        <button key={m} onClick={() => setMetodoPago(m)}
                                            className={`flex-1 py-3 rounded-[8px] text-[12px] font-bold capitalize transition-colors border-2 ${metodoPago === m ? 'bg-[#cbe6d3] border-[#006039] text-[#506859]' : 'bg-[#eceeec] border-transparent text-[#3f4941]'}`}>
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {precio && (
                        <div className="bg-[#f2f4f2] rounded-[12px] px-5 py-4 flex items-center justify-between">
                            <span className="text-[#3f4941] text-[14px] font-medium">Total</span>
                            <span className="text-[#006039] text-[20px] font-extrabold">${(parseFloat(precio) * parseInt(cantidad || '1')).toLocaleString('es-AR')}</span>
                        </div>
                    )}

                    <button onClick={handleConfirmar} disabled={guardando || !precio}
                        className="w-full py-5 rounded-[8px] text-white text-[18px] font-extrabold shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                        {guardando ? 'Registrando...' : cobrado ? 'Confirmar Venta ✓' : 'Registrar como Pendiente'}
                    </button>
                </div>

                {/* Historial */}
                <div className="md:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[#191c1b] text-[20px] font-bold">Historial de ventas</h2>
                        <p className="text-[#6f7a71] text-[12px] md:hidden">← Deslizá para eliminar</p>
                    </div>

                    <div className="bg-[#f2f4f2] rounded-[12px] overflow-hidden shadow-sm">
                        {/* Header */}
                        <div className="bg-[#e6e9e7] grid grid-cols-12 px-4 md:px-6 py-4">
                            <div className="col-span-7 md:col-span-4">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Detalle</span>
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Monto</span>
                            </div>
                            <div className="hidden md:flex md:col-span-3 justify-center">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Estado</span>
                            </div>
                            <div className="hidden md:flex md:col-span-3 justify-end">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Acciones</span>
                            </div>
                        </div>

                        {loadingVentas ? (
                            <div className="flex items-center justify-center py-12"><p className="text-[#3f4941] text-[14px]">Cargando ventas...</p></div>
                        ) : errorVentas ? (
                            <div className="flex items-center justify-center py-12"><p className="text-[#ba1a1a] text-[14px]">{errorVentas}</p></div>
                        ) : ventas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <span className="text-[32px]">🛒</span>
                                <p className="text-[#3f4941] text-[16px] font-bold">No hay ventas todavía</p>
                                <p className="text-[#6f7a71] text-[14px]">Registrá tu primera venta usando el formulario</p>
                            </div>
                        ) : (
                            ventas.map((venta, i) => (
                                <FilaVenta
                                    key={venta.id}
                                    venta={venta}
                                    index={i}
                                    onEliminar={handleEliminar}
                                    eliminando={eliminando}
                                    onCambiarEstado={handleActualizarEstado}
                                    actualizando={actualizando}
                                    formatFecha={formatFecha}
                                    formatMonto={formatMonto}
                                    getBadgeEstado={getBadgeEstado}
                                    getLabelEstado={getLabelEstado}
                                />
                            ))
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#eceeec] rounded-[12px] p-6 flex flex-col justify-between h-[140px]">
                            <p className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Ventas Hoy</p>
                            <div>
                                <p className="text-[#006039] text-[28px] font-extrabold">${totalHoy.toLocaleString('es-AR')}</p>
                                <p className="text-[#3f4941] text-[12px]">{ventasHoy.length} ventas hoy</p>
                            </div>
                        </div>
                        <div className="bg-[#eceeec] rounded-[12px] p-6 flex flex-col justify-between h-[140px]">
                            <p className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Ticket Promedio</p>
                            <p className="text-[#191c1b] text-[28px] font-extrabold">${ticketPromedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}