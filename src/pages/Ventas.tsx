import { useState } from 'react'

type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'
type EstadoVenta = 'Completado' | 'Pendiente'

interface VentaHistorial {
    id: number
    producto: string
    fecha: string
    monto: string
    estado: EstadoVenta
    imagen: string
}

const ventasHistorial: VentaHistorial[] = [
    { id: 1, producto: 'Pan de Campo x 3', fecha: 'Hoy, 10:45 AM', monto: '$1.250', estado: 'Completado', imagen: '🍞' },
    { id: 2, producto: 'Leche Entera 1L', fecha: 'Hoy, 09:30 AM', monto: '$890', estado: 'Completado', imagen: '🥛' },
    { id: 3, producto: 'Café Premium 250g', fecha: 'Ayer, 18:20 PM', monto: '$3.400', estado: 'Pendiente', imagen: '☕' },
    { id: 4, producto: 'Yerba Mate 1kg', fecha: 'Ayer, 15:10 PM', monto: '$1.850', estado: 'Completado', imagen: '🧉' },
]

export default function Ventas() {
    const [producto, setProducto] = useState('')
    const [cliente, setCliente] = useState('')
    const [cantidad, setCantidad] = useState('1')
    const [precio, setPrecio] = useState('')
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')

    const handleConfirmar = () => {
        // TODO: conectar con API
        alert('Venta registrada!')
    }

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold tracking-[-0.75px] leading-tight">
                    Ventas
                </h1>
                <p className="text-[#3f4941] text-[16px] font-medium">
                    Registrá los ingresos de hoy en tu emprendimiento.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Formulario de venta */}
                <div className="md:col-span-5 bg-white rounded-[12px] p-6 md:p-8 shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col gap-6">

                    {/* Header form */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#cbe6d3] rounded-full flex items-center justify-center text-[18px]">
                            🛒
                        </div>
                        <h2 className="text-[#191c1b] text-[20px] font-bold">¿Qué vendiste?</h2>
                    </div>

                    {/* Campos */}
                    <div className="flex flex-col gap-5">

                        {/* Producto */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">
                                Producto o Concepto
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={producto}
                                    onChange={e => setProducto(e.target.value)}
                                    placeholder="Ej. Pan, Leche, Yerba..."
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#506859]">🔍</span>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">
                                Cliente
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cliente}
                                    onChange={e => setCliente(e.target.value)}
                                    placeholder="Ej. Juan Perez"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#506859]">▾</span>
                            </div>
                        </div>

                        {/* Cantidad y Precio */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    value={cantidad}
                                    onChange={e => setCantidad(e.target.value)}
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-[17px] text-[16px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">
                                    Precio Unitario
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3f4941] text-[16px]">$</span>
                                    <input
                                        type="number"
                                        value={precio}
                                        onChange={e => setPrecio(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-[#eceeec] rounded-[8px] pl-8 pr-4 py-[17px] text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase px-1">
                                Método de Pago
                            </label>
                            <div className="flex gap-2">
                                {(['efectivo', 'tarjeta', 'transferencia'] as MetodoPago[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMetodoPago(m)}
                                        className={`flex-1 py-3 rounded-[8px] text-[12px] font-bold capitalize transition-colors border-2 ${metodoPago === m
                                                ? 'bg-[#cbe6d3] border-[#006039] text-[#506859]'
                                                : 'bg-[#eceeec] border-transparent text-[#3f4941]'
                                            }`}
                                    >
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            className="w-full py-5 rounded-[8px] text-white text-[18px] font-extrabold"
                            style={{ background: 'linear-gradient(137deg, #6f7a71 0%, #506859 100%)' }}
                        >
                            Agregar Producto
                        </button>
                        <button
                            onClick={handleConfirmar}
                            className="w-full py-5 rounded-[8px] text-white text-[18px] font-extrabold shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                            style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}
                        >
                            Confirmar Venta
                        </button>
                    </div>
                </div>

                {/* Historial de ventas */}
                <div className="md:col-span-7 flex flex-col gap-6">

                    {/* Header */}
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[#191c1b] text-[20px] font-bold">Historial de ventas</h2>
                        <button className="bg-[#f2f4f2] flex items-center gap-2 px-4 py-2 rounded-[8px] text-[#3f4941] text-[14px] font-bold">
                            ▾ Filtrar
                        </button>
                    </div>

                    {/* Tabla */}
                    <div className="bg-[#f2f4f2] rounded-[12px] overflow-hidden shadow-sm">

                        {/* Header tabla */}
                        <div className="bg-[#e6e9e7] grid grid-cols-12 px-6 py-4">
                            <div className="col-span-5">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Detalle</span>
                            </div>
                            <div className="col-span-3 text-right">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Monto</span>
                            </div>
                            <div className="col-span-4 text-right">
                                <span className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Estado</span>
                            </div>
                        </div>

                        {/* Filas */}
                        {ventasHistorial.map((venta, i) => (
                            <div
                                key={venta.id}
                                className={`grid grid-cols-12 px-6 py-5 items-center ${i > 0 ? 'border-t border-[rgba(230,233,231,0.5)]' : ''}`}
                            >
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#cee9d6] rounded-[8px] flex items-center justify-center text-[18px] shrink-0">
                                        {venta.imagen}
                                    </div>
                                    <div>
                                        <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold leading-tight">{venta.producto}</p>
                                        <p className="text-[#3f4941] text-[12px]">{venta.fecha}</p>
                                    </div>
                                </div>
                                <div className="col-span-3 text-right">
                                    <p className="text-[#191c1b] text-[14px] md:text-[16px] font-extrabold">{venta.monto}</p>
                                </div>
                                <div className="col-span-4 flex justify-end">
                                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${venta.estado === 'Completado'
                                            ? 'bg-[#cee9d6] text-[#344c3e]'
                                            : 'bg-[#ffdada] text-[#7b2c33]'
                                        }`}>
                                        {venta.estado}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Ver más */}
                        <div className="flex justify-center py-5 border-t border-[rgba(230,233,231,0.5)]">
                            <button className="text-[#006039] text-[16px] font-bold flex items-center gap-2">
                                Ver más ventas ▾
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#eceeec] rounded-[12px] p-6 flex flex-col justify-between h-[160px]">
                            <p className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Ventas Hoy</p>
                            <div>
                                <p className="text-[#006039] text-[28px] md:text-[30px] font-extrabold">$45.600</p>
                                <p className="text-[#1a7a4d] text-[12px] font-bold">+12% vs ayer</p>
                            </div>
                        </div>
                        <div className="bg-[#eceeec] rounded-[12px] p-6 flex flex-col justify-between h-[160px]">
                            <p className="text-[#3f4941] text-[12px] font-bold tracking-[1.2px] uppercase">Ticket Promedio</p>
                            <p className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold">$2.400</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}