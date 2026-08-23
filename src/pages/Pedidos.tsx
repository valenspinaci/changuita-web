import { useState, useEffect } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getPedidos, crearPedido, actualizarEstadoPedido, actualizarPedido, eliminarPedido, getClientes } from '../services/api'
import HelpTooltip from '../components/HelpTooltip'
import { useToast } from '../context/ToastContext'

type EstadoPedido = 'PENDIENTE' | 'ACTIVO' | 'ENTREGADO' | 'CANCELADO'

interface PedidoAPI {
    id: number
    estado: EstadoPedido
    notas?: string
    fechaEstimada?: string
    creadoEn: string
    cliente?: { id: number; nombre: string; telefono?: string }
    detalles: any[]
}

interface ClienteAPI {
    id: number
    nombre: string
    telefono?: string
}

const COLUMNAS: { estado: EstadoPedido; label: string; color: string; bg: string; emoji: string }[] = [
    { estado: 'PENDIENTE', label: 'Pendiente', color: '#856404', bg: '#fff3cd', emoji: '⏳' },
    { estado: 'ACTIVO', label: 'En Proceso', color: '#006039', bg: '#cbe6d3', emoji: '🔄' },
    { estado: 'ENTREGADO', label: 'Entregado', color: '#344c3e', bg: '#cee9d6', emoji: '✅' },
    { estado: 'CANCELADO', label: 'Cancelado', color: '#7b2c33', bg: '#ffdada', emoji: '❌' },
]

export default function Pedidos() {
    const { emprendimientoActivo } = useEmprendimiento()
    const { showToast } = useToast()
    const [pedidos, setPedidos] = useState<PedidoAPI[]>([])
    const [clientes, setClientes] = useState<ClienteAPI[]>([])
    const [loading, setLoading] = useState(true)

    // Modal crear
    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false)
    const [clienteId, setClienteId] = useState<string>('')
    const [notas, setNotas] = useState('')
    const [fechaEstimada, setFechaEstimada] = useState('')
    const [guardando, setGuardando] = useState(false)

    // Modal editar
    const [pedidoEditando, setPedidoEditando] = useState<PedidoAPI | null>(null)
    const [editNotas, setEditNotas] = useState('')
    const [editFechaEstimada, setEditFechaEstimada] = useState('')
    const [editClienteId, setEditClienteId] = useState('')
    const [editGuardando, setEditGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    // Drag & drop
    const [draggingId, setDraggingId] = useState<number | null>(null)
    const [draggingOver, setDraggingOver] = useState<EstadoPedido | null>(null)

    const cargarDatos = async () => {
        if (!emprendimientoActivo) return
        try {
            setLoading(true)
            const [pedidosData, clientesData] = await Promise.all([
                getPedidos(emprendimientoActivo.id),
                getClientes(emprendimientoActivo.id),
            ])
            setPedidos(pedidosData)
            setClientes(clientesData)
        } catch (err) {
            console.error('Error cargando pedidos:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { cargarDatos() }, [emprendimientoActivo])

    const handleCrearPedido = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emprendimientoActivo) return
        try {
            setGuardando(true)
            await crearPedido(emprendimientoActivo.id, {
                clienteId: clienteId ? parseInt(clienteId) : undefined,
                notas: notas.trim() || undefined,
                fechaEstimada: fechaEstimada ? new Date(fechaEstimada + 'T12:00:00.000Z').toISOString() : undefined,
                detalles: [],
            })
            setClienteId(''); setNotas(''); setFechaEstimada('')
            setMostrarModalNuevo(false)
            await cargarDatos()
            showToast('Pedido creado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al crear pedido', 'error')
        } finally {
            setGuardando(false)
        }
    }

    const abrirEdicion = (pedido: PedidoAPI) => {
        setPedidoEditando(pedido)
        setEditNotas(pedido.notas || '')
        setEditFechaEstimada(pedido.fechaEstimada ? pedido.fechaEstimada.split('T')[0] : '')
        setEditClienteId(pedido.cliente ? String(pedido.cliente.id) : '')
    }

    const handleGuardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emprendimientoActivo || !pedidoEditando) return
        try {
            setEditGuardando(true)
            await actualizarPedido(emprendimientoActivo.id, pedidoEditando.id, {
                notas: editNotas.trim() || undefined,
                fechaEstimada: editFechaEstimada
                    ? new Date(editFechaEstimada + 'T12:00:00.000Z').toISOString()
                    : undefined,
                clienteId: editClienteId ? parseInt(editClienteId) : undefined,
            })
            setPedidoEditando(null)
            await cargarDatos()
            showToast('Pedido actualizado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al guardar cambios', 'error')
        } finally {
            setEditGuardando(false)
        }
    }

    const handleEliminarPedido = async () => {
        if (!emprendimientoActivo || !pedidoEditando) return
        if (!window.confirm(`¿Cancelar el pedido #${pedidoEditando.id}?`)) return
        try {
            setEliminando(true)
            await eliminarPedido(emprendimientoActivo.id, pedidoEditando.id)
            setPedidoEditando(null)
            await cargarDatos()
            showToast('Pedido cancelado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al cancelar pedido', 'error')
        } finally {
            setEliminando(false)
        }
    }

    const cambiarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
        if (!emprendimientoActivo) return
        try {
            // Actualizar el estado local inmediatamente
            setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
            // Actualizar el modal si está abierto
            if (pedidoEditando?.id === pedidoId) {
                setPedidoEditando(prev => prev ? { ...prev, estado: nuevoEstado } : null)
            }
            await actualizarEstadoPedido(emprendimientoActivo.id, pedidoId, nuevoEstado)
        } catch (err) {
            await cargarDatos()
            showToast('No se pudo actualizar el estado del pedido', 'error')
        }
    }

    const handleDragStart = (e: React.DragEvent, pedidoId: number) => {
        setDraggingId(pedidoId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent, estado: EstadoPedido) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDraggingOver(estado)
    }

    const handleDrop = async (e: React.DragEvent, nuevoEstado: EstadoPedido) => {
        e.preventDefault()
        if (draggingId !== null) await cambiarEstado(draggingId, nuevoEstado)
        setDraggingId(null)
        setDraggingOver(null)
    }

    const handleDragEnd = () => {
        setDraggingId(null)
        setDraggingOver(null)
    }

    const formatFecha = (f: string) => {
        const d = new Date(f)
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }

    const pedidosPorEstado = (estado: EstadoPedido) =>
        pedidos.filter(p => p.estado === estado)

    const colDeEditando = pedidoEditando
        ? COLUMNAS.find(c => c.estado === pedidoEditando.estado)
        : null

    return (
        <div className="flex flex-col gap-6 md:gap-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-[#191c1b] text-[28px] md:text-[36px] font-bold tracking-[-0.9px] leading-tight">Pedidos</h1>
                        <HelpTooltip texto="Arrastrá las tarjetas entre columnas para actualizar el estado de un pedido: pendiente, activo o entregado." />
                    </div>
                    <p className="text-[#4c6455] text-[16px] font-medium">
                        Gestioná el estado de tus pedidos arrastrando las tarjetas.
                    </p>
                </div>
                <button onClick={() => setMostrarModalNuevo(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-[12px] text-white text-[14px] font-bold shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                    style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                    + Nuevo Pedido
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COLUMNAS.map(col => (
                    <div key={col.estado} className="bg-white rounded-[12px] px-4 py-3 flex items-center gap-3 shadow-sm">
                        <span className="text-[20px]">{col.emoji}</span>
                        <div>
                            <p className="text-[#191c1b] text-[20px] font-extrabold leading-tight">{pedidosPorEstado(col.estado).length}</p>
                            <p className="text-[#6f7a71] text-[12px]">{col.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kanban */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <p className="text-[#3f4941] text-[14px]">Cargando pedidos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {COLUMNAS.map(col => (
                        <div key={col.estado}
                            className={`flex flex-col gap-3 min-h-[400px] rounded-[16px] p-3 transition-colors ${draggingOver === col.estado ? 'bg-[rgba(0,96,57,0.05)] ring-2 ring-[#006039] ring-offset-2' : 'bg-[#f2f4f2]'
                                }`}
                            onDragOver={(e) => handleDragOver(e, col.estado)}
                            onDrop={(e) => handleDrop(e, col.estado)}
                            onDragLeave={() => setDraggingOver(null)}
                        >
                            {/* Header columna */}
                            <div className="flex items-center justify-between px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[16px]">{col.emoji}</span>
                                    <span className="text-[#191c1b] text-[14px] font-bold">{col.label}</span>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: col.bg, color: col.color }}>
                                    {pedidosPorEstado(col.estado).length}
                                </span>
                            </div>

                            {/* Tarjetas */}
                            {pedidosPorEstado(col.estado).length === 0 ? (
                                <div className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed transition-colors ${draggingOver === col.estado ? 'border-[#006039] bg-[rgba(0,96,57,0.03)]' : 'border-[#bec9bf]'
                                    }`}>
                                    <span className="text-[24px] opacity-30">{col.emoji}</span>
                                    <p className="text-[#bec9bf] text-[12px] text-center px-4">
                                        {draggingOver === col.estado ? 'Soltar acá' : 'Sin pedidos'}
                                    </p>
                                </div>
                            ) : (
                                pedidosPorEstado(col.estado).map(pedido => (
                                    <div key={pedido.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, pedido.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => abrirEdicion(pedido)}
                                        className={`bg-white rounded-[12px] p-4 shadow-sm cursor-pointer flex flex-col gap-3 transition-all ${draggingId === pedido.id ? 'opacity-50 scale-95 cursor-grabbing' : 'hover:shadow-md hover:scale-[1.01]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#006039] text-[13px] font-bold">#{pedido.id}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: col.bg, color: col.color }}>
                                                {col.label}
                                            </span>
                                        </div>

                                        {pedido.cliente ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-[#cbe6d3] rounded-full flex items-center justify-center text-[#006039] text-[11px] font-bold shrink-0">
                                                    {pedido.cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[#191c1b] text-[13px] font-bold leading-tight">{pedido.cliente.nombre}</p>
                                                    {pedido.cliente.telefono && (
                                                        <p className="text-[#6f7a71] text-[11px]">{pedido.cliente.telefono}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[#6f7a71] text-[13px]">Sin cliente asignado</p>
                                        )}

                                        {pedido.notas && (
                                            <p className="text-[#3f4941] text-[12px] bg-[#f8faf8] rounded-[8px] px-3 py-2 leading-[18px] line-clamp-2">
                                                {pedido.notas}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-1 border-t border-[#f2f4f2]">
                                            <p className="text-[#6f7a71] text-[11px]">{formatFecha(pedido.creadoEn)}</p>
                                            {pedido.fechaEstimada && (
                                                <p className="text-[#006039] text-[11px] font-bold">📅 {formatFecha(pedido.fechaEstimada)}</p>
                                            )}
                                        </div>

                                        {/* Hint */}
                                        <p className="text-[#bec9bf] text-[10px] text-center">Tocá para editar • Arrastrá para mover</p>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal nuevo pedido */}
            {mostrarModalNuevo && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] w-full max-w-[480px] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[#191c1b] text-[22px] font-extrabold">Nuevo Pedido</h2>
                            <button onClick={() => setMostrarModalNuevo(false)} className="text-[#6f7a71] hover:text-[#191c1b] text-[18px]">✕</button>
                        </div>
                        <form onSubmit={handleCrearPedido} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Cliente (opcional)</label>
                                <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full appearance-none">
                                    <option value="">Sin cliente asignado</option>
                                    {clientes.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Descripción / Notas</label>
                                <textarea value={notas} onChange={e => setNotas(e.target.value)}
                                    placeholder="Ej: 2 docenas de facturas, 1 torta de cumpleaños..."
                                    rows={3}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full resize-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Fecha Estimada (opcional)</label>
                                <input type="date" value={fechaEstimada} onChange={e => setFechaEstimada(e.target.value)}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setMostrarModalNuevo(false)}
                                    className="flex-1 py-3 rounded-[10px] bg-[#f2f4f2] text-[#3f4941] text-[15px] font-bold">Cancelar</button>
                                <button type="submit" disabled={guardando}
                                    className="flex-1 py-3 rounded-[10px] text-white text-[15px] font-bold disabled:opacity-50"
                                    style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                    {guardando ? 'Creando...' : 'Crear Pedido'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal editar pedido */}
            {pedidoEditando && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[16px] w-full max-w-[480px] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-[#191c1b] text-[22px] font-extrabold">Pedido #{pedidoEditando.id}</h2>
                                {colDeEditando && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: colDeEditando.bg, color: colDeEditando.color }}>
                                        {colDeEditando.emoji} {colDeEditando.label}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setPedidoEditando(null)} className="text-[#6f7a71] hover:text-[#191c1b] text-[18px]">✕</button>
                        </div>

                        {/* Cambiar estado */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Cambiar Estado</label>
                            <div className="grid grid-cols-2 gap-2">
                                {COLUMNAS.map(col => (
                                    <button key={col.estado}
                                        onClick={() => cambiarEstado(pedidoEditando.id, col.estado)}
                                        className={`py-2 px-3 rounded-[8px] text-[12px] font-bold transition-colors flex items-center gap-1 justify-center ${pedidoEditando.estado === col.estado ? 'ring-2 ring-offset-1 ring-[#006039]' : ''
                                            }`}
                                        style={{ backgroundColor: col.bg, color: col.color }}>
                                        {col.emoji} {col.label}
                                        {pedidoEditando.estado === col.estado && ' ✓'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleGuardarEdicion} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Cliente</label>
                                <select value={editClienteId} onChange={e => setEditClienteId(e.target.value)}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full appearance-none">
                                    <option value="">Sin cliente asignado</option>
                                    {clientes.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Notas</label>
                                <textarea value={editNotas} onChange={e => setEditNotas(e.target.value)}
                                    placeholder="Descripción del pedido..."
                                    rows={3}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full resize-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[11px] font-bold tracking-[0.8px] uppercase">Fecha Estimada</label>
                                <input type="date" value={editFechaEstimada} onChange={e => setEditFechaEstimada(e.target.value)}
                                    className="bg-[#eceeec] rounded-[10px] px-4 py-3 text-[15px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button type="button" onClick={handleEliminarPedido} disabled={eliminando}
                                    className="px-4 py-2 rounded-[10px] text-[#ba1a1a] text-[14px] font-bold hover:bg-[#ffdada] transition-colors disabled:opacity-50">
                                    {eliminando ? 'Cancelando...' : '🗑️ Cancelar pedido'}
                                </button>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setPedidoEditando(null)}
                                        className="px-4 py-2 rounded-[10px] bg-[#f2f4f2] text-[#3f4941] text-[14px] font-bold">
                                        Cerrar
                                    </button>
                                    <button type="submit" disabled={editGuardando}
                                        className="px-5 py-2 rounded-[10px] text-white text-[14px] font-bold disabled:opacity-50"
                                        style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                        {editGuardando ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}