import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

type Periodo = 'hoy' | 'semana' | 'mes'


const ventasRecientes = [
    { id: 1, producto: 'Yerba Mate Playadito 1kg', cliente: 'Particular', fecha: 'Hoy, 14:20', monto: '$3.200' },
    { id: 2, producto: 'Coca-Cola 2.25L x6', cliente: 'Distribuidora Norte', fecha: 'Hoy, 12:45', monto: '$18.500' },
    { id: 3, producto: 'Pan Felipe Artesanal (Bolsa)', cliente: 'María L.', fecha: 'Hoy, 09:15', monto: '$1.450' },
]

const diasSemana = [
    { dia: 'LUN', valor: 38, activo: false },
    { dia: 'MAR', valor: 62, activo: false },
    { dia: 'MIE', valor: 48, activo: false },
    { dia: 'JUE', valor: 82, activo: false },
    { dia: 'VIE', valor: 91, activo: true },
    { dia: 'SAB', valor: 19, activo: false },
    { dia: 'DOM', valor: 10, activo: false },
]

export default function Dashboard() {
    const [periodo, setPeriodo] = useState<Periodo>('hoy')
    const navigate = useNavigate()
    const { user } = useAuth0()
    const { getAccessTokenSilently } = useAuth0()

    useEffect(() => {
        getAccessTokenSilently().then(t => console.log('TOKEN:', t))
    }, [])

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#191c1b] text-[28px] md:text-[36px] font-extrabold tracking-[-0.9px] leading-tight">
                        Panel de Control
                    </h1>
                    <p className="text-[#3f4941] text-[14px] md:text-[16px] font-medium">
                        Bienvenido de nuevo, {user?.name || 'Emprendedor'}
                    </p>
                </div>

                {/* Selector de período */}
                <div className="bg-[#f2f4f2] flex gap-1 items-center p-1 rounded-[12px] self-start">
                    {(['hoy', 'semana', 'mes'] as Periodo[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`px-4 py-2 rounded-[8px] text-[14px] font-semibold capitalize transition-colors ${periodo === p
                                    ? 'bg-white text-[#006039] shadow-sm'
                                    : 'text-[#3f4941]'
                                }`}
                        >
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
                        <p className="text-[#006039] text-[36px] md:text-[48px] font-extrabold leading-none">
                            $245.890
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        <div className="bg-[#cbe6d3] flex items-center gap-1 px-2 py-1 rounded-[8px]">
                            <span className="text-[#1a7a4d] text-[14px] font-bold">↑12%</span>
                        </div>
                        <span className="text-[#3f4941] text-[14px]">vs. ayer</span>
                    </div>
                </div>

                {/* Gastos Totales */}
                <div className="bg-[#f2f4f2] rounded-[12px] p-6">
                    <p className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase mb-2">
                        Gastos Totales
                    </p>
                    <p className="text-[#191c1b] text-[28px] md:text-[30px] font-bold leading-none mb-4">
                        $84.200
                    </p>
                    <div className="bg-[#eceeec] h-1 rounded-full w-full mb-2">
                        <div className="bg-[#8a383e] h-1 rounded-full w-[67%]" />
                    </div>
                    <p className="text-[#3f4941] text-[12px]">68% del presupuesto mensual</p>
                </div>

                {/* Ganancia Estimada */}
                <div className="bg-[#006039] rounded-[12px] p-6 relative shadow-[0px_20px_25px_-5px_rgba(0,96,57,0.1)]">
                    <p className="text-white/80 text-[12px] font-bold tracking-[0.6px] uppercase mb-2">
                        Ganancia Estimada
                    </p>
                    <p className="text-white text-[28px] md:text-[30px] font-bold leading-none mb-4">
                        $161.690
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-[#80d9a3] border-2 border-[#006039]" />
                            <div className="w-6 h-6 rounded-full bg-[#cee9d6] border-2 border-[#006039] -ml-2" />
                        </div>
                        <span className="text-white text-[12px] font-medium">+4 metas alcanzadas</span>
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
                            <button
                                onClick={() => navigate('/ventas')}
                                className="text-[#006039] text-[14px] font-bold flex items-center gap-1"
                            >
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
                            {/* Filas */}
                            {ventasRecientes.map((venta, i) => (
                                <div
                                    key={venta.id}
                                    className={`grid grid-cols-4 px-6 py-5 items-center ${i > 0 ? 'border-t border-[rgba(236,238,236,0.3)]' : ''}`}
                                >
                                    <div className="col-span-2 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#cbe6d3] rounded-[8px] flex items-center justify-center shrink-0">
                                            <span className="text-[#006039] text-[16px]">🛒</span>
                                        </div>
                                        <div>
                                            <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{venta.producto}</p>
                                            <p className="text-[#3f4941] text-[12px]">Cliente: {venta.cliente}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[#3f4941] text-[14px]">{venta.fecha}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{venta.monto}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alerta stock */}
                    <div className="bg-[rgba(168,79,85,0.2)] rounded-[12px] p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#a84f55] rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white text-[20px]">⚠️</span>
                            </div>
                            <div>
                                <p className="text-[#7b2c33] text-[16px] font-bold">Alerta de Stock Crítico</p>
                                <p className="text-[rgba(123,44,51,0.8)] text-[14px]">3 productos están por debajo del mínimo establecido.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/productos')}
                            className="bg-[#a84f55] text-[#ffe7e6] text-[14px] md:text-[16px] font-bold px-4 md:px-8 py-2 rounded-[8px] shrink-0"
                        >
                            Ver Detalles
                        </button>
                    </div>
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
                                <button
                                    key={accion.path}
                                    onClick={() => navigate(accion.path)}
                                    className="bg-white rounded-[12px] p-4 flex items-center justify-between hover:bg-[#f8faf8] transition-colors"
                                >
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
                            Las ventas de lácteos subieron un 15% los lunes. Considera realizar pedidos los domingos por la tarde para no perder stock.
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
                        <div className="flex items-end justify-between gap-1 h-24 mb-3">
                            {diasSemana.map((d) => (
                                <div key={d.dia} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className={`w-full rounded-t-sm ${d.activo ? 'bg-[#006039]' : d.valor > 30 ? 'bg-[#b2cdba]' : 'bg-[#eceeec]'}`}
                                        style={{ height: `${d.valor}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            {diasSemana.map((d) => (
                                <span
                                    key={d.dia}
                                    className={`flex-1 text-center text-[10px] font-bold tracking-[-0.5px] uppercase ${d.activo ? 'text-[#006039]' : 'text-[#3f4941]'}`}
                                >
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