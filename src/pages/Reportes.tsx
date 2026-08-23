import { useState, useEffect } from 'react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getVentas, getGastos, getProductos } from '../services/api'
import HelpTooltip from '../components/HelpTooltip'

interface VentaAPI {
    id: number
    total: string
    fecha: string
    notas?: string
    estado: string
    cliente?: { nombre: string }
}

interface GastoAPI {
    id: number
    monto: string
    fecha: string
    descripcion: string
    categoria?: { nombre: string }
}

interface ProductoAPI {
    id: number
    nombre: string
    stockTotal: number
    categoria?: { nombre: string }
}

type Periodo = 'hoy' | 'semana' | 'mes' | 'personalizado'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function getPeriodoRange(periodo: Periodo, fechaDesde: string, fechaHasta: string): { desde: Date; hasta: Date; label: string } {
    const ahora = new Date()
    switch (periodo) {
        case 'hoy': {
            const desde = new Date(ahora); desde.setHours(0, 0, 0, 0)
            const hasta = new Date(ahora); hasta.setHours(23, 59, 59, 999)
            return { desde, hasta, label: 'Hoy' }
        }
        case 'semana': {
            const dia = ahora.getDay() === 0 ? 7 : ahora.getDay()
            const desde = new Date(ahora); desde.setDate(ahora.getDate() - dia + 1); desde.setHours(0, 0, 0, 0)
            const hasta = new Date(ahora); hasta.setHours(23, 59, 59, 999)
            return { desde, hasta, label: 'Esta semana' }
        }
        case 'mes': {
            const desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
            const hasta = new Date(ahora); hasta.setHours(23, 59, 59, 999)
            return { desde, hasta, label: `${MESES[ahora.getMonth()]} ${ahora.getFullYear()}` }
        }
        case 'personalizado': {
            const desde = fechaDesde ? new Date(fechaDesde + 'T00:00:00') : new Date(ahora.getFullYear(), ahora.getMonth(), 1)
            const hasta = fechaHasta ? new Date(fechaHasta + 'T23:59:59') : new Date(ahora)
            return {
                desde, hasta,
                label: fechaDesde && fechaHasta ? `${fechaDesde} → ${fechaHasta}` : 'Personalizado'
            }
        }
    }
}

export default function Reportes() {
    const { emprendimientoActivo } = useEmprendimiento()
    const [ventas, setVentas] = useState<VentaAPI[]>([])
    const [gastos, setGastos] = useState<GastoAPI[]>([])
    const [productos, setProductos] = useState<ProductoAPI[]>([])
    const [loading, setLoading] = useState(true)
    const [tooltipDia, setTooltipDia] = useState<number | null>(null)

    const [periodo, setPeriodo] = useState<Periodo>('mes')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')
    const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false)

    useEffect(() => {
        const cargar = async () => {
            if (!emprendimientoActivo) return
            try {
                setLoading(true)
                const [ventasData, gastosData, productosData] = await Promise.all([
                    getVentas(emprendimientoActivo.id),
                    getGastos(emprendimientoActivo.id),
                    getProductos(emprendimientoActivo.id),
                ])
                setVentas(ventasData)
                setGastos(gastosData)
                setProductos(productosData)
            } catch (err) {
                console.error('Error cargando reportes:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [emprendimientoActivo])

    const { desde, hasta, label } = getPeriodoRange(periodo, fechaDesde, fechaHasta)

    const ventasPeriodo = ventas.filter(v => { const f = new Date(v.fecha); return f >= desde && f <= hasta })
    const gastosPeriodo = gastos.filter(g => { const f = new Date(g.fecha); return f >= desde && f <= hasta })

    const totalIngresos = ventasPeriodo.reduce((acc, v) => acc + parseFloat(v.total), 0)
    const totalGastos = gastosPeriodo.reduce((acc, g) => acc + parseFloat(g.monto), 0)
    const balanceNeto = totalIngresos - totalGastos
    const margen = totalIngresos > 0 ? ((balanceNeto / totalIngresos) * 100).toFixed(1) : '0'

    const diffMs = hasta.getTime() - desde.getTime()
    const desdeAnterior = new Date(desde.getTime() - diffMs)
    const hastaAnterior = new Date(desde.getTime() - 1)
    const ventasAnterior = ventas.filter(v => { const f = new Date(v.fecha); return f >= desdeAnterior && f <= hastaAnterior })
    const totalIngresosAnterior = ventasAnterior.reduce((acc, v) => acc + parseFloat(v.total), 0)
    const pctCambio = totalIngresosAnterior > 0 ? Math.round(((totalIngresos - totalIngresosAnterior) / totalIngresosAnterior) * 100) : null
    const difIngresos = totalIngresos - totalIngresosAnterior

    const generarFlujo = () => {
        if (periodo === 'hoy') {
            return Array.from({ length: 24 }, (_, h) => {
                const totalV = ventasPeriodo.filter(v => new Date(v.fecha).getHours() === h).reduce((a, v) => a + parseFloat(v.total), 0)
                const totalG = gastosPeriodo.filter(g => new Date(g.fecha).getHours() === h).reduce((a, g) => a + parseFloat(g.monto), 0)
                return { label: `${h}h`, ventas: totalV, gastos: totalG }
            }).filter(d => d.ventas > 0 || d.gastos > 0).slice(0, 12)
        }

        if (periodo === 'semana') {
            const ahora = new Date()
            const dia = ahora.getDay() === 0 ? 7 : ahora.getDay()
            const inicioSemana = new Date(ahora)
            inicioSemana.setDate(ahora.getDate() - dia + 1)
            inicioSemana.setHours(0, 0, 0, 0)
            return DIAS.map((d, i) => {
                const fecha = new Date(inicioSemana)
                fecha.setDate(inicioSemana.getDate() + i)
                const totalV = ventas.filter(v => new Date(v.fecha).toDateString() === fecha.toDateString()).reduce((a, v) => a + parseFloat(v.total), 0)
                const totalG = gastos.filter(g => new Date(g.fecha).toDateString() === fecha.toDateString()).reduce((a, g) => a + parseFloat(g.monto), 0)
                return { label: d, ventas: totalV, gastos: totalG }
            })
        }

        const dias: { label: string; ventas: number; gastos: number }[] = []
        const cursor = new Date(desde); cursor.setHours(0, 0, 0, 0)
        const fin = new Date(hasta); fin.setHours(23, 59, 59, 999)
        while (cursor <= fin) {
            const diaStr = cursor.toDateString()
            const totalV = ventas.filter(v => new Date(v.fecha).toDateString() === diaStr).reduce((a, v) => a + parseFloat(v.total), 0)
            const totalG = gastos.filter(g => new Date(g.fecha).toDateString() === diaStr).reduce((a, g) => a + parseFloat(g.monto), 0)
            dias.push({ label: `${cursor.getDate()}/${cursor.getMonth() + 1}`, ventas: totalV, gastos: totalG })
            cursor.setDate(cursor.getDate() + 1)
        }
        if (dias.length > 14) {
            const semanas: { label: string; ventas: number; gastos: number }[] = []
            for (let i = 0; i < dias.length; i += 7) {
                const chunk = dias.slice(i, i + 7)
                semanas.push({ label: `S${Math.floor(i / 7) + 1}`, ventas: chunk.reduce((a, d) => a + d.ventas, 0), gastos: chunk.reduce((a, d) => a + d.gastos, 0) })
            }
            return semanas
        }
        return dias
    }

    const flujo = generarFlujo()
    const maxFlujo = Math.max(...flujo.map(d => Math.max(d.ventas, d.gastos)), 1)

    const masVendidos = [...productos].sort((a, b) => b.stockTotal - a.stockTotal).slice(0, 3)

    const transacciones = [
        ...ventasPeriodo.map(v => ({
            id: v.id, fecha: v.fecha,
            concepto: v.notas || `Venta #${v.id}${v.cliente ? ` - ${v.cliente.nombre}` : ''}`,
            categoria: 'VENTA', monto: parseFloat(v.total), estado: v.estado, tipo: 'venta' as const,
        })),
        ...gastosPeriodo.map(g => ({
            id: g.id, fecha: g.fecha, concepto: g.descripcion,
            categoria: 'GASTO', monto: -parseFloat(g.monto), estado: 'COMPLETADO', tipo: 'gasto' as const,
        })),
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 8)

    const formatMonto = (n: number) => `$${Math.abs(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
    const formatFecha = (f: string) => { const d = new Date(f); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}, ${d.getFullYear()}` }
    const getLabelEstado = (e: string) => e === 'COBRADA' || e === 'COMPLETADO' ? 'Completado' : e === 'PENDIENTE' ? 'Pendiente' : 'Cancelado'
    const getColorEstado = (e: string) => e === 'COBRADA' || e === 'COMPLETADO' ? '#006039' : e === 'PENDIENTE' ? '#ba1a1a' : '#6f7a71'

    const handlePeriodo = (p: Periodo) => {
        setPeriodo(p)
        setMostrarPersonalizado(p === 'personalizado')
    }

    const TABS: { key: Periodo; label: string }[] = [
        { key: 'hoy', label: 'Hoy' },
        { key: 'semana', label: 'Semana' },
        { key: 'mes', label: 'Mes' },
        { key: 'personalizado', label: '📅 Personalizado' },
    ]

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold tracking-[-0.75px] leading-tight">
                            Resumen de Crecimiento
                        </h1>
                        <HelpTooltip texto="Elegí un período (hoy, semana, mes o personalizado) para ver tus ventas, gastos y ganancia estimada en gráficos." />
                    </div>
                    <p className="text-[#3f4941] text-[16px]">
                        Monitoreá la salud financiera de tu emprendimiento en tiempo real.
                    </p>
                </div>

                {/* Selector de período */}
                <div className="flex flex-col gap-2 self-start">
                    <div className="bg-[#f2f4f2] flex p-1 rounded-[10px] gap-1">
                        {TABS.map(tab => (
                            <button key={tab.key} onClick={() => handlePeriodo(tab.key)}
                                className={`px-4 py-2 rounded-[8px] text-[13px] font-semibold transition-colors whitespace-nowrap ${periodo === tab.key ? 'bg-white text-[#006039] shadow-sm' : 'text-[#3f4941] hover:text-[#191c1b]'
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {mostrarPersonalizado && (
                        <div className="flex items-center gap-2 bg-white rounded-[10px] px-4 py-3 shadow-sm border border-[#eceeec]">
                            <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                                className="bg-[#f2f4f2] rounded-[6px] px-3 py-1.5 text-[13px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039]" />
                            <span className="text-[#6f7a71] text-[12px] font-bold">→</span>
                            <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                                className="bg-[#f2f4f2] rounded-[6px] px-3 py-1.5 text-[13px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039]" />
                        </div>
                    )}

                    <p className="text-[#6f7a71] text-[12px] text-right">
                        Mostrando: <span className="font-bold text-[#191c1b]">{label}</span>
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-[12px] p-8 shadow-[0px_12px_32px_rgba(25,28,27,0.06)] relative overflow-hidden flex flex-col gap-4">
                    <div className="absolute bg-[rgba(0,96,57,0.05)] right-[-32px] top-[-32px] rounded-full w-24 h-24" />
                    <p className="text-[#344c3e] text-[12px] font-bold tracking-[1.4px] uppercase">INGRESOS TOTALES</p>
                    {loading ? <div className="h-10 bg-[#f2f4f2] rounded animate-pulse w-40" /> : (
                        <div className="flex items-baseline gap-2">
                            <p className="text-[#006039] text-[32px] md:text-[36px] font-extrabold leading-none">{formatMonto(totalIngresos)}</p>
                            {pctCambio !== null && (
                                <span className={`text-[13px] font-bold ${pctCambio >= 0 ? 'text-[#006039]' : 'text-[#8a383e]'}`}>
                                    {pctCambio >= 0 ? '↑' : '↓'}{Math.abs(pctCambio)}%
                                </span>
                            )}
                        </div>
                    )}
                    {!loading && difIngresos !== 0 && (
                        <p className="text-[#3f4941] text-[12px]">{difIngresos >= 0 ? '+' : ''}{formatMonto(difIngresos)} vs período anterior</p>
                    )}
                </div>

                <div className="bg-white rounded-[12px] p-8 shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col gap-4">
                    <p className="text-[#344c3e] text-[12px] font-bold tracking-[1.4px] uppercase">GASTOS OPERATIVOS</p>
                    {loading ? <div className="h-10 bg-[#f2f4f2] rounded animate-pulse w-40" /> : (
                        <p className="text-[#191c1b] text-[32px] md:text-[36px] font-extrabold leading-none">{formatMonto(totalGastos)}</p>
                    )}
                    {!loading && <p className="text-[#3f4941] text-[12px]">{gastosPeriodo.length} gastos en el período</p>}
                </div>

                <div className="bg-white border-l-4 border-[#006039] rounded-[12px] pl-9 pr-8 py-8 shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col gap-4">
                    <p className="text-[#344c3e] text-[12px] font-bold tracking-[1.4px] uppercase">BALANCE NETO</p>
                    {loading ? <div className="h-10 bg-[#f2f4f2] rounded animate-pulse w-40" /> : (
                        <p className={`text-[32px] md:text-[36px] font-extrabold leading-none ${balanceNeto >= 0 ? 'text-[#006039]' : 'text-[#8a383e]'}`}>
                            {balanceNeto < 0 ? '-' : ''}{formatMonto(balanceNeto)}
                        </p>
                    )}
                    {!loading && <p className="text-[#3f4941] text-[12px]">Margen de ganancia: {margen}%</p>}
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Flujo de Caja */}
                <div className="md:col-span-2 bg-white rounded-[12px] px-8 pt-8 pb-5 shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col gap-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-[#191c1b] text-[18px] font-bold">Flujo de Caja</h2>
                            <p className="text-[#3f4941] text-[14px]">{label} — ingresos vs egresos</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#006039] rounded-full" />
                                <span className="text-[#3f4941] text-[12px] font-bold">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#cbe6d3] rounded-full" />
                                <span className="text-[#3f4941] text-[12px] font-bold">Gastos</span>
                            </div>
                        </div>
                    </div>

                    {flujo.every(d => d.ventas === 0 && d.gastos === 0) ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <span className="text-[28px]">📊</span>
                            <p className="text-[#6f7a71] text-[14px]">Sin datos en este período</p>
                        </div>
                    ) : (
                        <div className="border-b border-[rgba(190,201,191,0.2)] flex items-end justify-between h-[200px] pb-1 pt-10 overflow-visible">
                            {flujo.map((d, i) => (
                                <div key={i}
                                    className="flex-1 min-w-[24px] flex flex-col items-center gap-1 h-full relative"
                                    onMouseEnter={() => setTooltipDia(i)}
                                    onMouseLeave={() => setTooltipDia(null)}>

                                    {/* Tooltip */}
                                    {tooltipDia === i && (d.ventas > 0 || d.gastos > 0) && (
                                        <div className="absolute bottom-[calc(100%-8px)] left-1/2 -translate-x-1/2 bg-[#191c1b] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-[6px] whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                            {d.ventas > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-[#006039] rounded-full inline-block shrink-0" />
                                                    V: {formatMonto(d.ventas)}
                                                </div>
                                            )}
                                            {d.gastos > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-[#cbe6d3] rounded-full inline-block shrink-0" />
                                                    G: {formatMonto(d.gastos)}
                                                </div>
                                            )}
                                            {/* Triángulo */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#191c1b]" />
                                        </div>
                                    )}

                                    {/* Barras */}
                                    <div className="flex items-end gap-1 flex-1 w-full justify-center">
                                        <div className="w-3 md:w-4 bg-[#006039] rounded-t-[2px] transition-all cursor-pointer hover:opacity-80"
                                            style={{ height: d.ventas > 0 ? `${Math.max((d.ventas / maxFlujo) * 100, 4)}%` : '4px' }} />
                                        <div className="w-3 md:w-4 bg-[#cbe6d3] rounded-t-[2px] transition-all cursor-pointer hover:opacity-80"
                                            style={{ height: d.gastos > 0 ? `${Math.max((d.gastos / maxFlujo) * 100, 4)}%` : '4px' }} />
                                    </div>
                                    <span className="text-[#6f7a71] text-[9px] md:text-[11px] font-bold pt-2 whitespace-nowrap">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Más Vendidos */}
                <div className="bg-[#f2f4f2] rounded-[12px] p-8 flex flex-col gap-6">
                    <h2 className="text-[#191c1b] text-[18px] font-bold">Más Vendidos</h2>
                    {loading ? (
                        <div className="flex flex-col gap-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#eceeec] rounded-[8px] animate-pulse" />)}</div>
                    ) : masVendidos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                            <span className="text-[28px]">📦</span>
                            <p className="text-[#6f7a71] text-[14px] text-center">Sin productos registrados</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {masVendidos.map(p => (
                                <div key={p.id} className="bg-white rounded-[8px] p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#cbe6d3] rounded-[4px] flex items-center justify-center text-[16px]">📦</div>
                                        <div>
                                            <p className="text-[#191c1b] text-[14px] font-bold">{p.nombre}</p>
                                            <p className="text-[#6f7a71] text-[10px] tracking-[0.5px] uppercase">{p.categoria?.nombre || 'GENERAL'}</p>
                                        </div>
                                    </div>
                                    <span className="text-[#006039] text-[14px] font-bold">{p.stockTotal} u.</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Transacciones */}
            <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_rgba(25,28,27,0.06)] overflow-hidden">
                <div className="flex items-center justify-between p-8">
                    <div>
                        <h2 className="text-[#191c1b] text-[18px] font-bold">Transacciones del Período</h2>
                        <p className="text-[#6f7a71] text-[13px]">{label} • {transacciones.length} movimientos</p>
                    </div>
                </div>

                <div className="bg-[#f2f4f2] grid grid-cols-12 px-8 py-4">
                    <div className="col-span-2 hidden md:block">
                        <span className="text-[#3f4941] text-[10px] font-bold tracking-[1px] uppercase">Fecha</span>
                    </div>
                    <div className="col-span-7 md:col-span-4">
                        <span className="text-[#3f4941] text-[10px] font-bold tracking-[1px] uppercase">Concepto</span>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                        <span className="text-[#3f4941] text-[10px] font-bold tracking-[1px] uppercase">Categoría</span>
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right">
                        <span className="text-[#3f4941] text-[10px] font-bold tracking-[1px] uppercase">Monto</span>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                        <span className="text-[#3f4941] text-[10px] font-bold tracking-[1px] uppercase">Estado</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-[#3f4941] text-[14px]">Cargando transacciones...</p>
                    </div>
                ) : transacciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <span className="text-[28px]">📊</span>
                        <p className="text-[#3f4941] text-[14px] font-bold">Sin transacciones en este período</p>
                        <p className="text-[#6f7a71] text-[12px]">Probá seleccionando otro rango de fechas</p>
                    </div>
                ) : (
                    transacciones.map((t, i) => (
                        <div key={`${t.tipo}-${t.id}`}
                            className={`grid grid-cols-12 px-8 py-5 items-center ${i > 0 ? 'border-t border-[rgba(190,201,191,0.1)]' : ''}`}>
                            <div className="col-span-2 hidden md:block">
                                <p className="text-[#191c1b] text-[13px]">{formatFecha(t.fecha)}</p>
                            </div>
                            <div className="col-span-7 md:col-span-4">
                                <p className="text-[#191c1b] text-[14px] font-bold truncate pr-4">{t.concepto}</p>
                            </div>
                            <div className="hidden md:block md:col-span-2">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${t.tipo === 'venta' ? 'bg-[#cee9d6] text-[#344c3e]' : 'bg-[#ffdada] text-[#7b2c33]'}`}>
                                    {t.categoria}
                                </span>
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right">
                                <p className={`text-[14px] font-extrabold ${t.monto >= 0 ? 'text-[#006039]' : 'text-[#8a383e]'}`}>
                                    {t.monto < 0 ? '-' : ''}{formatMonto(t.monto)}
                                </p>
                            </div>
                            <div className="hidden md:flex md:col-span-2 items-center gap-2">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getColorEstado(t.estado) }} />
                                <p className="text-[12px] font-medium" style={{ color: getColorEstado(t.estado) }}>
                                    {getLabelEstado(t.estado)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}