import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { getVentas, getGastos, getProductos } from '../services/api'

type Periodo = 'hoy' | 'semana' | 'mes'

interface VentaAPI {
    id: number
    estado: string
    total: string
    fecha: string
    notas?: string
    cliente?: { nombre: string }
}

interface GastoAPI {
    id: number
    monto: string
    fecha: string
    descripcion: string
}

interface ProductoAPI {
    id: number
    nombre: string
    stockTotal: number
    stockMinimo: number
    activo: boolean
}

const diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM']

export default function Dashboard() {
    const [periodo, setPeriodo] = useState<Periodo>('hoy')
    const navigate = useNavigate()
    const { user } = useAuth0()
    const { emprendimientoActivo } = useEmprendimiento()

    const [ventas, setVentas] = useState<VentaAPI[]>([])
    const [gastos, setGastos] = useState<GastoAPI[]>([])
    const [productos, setProductos] = useState<ProductoAPI[]>([])
    const [loading, setLoading] = useState(true)

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
                console.error('Error cargando dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [emprendimientoActivo])

    // Filtrar por período
    const filtrarPorPeriodo = <T extends { fecha: string }>(items: T[]): T[] => {
        const ahora = new Date()
        return items.filter(item => {
            const fecha = new Date(item.fecha)
            if (periodo === 'hoy') {
                return fecha.toDateString() === ahora.toDateString()
            } else if (periodo === 'semana') {
                const inicioSemana = new Date(ahora)
                const dia = ahora.getDay() === 0 ? 7 : ahora.getDay()
                inicioSemana.setDate(ahora.getDate() - dia + 1)
                inicioSemana.setHours(0, 0, 0, 0)
                return fecha >= inicioSemana
            } else {
                return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
            }
        })
    }

    const ventasFiltradas = filtrarPorPeriodo(ventas)
    const gastosFiltrados = filtrarPorPeriodo(gastos)

    const totalVentas = ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.total), 0)
    const totalGastos = gastosFiltrados.reduce((acc, g) => acc + parseFloat(g.monto), 0)
    const gananciaEstimada = totalVentas - totalGastos

    // Ventas recientes — últimas 5
    const ventasRecientes = [...ventas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5)

    // Stock crítico
    const productosAgotados = productos.filter(p => p.activo && p.stockTotal === 0)
    const productosBajoStock = productos.filter(p => p.activo && p.stockTotal > 0 && p.stockTotal <= p.stockMinimo)
    const totalCriticos = productosAgotados.length + productosBajoStock.length

    // Flujo semanal — ventas por día de esta semana
    const ahora = new Date()
    const inicioSemana = new Date(Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()))
    const diaSemana = inicioSemana.getUTCDay() === 0 ? 7 : inicioSemana.getUTCDay()
    inicioSemana.setUTCDate(inicioSemana.getUTCDate() - diaSemana + 1)

    const flujoSemanal = diasSemana.map((dia, i) => {
        const fecha = new Date(inicioSemana)
        fecha.setUTCDate(inicioSemana.getUTCDate() + i)
        const totalDia = ventas
            .filter(v => {
                const fv = new Date(v.fecha)
                return fv.getUTCFullYear() === fecha.getUTCFullYear() &&
                    fv.getUTCMonth() === fecha.getUTCMonth() &&
                    fv.getUTCDate() === fecha.getUTCDate()
            })
            .reduce((acc, v) => acc + parseFloat(v.total), 0)
        const esHoy = fecha.getUTCDate() === ahora.getUTCDate() &&
            fecha.getUTCMonth() === ahora.getUTCMonth() &&
            fecha.getUTCFullYear() === ahora.getUTCFullYear()
        return { dia, total: totalDia, esHoy }
    })

    const maxFlujo = Math.max(...flujoSemanal.map(d => d.total), 1)

    const formatMonto = (n: number) => `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`

    const formatFecha = (fecha: string) => {
        const d = new Date(fecha)
        const hoy = new Date()
        const esHoy = d.toDateString() === hoy.toDateString()
        if (esHoy) return `Hoy, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }

    // Comparación con período anterior
    const calcularComparacion = () => {
        const ahora = new Date()
        const ventasAnteriores = ventas.filter(v => {
            const fecha = new Date(v.fecha)
            if (periodo === 'hoy') {
                const ayer = new Date(ahora); ayer.setDate(ayer.getDate() - 1)
                return fecha.toDateString() === ayer.toDateString()
            } else if (periodo === 'semana') {
                const haceDias = new Date(ahora); haceDias.setDate(ahora.getDate() - 14)
                const haceUnaSemana = new Date(ahora); haceUnaSemana.setDate(ahora.getDate() - 7)
                return fecha >= haceDias && fecha < haceUnaSemana
            } else {
                const mesAnterior = new Date(ahora); mesAnterior.setMonth(ahora.getMonth() - 1)
                return fecha.getMonth() === mesAnterior.getMonth() && fecha.getFullYear() === mesAnterior.getFullYear()
            }
        })
        const totalAnterior = ventasAnteriores.reduce((acc, v) => acc + parseFloat(v.total), 0)
        if (totalAnterior === 0) return null
        const diff = ((totalVentas - totalAnterior) / totalAnterior) * 100
        return Math.round(diff)
    }

    const comparacion = calcularComparacion()

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#191c1b] text-[28px] md:text-[36px] font-extrabold tracking-[-0.9px] leading-tight">
                        Panel de Control
                    </h1>
                    <p className="text-[#3f4941] text-[14px] md:text-[16px] font-medium">
                        Bienvenido de nuevo, {emprendimientoActivo?.nombre || user?.name || 'Emprendedor'}
                    </p>
                </div>

                {/* Selector de período */}
                <div className="bg-[#f2f4f2] flex gap-1 items-center p-1 rounded-[12px] self-start">
                    {(['hoy', 'semana', 'mes'] as Periodo[]).map((p) => (
                        <button key={p} onClick={() => setPeriodo(p)}
                            className={`px-4 py-2 rounded-[8px] text-[14px] font-semibold capitalize transition-colors ${periodo === p ? 'bg-white text-[#006039] shadow-sm' : 'text-[#3f4941]'
                                }`}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">

                {/* Ventas Totales */}
                <div className="md:col-span-2 bg-white rounded-[12px] p-6 md:p-8 relative overflow-hidden">
                    <div className="flex flex-col gap-2">
                        <p className="text-[#3f4941] text-[12px] md:text-[16px] font-bold tracking-[1.6px] uppercase">
                            Ventas Totales
                        </p>
                        {loading ? (
                            <div className="h-12 bg-[#f2f4f2] rounded-[8px] animate-pulse w-48" />
                        ) : (
                            <p className="text-[#006039] text-[36px] md:text-[48px] font-extrabold leading-none">
                                {formatMonto(totalVentas)}
                            </p>
                        )}
                    </div>
                    {!loading && comparacion !== null && (
                        <div className="flex items-center gap-2 mt-6">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-[8px] ${comparacion >= 0 ? 'bg-[#cbe6d3]' : 'bg-[#ffdada]'}`}>
                                <span className={`text-[14px] font-bold ${comparacion >= 0 ? 'text-[#1a7a4d]' : 'text-[#ba1a1a]'}`}>
                                    {comparacion >= 0 ? '↑' : '↓'}{Math.abs(comparacion)}%
                                </span>
                            </div>
                            <span className="text-[#3f4941] text-[14px]">
                                vs. {periodo === 'hoy' ? 'ayer' : periodo === 'semana' ? 'semana anterior' : 'mes anterior'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Gastos Totales */}
                <div className="bg-[#f2f4f2] rounded-[12px] p-6">
                    <p className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase mb-2">
                        Gastos Totales
                    </p>
                    {loading ? (
                        <div className="h-9 bg-[#e6e9e7] rounded-[8px] animate-pulse w-32 mb-4" />
                    ) : (
                        <p className="text-[#191c1b] text-[28px] md:text-[30px] font-bold leading-none mb-4">
                            {formatMonto(totalGastos)}
                        </p>
                    )}
                    <div className="bg-[#eceeec] h-1 rounded-full w-full mb-2">
                        {!loading && totalVentas > 0 && (
                            <div className="bg-[#8a383e] h-1 rounded-full transition-all"
                                style={{ width: `${Math.min((totalGastos / totalVentas) * 100, 100)}%` }} />
                        )}
                    </div>
                    <p className="text-[#3f4941] text-[12px]">
                        {!loading && totalVentas > 0
                            ? `${Math.round((totalGastos / totalVentas) * 100)}% de las ventas`
                            : 'Sin ventas en el período'}
                    </p>
                </div>

                {/* Ganancia Estimada */}
                <div className="bg-[#006039] rounded-[12px] p-6 relative shadow-[0px_20px_25px_-5px_rgba(0,96,57,0.1)]">
                    <p className="text-white/80 text-[12px] font-bold tracking-[0.6px] uppercase mb-2">
                        Ganancia Estimada
                    </p>
                    {loading ? (
                        <div className="h-9 bg-[rgba(255,255,255,0.2)] rounded-[8px] animate-pulse w-32 mb-4" />
                    ) : (
                        <p className={`text-[28px] md:text-[30px] font-bold leading-none mb-4 ${gananciaEstimada >= 0 ? 'text-white' : 'text-[#ffdada]'}`}>
                            {formatMonto(gananciaEstimada)}
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-[#80d9a3] border-2 border-[#006039]" />
                            <div className="w-6 h-6 rounded-full bg-[#cee9d6] border-2 border-[#006039] -ml-2" />
                        </div>
                        <span className="text-white text-[12px] font-medium">
                            {ventasFiltradas.length} ventas en el período
                        </span>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                {/* Ventas recientes + Alerta */}
                <div className="md:col-span-2 flex flex-col gap-6">

                    {/* Ventas recientes */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h2 className="text-[#191c1b] text-[20px] font-bold">Ventas Recientes</h2>
                            <button onClick={() => navigate('/ventas')}
                                className="text-[#006039] text-[14px] font-bold flex items-center gap-1">
                                Ver todas →
                            </button>
                        </div>
                        <div className="bg-white rounded-[12px] overflow-hidden">
                            {/* Header tabla */}
                            <div className="grid grid-cols-4 px-6 py-4 border-b border-[#eceeec]">
                                <div className="col-span-2">
                                    <span className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">Producto / Cliente</span>
                                </div>
                                <div>
                                    <span className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">Fecha</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">Monto</span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <p className="text-[#3f4941] text-[14px]">Cargando...</p>
                                </div>
                            ) : ventasRecientes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                    <span className="text-[28px]">🛒</span>
                                    <p className="text-[#3f4941] text-[14px]">No hay ventas todavía</p>
                                </div>
                            ) : (
                                ventasRecientes.map((venta, i) => (
                                    <div key={venta.id}
                                        className={`grid grid-cols-4 px-6 py-5 items-center ${i > 0 ? 'border-t border-[rgba(236,238,236,0.3)]' : ''}`}>
                                        <div className="col-span-2 flex items-center gap-4">
                                            <div className="hidden md:flex w-10 h-10 bg-[#cbe6d3] rounded-[8px] flex items-center justify-center shrink-0">
                                                <span className="text-[#006039] text-[16px]">🛒</span>
                                            </div>
                                            <div>
                                                <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">
                                                    {venta.notas || `Venta #${venta.id}`}
                                                </p>
                                                <p className="text-[#3f4941] text-[12px]">
                                                    {venta.cliente ? `Cliente: ${venta.cliente.nombre}` : 'Sin cliente'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[#3f4941] text-[14px]">{formatFecha(venta.fecha)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">
                                                {formatMonto(parseFloat(venta.total))}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Alerta stock */}
                    {!loading && totalCriticos > 0 && (
                        <div className="bg-[rgba(168,79,85,0.2)] rounded-[12px] p-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#a84f55] rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-white text-[20px]">⚠️</span>
                                </div>
                                <div>
                                    <p className="text-[#7b2c33] text-[16px] font-bold">Alerta de Stock Crítico</p>
                                    <p className="text-[rgba(123,44,51,0.8)] text-[14px]">
                                        {productosAgotados.length > 0 && `${productosAgotados.length} sin existencias`}
                                        {productosAgotados.length > 0 && productosBajoStock.length > 0 && ' • '}
                                        {productosBajoStock.length > 0 && `${productosBajoStock.length} bajo stock mínimo`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/productos')}
                                className="bg-[#a84f55] text-[#ffe7e6] text-[14px] md:text-[16px] font-bold px-4 md:px-8 py-2 rounded-[8px] shrink-0">
                                Ver Detalles
                            </button>
                        </div>
                    )}
                </div>

                {/* Panel derecho */}
                <div className="flex flex-col gap-6 md:gap-8">

                    {/* Acciones rápidas */}
                    <div>
                        <h2 className="text-[#191c1b] text-[20px] font-bold mb-4">Acciones Rápidas</h2>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Nueva Venta', path: '/ventas', emoji: '🛒' },
                                { label: 'Nuevo Gasto', path: '/gastos', emoji: '💳' },
                                { label: 'Ver Stock', path: '/productos', emoji: '📦' },
                            ].map((accion) => (
                                <button key={accion.path} onClick={() => navigate(accion.path)}
                                    className="bg-white rounded-[12px] p-4 flex items-center justify-between hover:bg-[#f8faf8] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-[#f2f4f2] rounded-[10px] flex items-center justify-center text-[20px]">
                                            {accion.emoji}
                                        </div>
                                        <span className="text-[#191c1b] text-[16px] font-bold">{accion.label}</span>
                                    </div>
                                    <span className="text-[#3f4941] text-[16px]">→</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tip del día */}
                    <div className="bg-[#e6e9e7] rounded-[16px] p-6">
                        <h3 className="text-[#006039] text-[18px] font-bold mb-2">Tip del Día</h3>
                        <p className="text-[#3f4941] text-[14px] leading-[22px] mb-4">
                            {totalCriticos > 0
                                ? `Tenés ${totalCriticos} producto${totalCriticos > 1 ? 's' : ''} con stock crítico. Considerá hacer un pedido pronto para no perder ventas.`
                                : 'Registrá tus gastos diariamente para tener un control exacto de tu rentabilidad mensual.'}
                        </p>
                        <button className="text-[#006039] text-[12px] font-extrabold tracking-[1.2px] uppercase">
                            SABER MÁS
                        </button>
                    </div>

                    {/* Flujo semanal */}
                    <div className="bg-white rounded-[12px] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[#191c1b] text-[16px] font-bold">Flujo Semanal</h3>
                            <span className="bg-[#cbe6d3] text-[#006039] text-[10px] font-bold px-2 py-0.5 rounded-full">EN VIVO</span>
                        </div>
                        {flujoSemanal.every(d => d.total === 0) ? (
                            <div className="flex items-center justify-center py-6">
                                <p className="text-[#6f7a71] text-[12px]">Sin ventas esta semana</p>
                            </div>
                        ) : (
                            <div className="flex items-end gap-1 h-24 mb-3" >
                                {flujoSemanal.map((d) => (
                                    <div key={d.dia} className="flex-1 group relative flex flex-col justify-end" style={{ height: '100%' }}>
                                        {d.total > 0 && (
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#191c1b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {formatMonto(d.total)}
                                            </div>
                                        )}
                                        <div
                                            className="w-full rounded-t-sm cursor-pointer transition-all duration-200 group-hover:brightness-75"
                                            style={{
                                                height: d.total > 0 ? `${Math.max((d.total / maxFlujo) * 100, 8)}%` : '4%',
                                                backgroundColor: d.esHoy ? '#006039' : d.total > 0 ? '#b2cdba' : '#eceeec',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            {flujoSemanal.map((d) => (
                                <span key={d.dia} className={`flex-1 text-center text-[10px] font-bold tracking-[-0.5px] uppercase ${d.esHoy ? 'text-[#006039]' : 'text-[#3f4941]'}`}>
                                    {d.dia}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}