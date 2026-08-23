import { useState, useEffect } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getClientes, crearCliente, eliminarCliente, actualizarCliente } from '../services/api'
import HelpTooltip from '../components/HelpTooltip'
import { useToast } from '../context/ToastContext'

interface VentaCliente {
    total: string
    creadoEn: string
    estado: string
}

interface ClienteAPI {
    id: number
    nombre: string
    email?: string
    telefono?: string
    direccion?: string
    notas?: string
    creadoEn: string
    ventas?: VentaCliente[]
}

export default function Clientes() {
    const { emprendimientoActivo } = useEmprendimiento()
    const { showToast } = useToast()
    const [clientes, setClientes] = useState<ClienteAPI[]>([])
    const [loadingClientes, setLoadingClientes] = useState(true)
    const [errorClientes, setErrorClientes] = useState('')
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteAPI | null>(null)
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [busqueda, setBusqueda] = useState('')

    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [direccion, setDireccion] = useState('')
    const [notas, setNotas] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)

    const cargarClientes = async () => {
        if (!emprendimientoActivo) return
        try {
            setLoadingClientes(true)
            const data = await getClientes(emprendimientoActivo.id)
            setClientes(data)
            if (data.length > 0 && !clienteSeleccionado) {
                setClienteSeleccionado(data[0])
            }
        } catch (err: any) {
            setErrorClientes(err.message || 'Error al cargar clientes')
        } finally {
            setLoadingClientes(false)
        }
    }

    useEffect(() => { cargarClientes() }, [emprendimientoActivo])

    const limpiarFormulario = () => {
        setNombre(''); setTelefono(''); setEmail(''); setDireccion(''); setNotas('')
    }

    const abrirFormularioNuevo = () => {
        limpiarFormulario()
        setModoEdicion(false)
        setMostrarFormulario(true)
    }

    const abrirFormularioEdicion = (cliente: ClienteAPI) => {
        setNombre(cliente.nombre)
        setTelefono(cliente.telefono || '')
        setEmail(cliente.email || '')
        setDireccion(cliente.direccion || '')
        setNotas(cliente.notas || '')
        setModoEdicion(true)
        setMostrarFormulario(true)
    }

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emprendimientoActivo || !nombre.trim()) return
        try {
            setGuardando(true)
            if (modoEdicion && clienteSeleccionado) {
                const actualizado = await actualizarCliente(emprendimientoActivo.id, clienteSeleccionado.id, {
                    nombre, telefono, email, direccion, notas
                })
                setClientes(prev => prev.map(c => c.id === actualizado.id ? { ...actualizado, ventas: c.ventas } : c))
                setClienteSeleccionado({ ...actualizado, ventas: clienteSeleccionado.ventas })
            } else {
                const nuevo = await crearCliente(emprendimientoActivo.id, { nombre, telefono, email, direccion, notas })
                setClientes(prev => [{ ...nuevo, ventas: [] }, ...prev])
                setClienteSeleccionado({ ...nuevo, ventas: [] })
            }
            limpiarFormulario()
            setMostrarFormulario(false)
            const eraEdicion = modoEdicion
            setModoEdicion(false)
            showToast(eraEdicion ? 'Cliente actualizado' : 'Cliente creado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al guardar cliente', 'error')
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminar = async (cliente: ClienteAPI) => {
        if (!emprendimientoActivo) return
        if (!window.confirm(`¿Seguro que querés eliminar a ${cliente.nombre}?`)) return
        try {
            setEliminando(true)
            await eliminarCliente(emprendimientoActivo.id, cliente.id)
            const nuevosClientes = clientes.filter(c => c.id !== cliente.id)
            setClientes(nuevosClientes)
            setClienteSeleccionado(nuevosClientes.length > 0 ? nuevosClientes[0] : null)
            setMostrarFormulario(false)
            showToast('Cliente eliminado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al eliminar cliente', 'error')
        } finally {
            setEliminando(false)
        }
    }

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase())
    )

    const getIniciales = (nombre: string) =>
        nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    const formatFecha = (f: string) => {
        const d = new Date(f)
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    // Calcular stats del cliente seleccionado
    const ventas = clienteSeleccionado?.ventas || []
    const totalCompras = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0)
    const cantidadVisitas = ventas.length
    const ultimaVisita = ventas[0]?.creadoEn
        ? new Date(ventas[0].creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
        : null

    return (
        <div className="flex flex-col gap-6 md:gap-8">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-[#191c1b] text-[28px] md:text-[36px] font-bold tracking-[-0.9px] leading-tight">
                        Gestión de Clientes
                    </h1>
                    <HelpTooltip texto="Guardá los datos de tus clientes y consultá su historial de compras completo desde su ficha." />
                </div>
                <p className="text-[#4c6455] text-[16px] font-medium">
                    Administrá tus contactos y construí relaciones con tus compradores frecuentes.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Lista */}
                <div className="md:col-span-4 flex flex-col gap-4">

                    <div className="flex items-center gap-2">
                        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="flex-1 bg-[#f2f4f2] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6f7a71] outline-none focus:ring-2 focus:ring-[#006039]" />
                        <button onClick={abrirFormularioNuevo}
                            className="bg-[#cbe6d3] flex items-center gap-1 px-3 py-3 rounded-[8px] text-[#006039] text-[12px] font-bold shrink-0">
                            + AGREGAR
                        </button>
                    </div>

                    {loadingClientes ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-[#3f4941] text-[14px]">Cargando clientes...</p>
                        </div>
                    ) : errorClientes ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-[#ba1a1a] text-[14px]">{errorClientes}</p>
                        </div>
                    ) : clientesFiltrados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <span className="text-[32px]">👥</span>
                            <p className="text-[#3f4941] text-[14px] font-bold text-center">
                                {busqueda ? 'No hay resultados' : 'No hay clientes todavía'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {clientesFiltrados.map((cliente) => (
                                <button key={cliente.id}
                                    onClick={() => { setClienteSeleccionado(cliente); setMostrarFormulario(false); setModoEdicion(false) }}
                                    className={`w-full text-left flex items-center gap-3 p-4 rounded-[12px] transition-all ${clienteSeleccionado?.id === cliente.id && !mostrarFormulario
                                            ? 'bg-white border-l-4 border-[#006039] shadow-sm pl-3'
                                            : 'bg-[#f8faf8] hover:bg-white'
                                        }`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${clienteSeleccionado?.id === cliente.id && !mostrarFormulario
                                            ? 'bg-[#cbe6d3] text-[#006039]'
                                            : 'bg-[#e1e3e1] text-[#6f7a71]'
                                        }`}>
                                        {getIniciales(cliente.nombre)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#191c1b] text-[15px] font-semibold truncate">{cliente.nombre}</p>
                                        <p className="text-[#3f4941] text-[12px] truncate">{cliente.telefono || cliente.email || 'Sin contacto'}</p>
                                    </div>
                                    {(cliente.ventas?.length || 0) > 0 && (
                                        <span className="text-[10px] font-bold text-[#006039] bg-[#cbe6d3] px-2 py-0.5 rounded-full shrink-0">
                                            {cliente.ventas?.length} compras
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalle / Formulario */}
                <div className="md:col-span-8 bg-[rgba(248,250,248,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.4)] rounded-[16px] p-6 md:p-8 shadow-[0px_12px_40px_rgba(0,96,57,0.05)] flex flex-col gap-6">

                    {mostrarFormulario ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-[#191c1b] text-[24px] font-extrabold">
                                    {modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
                                </h2>
                                <button onClick={() => { setMostrarFormulario(false); setModoEdicion(false) }}
                                    className="text-[#6f7a71] text-[14px] hover:text-[#191c1b]">✕</button>
                            </div>

                            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Nombre Completo *</label>
                                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                                            placeholder="Ej: Maria Lopez" required
                                            className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">WhatsApp / Teléfono</label>
                                        <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)}
                                            placeholder="+54 9..."
                                            className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Email</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="ejemplo@gmail.com"
                                            className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Dirección</label>
                                        <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)}
                                            placeholder="Calle, Altura, Departamento..."
                                            className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Notas (Opcional)</label>
                                        <textarea value={notas} onChange={e => setNotas(e.target.value)}
                                            placeholder="Preferencias, observaciones..." rows={2}
                                            className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full resize-none" />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    {modoEdicion && clienteSeleccionado && (
                                        <button type="button" onClick={() => handleEliminar(clienteSeleccionado)} disabled={eliminando}
                                            className="px-4 py-3 rounded-[12px] text-[#ba1a1a] text-[14px] font-bold hover:bg-[#ffdada] transition-colors disabled:opacity-50">
                                            {eliminando ? 'Eliminando...' : '🗑️ Eliminar'}
                                        </button>
                                    )}
                                    <div className="flex gap-3 ml-auto">
                                        <button type="button" onClick={() => { setMostrarFormulario(false); setModoEdicion(false) }}
                                            className="px-6 py-3 rounded-[12px] text-[#4c6455] text-[16px] font-bold">
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={guardando || !nombre.trim()}
                                            className="text-white px-8 py-3 rounded-[12px] text-[16px] font-bold shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)] disabled:opacity-50"
                                            style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                            {guardando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Registrar Cliente'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : clienteSeleccionado ? (
                        <>
                            {/* Detalle */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#cbe6d3] rounded-full flex items-center justify-center text-[#006039] text-[20px] font-extrabold shrink-0">
                                        {getIniciales(clienteSeleccionado.nombre)}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-[#191c1b] text-[24px] md:text-[28px] font-extrabold">{clienteSeleccionado.nombre}</h2>
                                        <div className="flex flex-col gap-0.5">
                                            {clienteSeleccionado.telefono && (
                                                <p className="text-[#4c6455] text-[14px] font-medium">📱 {clienteSeleccionado.telefono}</p>
                                            )}
                                            {clienteSeleccionado.email && (
                                                <p className="text-[#4c6455] text-[14px] font-medium">✉️ {clienteSeleccionado.email}</p>
                                            )}
                                            {clienteSeleccionado.direccion && (
                                                <p className="text-[#4c6455] text-[14px] font-medium">📍 {clienteSeleccionado.direccion}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => abrirFormularioEdicion(clienteSeleccionado)}
                                        className="p-2 rounded-[8px] hover:bg-[#e6e9e7] transition-colors text-[#506859]" title="Editar">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleEliminar(clienteSeleccionado)} disabled={eliminando}
                                        className="p-2 rounded-[8px] hover:bg-[#ffdada] transition-colors text-[#ba1a1a] disabled:opacity-50" title="Eliminar">
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {clienteSeleccionado.notas && (
                                <div className="bg-[#f2f4f2] rounded-[12px] px-4 py-3">
                                    <p className="text-[#6f7a71] text-[11px] font-bold uppercase mb-1">Notas</p>
                                    <p className="text-[#191c1b] text-[14px]">{clienteSeleccionado.notas}</p>
                                </div>
                            )}

                            {/* Stats calculados dinámicamente */}
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                <div className="bg-[#f2f4f2] rounded-[16px] p-4 md:p-5 flex flex-col gap-1">
                                    <p className="text-[#bec9bf] text-[10px] md:text-[11px] font-bold tracking-[1.2px] uppercase">TOTAL COMPRAS</p>
                                    <p className="text-[#006039] text-[16px] md:text-[20px] font-extrabold leading-tight">
                                        ${totalCompras.toLocaleString('es-AR')}
                                    </p>
                                    <p className="text-[rgba(0,96,57,0.6)] text-[10px] font-medium">
                                        {cantidadVisitas > 0 ? `${cantidadVisitas} compras` : 'Sin compras aún'}
                                    </p>
                                </div>
                                <div className="bg-[#f2f4f2] rounded-[16px] p-4 md:p-5 flex flex-col gap-1">
                                    <p className="text-[#bec9bf] text-[10px] md:text-[11px] font-bold tracking-[1.2px] uppercase">VISITAS</p>
                                    <p className="text-[#006039] text-[16px] md:text-[20px] font-extrabold leading-tight">{cantidadVisitas}</p>
                                    <p className="text-[rgba(0,96,57,0.6)] text-[10px] font-medium">
                                        {ultimaVisita ? `Última: ${ultimaVisita}` : 'Sin visitas'}
                                    </p>
                                </div>
                                <div className="bg-[#f2f4f2] rounded-[16px] p-4 md:p-5 flex flex-col gap-1">
                                    <p className="text-[#bec9bf] text-[10px] md:text-[11px] font-bold tracking-[1.2px] uppercase">CLIENTE DESDE</p>
                                    <p className="text-[#006039] text-[14px] md:text-[16px] font-extrabold leading-tight">
                                        {formatFecha(clienteSeleccionado.creadoEn)}
                                    </p>
                                </div>
                            </div>

                            {/* Historial de compras */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-[#191c1b] text-[20px] font-bold">Historial de Compras</h3>
                                <div className="bg-white border border-[rgba(190,201,191,0.1)] rounded-[16px] overflow-hidden">
                                    {ventas.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                                            <span className="text-[32px]">🛒</span>
                                            <p className="text-[#3f4941] text-[14px] font-bold">Sin compras registradas</p>
                                            <p className="text-[#6f7a71] text-[12px]">Las ventas asociadas a este cliente aparecerán acá</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-3 px-6 py-3 bg-[#f8faf8] border-b border-[#eceeec]">
                                                <span className="text-[#6f7a71] text-[11px] font-bold uppercase">Fecha</span>
                                                <span className="text-[#6f7a71] text-[11px] font-bold uppercase text-center">Estado</span>
                                                <span className="text-[#6f7a71] text-[11px] font-bold uppercase text-right">Monto</span>
                                            </div>
                                            {ventas.map((v, i) => (
                                                <div key={i} className={`grid grid-cols-3 px-6 py-4 items-center ${i > 0 ? 'border-t border-[#eceeec]' : ''}`}>
                                                    <p className="text-[#3f4941] text-[13px]">
                                                        {new Date(v.creadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                    <div className="flex justify-center">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.estado === 'COBRADA' ? 'bg-[#cee9d6] text-[#344c3e]' :
                                                                v.estado === 'PENDIENTE' ? 'bg-[#fff3cd] text-[#856404]' :
                                                                    'bg-[#ffdada] text-[#7b2c33]'
                                                            }`}>
                                                            {v.estado === 'COBRADA' ? 'Completado' : v.estado === 'PENDIENTE' ? 'Pendiente' : 'Cancelado'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[#191c1b] text-[14px] font-bold text-right">
                                                        ${parseFloat(v.total).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <span className="text-[48px]">👥</span>
                            <p className="text-[#191c1b] text-[18px] font-bold">Seleccioná un cliente</p>
                            <p className="text-[#6f7a71] text-[14px]">o creá uno nuevo para empezar</p>
                            <button onClick={abrirFormularioNuevo}
                                className="mt-4 text-white px-6 py-3 rounded-[12px] text-[14px] font-bold"
                                style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                + Agregar cliente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}