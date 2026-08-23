import { useState, useEffect, useRef } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getGastos, crearGasto, eliminarGasto, getCategorias, crearCategoria } from '../services/api'
import HelpTooltip from '../components/HelpTooltip'
import { useToast } from '../context/ToastContext'

interface GastoAPI {
    id: number
    descripcion: string
    monto: string
    fecha: string
    categoriaId?: number
    categoria?: { id: number; nombre: string }
}

interface CategoriaAPI {
    id: number
    nombre: string
    descripcion?: string
}

function FilaGasto({
    gasto, index, onEliminar, eliminando, formatFecha, formatMonto, getEmoji, getColorBg,
}: {
    gasto: GastoAPI
    index: number
    onEliminar: (id: number) => void
    eliminando: number | null
    formatFecha: (f: string) => string
    formatMonto: (m: string) => string
    getEmoji: (cat?: string) => string
    getColorBg: (cat?: string) => string
}) {
    const [swipeX, setSwipeX] = useState(0)
    const startX = useRef(0)
    const THRESHOLD = 80

    const handleTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
    const handleTouchMove = (e: React.TouchEvent) => {
        const diff = e.touches[0].clientX - startX.current
        if (diff < 0) setSwipeX(Math.max(diff, -THRESHOLD - 20))
        else setSwipeX(Math.min(diff, 0))
    }
    const handleTouchEnd = () => {
        if (swipeX < -THRESHOLD / 2) setSwipeX(-THRESHOLD)
        else setSwipeX(0)
    }

    const categoriaNombre = gasto.categoria?.nombre || 'General'

    return (
        <div className={`relative overflow-hidden ${index > 0 ? 'border-t border-[rgba(0,0,0,0.04)]' : ''}`}>
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-[80px] bg-[#ba1a1a] flex items-center justify-center">
                <button onClick={() => onEliminar(gasto.id)} disabled={eliminando === gasto.id}
                    className="flex flex-col items-center gap-1 text-white">
                    <span className="text-[20px]">🗑️</span>
                    <span className="text-[10px] font-bold">Eliminar</span>
                </button>
            </div>
            <div
                className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 bg-white transition-transform"
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[18px] md:text-[20px] shrink-0"
                        style={{ backgroundColor: getColorBg(categoriaNombre) }}>
                        {getEmoji(categoriaNombre)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold truncate">{gasto.descripcion}</p>
                        <p className="text-[#6f7a71] text-[11px] md:text-[12px]">{formatFecha(gasto.fecha)} • {categoriaNombre}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                    <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{formatMonto(gasto.monto)}</p>
                    <button onClick={() => onEliminar(gasto.id)} disabled={eliminando === gasto.id}
                        className="hidden md:flex p-2 rounded-[8px] hover:bg-[#ffdada] transition-colors text-[#ba1a1a] disabled:opacity-50"
                        title="Eliminar gasto">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Gastos() {
    const { emprendimientoActivo } = useEmprendimiento()
    const { showToast } = useToast()
    const [gastos, setGastos] = useState<GastoAPI[]>([])
    const [categorias, setCategorias] = useState<CategoriaAPI[]>([])
    const [loadingGastos, setLoadingGastos] = useState(true)
    const [errorGastos, setErrorGastos] = useState('')
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null)
    const [eliminando, setEliminando] = useState<number | null>(null)
    const [periodoGrafico, setPeriodoGrafico] = useState<'dia' | 'semana' | 'mes' | 'año'>('semana')

    const [monto, setMonto] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [categoriaId, setCategoriaId] = useState<string>('')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
    const [guardando, setGuardando] = useState(false)

    const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
    const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState('')
    const [creandoCategoria, setCreandoCategoria] = useState(false)

    const cargarDatos = async () => {
        if (!emprendimientoActivo) return
        try {
            setLoadingGastos(true)
            const [gastosData, categoriasData] = await Promise.all([
                getGastos(emprendimientoActivo.id),
                getCategorias(emprendimientoActivo.id),
            ])
            setGastos(gastosData)
            setCategorias(categoriasData)
            if (categoriasData.length > 0 && !categoriaId) {
                setCategoriaId(String(categoriasData[0].id))
            }
        } catch (err: any) {
            setErrorGastos(err.message || 'Error al cargar datos')
        } finally {
            setLoadingGastos(false)
        }
    }

    useEffect(() => { cargarDatos() }, [emprendimientoActivo])

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!emprendimientoActivo || !monto || !descripcion) return
        try {
            setGuardando(true)
            await crearGasto(emprendimientoActivo.id, {
                monto: parseFloat(monto),
                descripcion,
                fecha: new Date(fecha + 'T12:00:00.000Z').toISOString(),
                categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
            })
            setMonto('')
            setDescripcion('')
            setFecha(new Date().toISOString().split('T')[0])
            await cargarDatos()
            showToast('Gasto registrado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al registrar gasto', 'error')
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminar = async (gastoId: number) => {
        if (!emprendimientoActivo) return
        if (!window.confirm('¿Seguro que querés eliminar este gasto?')) return
        try {
            setEliminando(gastoId)
            await eliminarGasto(emprendimientoActivo.id, gastoId)
            await cargarDatos()
            showToast('Gasto eliminado', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al eliminar gasto', 'error')
        } finally {
            setEliminando(null)
        }
    }

    const handleCrearCategoria = async () => {
        if (!emprendimientoActivo || !nombreNuevaCategoria.trim()) return
        try {
            setCreandoCategoria(true)
            const nueva = await crearCategoria(emprendimientoActivo.id, { nombre: nombreNuevaCategoria.trim() })
            setCategorias(prev => [...prev, nueva])
            setCategoriaId(String(nueva.id))
            setNombreNuevaCategoria('')
            setMostrarNuevaCategoria(false)
            showToast('Categoría creada', 'success')
        } catch (err: any) {
            showToast(err.message || 'Error al crear categoría', 'error')
        } finally {
            setCreandoCategoria(false)
        }
    }

    const formatFecha = (f: string) => {
        const d = new Date(f)
        const hoy = new Date()
        const ayer = new Date(); ayer.setDate(ayer.getDate() - 1)
        if (d.getUTCDate() === hoy.getUTCDate() && d.getUTCMonth() === hoy.getUTCMonth() && d.getUTCFullYear() === hoy.getUTCFullYear()) return 'Hoy'
        if (d.getUTCDate() === ayer.getUTCDate() && d.getUTCMonth() === ayer.getUTCMonth() && d.getUTCFullYear() === ayer.getUTCFullYear()) return 'Ayer'
        return `${d.getUTCDate()} ${d.toLocaleString('es-AR', { month: 'short', timeZone: 'UTC' })}`
    }

    const formatMonto = (m: string) => `-$${parseFloat(m).toLocaleString('es-AR')}`

    const getEmoji = (cat?: string) => {
        switch (cat?.toLowerCase()) {
            case 'insumos': return '🛒'
            case 'servicios': return '⚡'
            case 'logística': return '🚚'
            default: return '💳'
        }
    }

    const getColorBg = (cat?: string) => {
        switch (cat?.toLowerCase()) {
            case 'insumos': return '#cbe6d3'
            case 'servicios': return '#ffdada'
            case 'logística': return '#cbe6d3'
            default: return '#eceeec'
        }
    }

    const gastosFiltrados = categoriaActiva === null
        ? gastos
        : gastos.filter(g => g.categoriaId === categoriaActiva)

    const totalMes = gastos.reduce((acc, g) => acc + parseFloat(g.monto), 0)

    // Calcular barras del gráfico según período
    const ahora = new Date()
    let barras: { label: string; total: number; esActual: boolean }[] = []

    if (periodoGrafico === 'dia') {
        barras = Array.from({ length: 24 }, (_, h) => {
            const total = gastos
                .filter(g => {
                    const fg = new Date(g.fecha)
                    return fg.getUTCFullYear() === ahora.getUTCFullYear() &&
                        fg.getUTCMonth() === ahora.getUTCMonth() &&
                        fg.getUTCDate() === ahora.getUTCDate() &&
                        fg.getUTCHours() === h
                })
                .reduce((acc, g) => acc + parseFloat(g.monto), 0)
            return { label: `${h}h`, total, esActual: h === ahora.getHours() }
        })
    } else if (periodoGrafico === 'semana') {
        const labels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM']
        const inicioSem = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
        const dSem = inicioSem.getUTCDay() === 0 ? 7 : inicioSem.getUTCDay()
        inicioSem.setUTCDate(inicioSem.getUTCDate() - dSem + 1)
        barras = labels.map((label, i) => {
            const dia = new Date(inicioSem)
            dia.setUTCDate(inicioSem.getUTCDate() + i)
            const total = gastos
                .filter(g => {
                    const fg = new Date(g.fecha)
                    return fg.getUTCFullYear() === dia.getUTCFullYear() &&
                        fg.getUTCMonth() === dia.getUTCMonth() &&
                        fg.getUTCDate() === dia.getUTCDate()
                })
                .reduce((acc, g) => acc + parseFloat(g.monto), 0)
            const esActual = dia.getUTCDate() === ahora.getUTCDate() &&
                dia.getUTCMonth() === ahora.getUTCMonth() &&
                dia.getUTCFullYear() === ahora.getUTCFullYear()
            return { label, total, esActual }
        })
    } else if (periodoGrafico === 'mes') {
        const diasEnMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate()
        barras = Array.from({ length: diasEnMes }, (_, i) => {
            const dia = i + 1
            const total = gastos
                .filter(g => {
                    const fg = new Date(g.fecha)
                    return fg.getUTCFullYear() === ahora.getFullYear() &&
                        fg.getUTCMonth() === ahora.getMonth() &&
                        fg.getUTCDate() === dia
                })
                .reduce((acc, g) => acc + parseFloat(g.monto), 0)
            return { label: `${dia}`, total, esActual: dia === ahora.getDate() }
        })
    } else {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        barras = meses.map((label, m) => {
            const total = gastos
                .filter(g => {
                    const fg = new Date(g.fecha)
                    return fg.getUTCFullYear() === ahora.getFullYear() && fg.getUTCMonth() === m
                })
                .reduce((acc, g) => acc + parseFloat(g.monto), 0)
            return { label, total, esActual: m === ahora.getMonth() }
        })
    }

    const maxBarra = Math.max(...barras.map(b => b.total), 1)

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Hero + Filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[#006039] text-[10px] font-bold tracking-[1px] uppercase">Balance Total</p>
                        <HelpTooltip texto="Registrá tus gastos con monto, fecha y categoría. Podés agrupar por categoría para ver en qué se va la plata." />
                    </div>
                    <h1 className="text-[#191c1b] text-[36px] md:text-[48px] font-extrabold tracking-[-1.2px] leading-none">
                        ${totalMes.toLocaleString('es-AR')}
                    </h1>
                    <div className="flex items-center gap-2 pt-1">
                        <div className="bg-[#cbe6d3] flex items-center gap-1 px-2 py-1 rounded-[8px]">
                            <span className="text-[#1a7a4d] text-[14px] font-bold">{gastos.length} gastos</span>
                        </div>
                        <span className="text-[#3f4941] text-[14px]">registrados</span>
                    </div>
                </div>

                {/* Filtros por categoría */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setCategoriaActiva(null)}
                        className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${categoriaActiva === null ? 'bg-[#006039] text-white' : 'bg-[#f2f4f2] text-[#3f4941]'}`}>
                        Todo
                    </button>
                    {categorias.map((c) => (
                        <button key={c.id} onClick={() => setCategoriaActiva(c.id)}
                            className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${categoriaActiva === c.id ? 'bg-[#006039] text-white' : 'bg-[#f2f4f2] text-[#3f4941]'}`}>
                            {c.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                {/* Columna izquierda */}
                <div className="md:col-span-2 flex flex-col gap-6">

                    {/* Lista gastos */}
                    <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#eceeec]">
                            <h2 className="text-[#191c1b] text-[20px] font-bold">Gastos Recientes</h2>
                            <p className="text-[#6f7a71] text-[12px] md:hidden">← Deslizá para eliminar</p>
                        </div>

                        {loadingGastos ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-[#3f4941] text-[14px]">Cargando gastos...</p>
                            </div>
                        ) : errorGastos ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-[#ba1a1a] text-[14px]">{errorGastos}</p>
                            </div>
                        ) : gastosFiltrados.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <span className="text-[32px]">💳</span>
                                <p className="text-[#3f4941] text-[16px] font-bold">
                                    {categoriaActiva !== null ? 'No hay gastos en esta categoría' : 'No hay gastos todavía'}
                                </p>
                                <p className="text-[#6f7a71] text-[14px]">Registrá tu primer gasto usando el formulario</p>
                            </div>
                        ) : (
                            gastosFiltrados.map((gasto, i) => (
                                <FilaGasto
                                    key={gasto.id}
                                    gasto={gasto}
                                    index={i}
                                    onEliminar={handleEliminar}
                                    eliminando={eliminando}
                                    formatFecha={formatFecha}
                                    formatMonto={formatMonto}
                                    getEmoji={getEmoji}
                                    getColorBg={getColorBg}
                                />
                            ))
                        )}
                    </div>

                    {/* Gráfico */}
                    <div className="bg-[#eceeec] rounded-[16px] p-6 md:p-8 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[#191c1b] text-[18px] font-bold">Distribución de Gastos</h3>
                            {/* Selector de período */}
                            <div className="bg-white flex gap-1 p-1 rounded-[10px]">
                                {(['dia', 'semana', 'mes', 'año'] as const).map(p => (
                                    <button key={p} onClick={() => setPeriodoGrafico(p)}
                                        className={`px-2 py-1 rounded-[6px] text-[11px] font-bold transition-colors ${periodoGrafico === p ? 'bg-[#006039] text-white' : 'text-[#3f4941] hover:bg-[#f2f4f2]'
                                            }`}>
                                        {p === 'dia' ? 'Hoy' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : 'Año'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {barras.every(b => b.total === 0) ? (
                            <div className="flex items-center justify-center py-6">
                                <p className="text-[#6f7a71] text-[13px]">Sin gastos en este período</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-end gap-1" style={{ height: '120px' }}>
                                    {barras.map((b, i) => (
                                        <div key={i} className="flex-1 group relative flex flex-col justify-end" style={{ height: '100%' }}>
                                            {b.total > 0 && (
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#191c1b] text-white text-[11px] font-bold px-2 py-1 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    ${b.total.toLocaleString('es-AR')}
                                                </div>
                                            )}
                                            <div
                                                className="w-full cursor-pointer transition-all duration-200 group-hover:brightness-75"
                                                style={{
                                                    height: b.total > 0 ? `${Math.max((b.total / maxBarra) * 100, 8)}%` : '4%',
                                                    backgroundColor: b.esActual ? '#006039' : b.total > 0 ? '#b2cdba' : '#e1e3e1',
                                                    borderRadius: '4px 4px 0 0',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between overflow-hidden">
                                    {barras.map((b, i) => {
                                        const mostrar = periodoGrafico === 'mes' ? i % 5 === 0 :
                                            periodoGrafico === 'dia' ? i % 4 === 0 : true
                                        return (
                                            <span key={i} className={`flex-1 text-center text-[9px] font-bold uppercase truncate ${b.esActual ? 'text-[#006039]' : 'text-[#6f7a71]'
                                                } ${!mostrar ? 'opacity-0' : ''}`}>
                                                {b.label}
                                            </span>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Columna derecha — formulario */}
                <div className="flex flex-col gap-6">

                    <div className="bg-white rounded-[16px] p-6 md:p-8 shadow-[0px_20px_25px_rgba(0,96,57,0.05)] border border-[rgba(0,96,57,0.05)] flex flex-col gap-5">
                        <h2 className="text-[#006039] text-[20px] font-extrabold">Registrar Gasto</h2>

                        <form onSubmit={handleGuardar} className="flex flex-col gap-4">

                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006039] text-[16px] font-bold">$</span>
                                    <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                                        placeholder="0,00" required
                                        className="bg-[#eceeec] rounded-[12px] pl-8 pr-4 py-5 text-[18px] font-bold text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Descripción</label>
                                <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                                    placeholder="Ej: Compra de insumos..." required
                                    className="bg-[#eceeec] rounded-[12px] px-4 py-[17px] text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Fecha</label>
                                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                                    className="bg-[#eceeec] rounded-[12px] px-4 py-[17px] text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Categoría</label>
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
                                        className="bg-[#eceeec] rounded-[12px] px-4 py-[17px] text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full appearance-none">
                                        <option value="">Sin categoría</option>
                                        {categorias.map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <button type="submit" disabled={guardando || !monto || !descripcion}
                                className="w-full py-4 rounded-[12px] text-white text-[16px] font-bold shadow-[0px_20px_25px_-5px_rgba(0,96,57,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}>
                                {guardando ? 'Guardando...' : 'Guardar Gasto'}
                            </button>
                        </form>
                    </div>

                    {/* Tip */}
                    <div className="bg-[#006039] rounded-[16px] p-6">
                        <p className="text-white/80 text-[14px] font-bold mb-1">Tip del Almacén</p>
                        <p className="text-white text-[13px] font-medium leading-[20px]">
                            Registrá tus gastos diariamente para tener un control exacto de tu rentabilidad mensual.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}