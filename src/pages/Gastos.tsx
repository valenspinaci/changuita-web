import { useState } from 'react'

type Categoria = 'Todo' | 'Insumos' | 'Servicios' | 'Logística'
type EstadoGasto = 'Pagado' | 'Pendiente'

interface Gasto {
    id: number
    descripcion: string
    fecha: string
    categoria: string
    monto: string
    estado: EstadoGasto
    emoji: string
    colorBg: string
}

const gastosData: Gasto[] = [
    { id: 1, descripcion: 'Compra de Harina 000', fecha: 'Hace 2 horas', categoria: 'Insumos', monto: '-$12.400,00', estado: 'Pagado', emoji: '🛒', colorBg: '#cbe6d3' },
    { id: 2, descripcion: 'Factura de Luz - Local', fecha: 'Ayer', categoria: 'Servicios', monto: '-$8.200,00', estado: 'Pendiente', emoji: '⚡', colorBg: '#ffe7e6' },
    { id: 3, descripcion: 'Envío a Sucursal Norte', fecha: '15 Oct', categoria: 'Logística', monto: '-$3.500,00', estado: 'Pagado', emoji: '🚚', colorBg: '#cbe6d3' },
]

const distribucion = [
    { dia: 'LUNES', altura: 63, color: 'rgba(0,96,57,0.2)' },
    { dia: 'MARTES', altura: 100, color: '#006039' },
    { dia: 'MIÉRC.', altura: 31, color: 'rgba(0,96,57,0.4)' },
    { dia: 'JUEVES', altura: 47, color: 'rgba(0,96,57,0.1)' },
]

export default function Gastos() {
    const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todo')
    const [monto, setMonto] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [categoria, setCategoria] = useState('Insumos')

    const handleGuardar = () => {
        // TODO: conectar con API
        alert('Gasto registrado!')
    }

    const categorias: Categoria[] = ['Todo', 'Insumos', 'Servicios', 'Logística']

    return (
        <div className="flex flex-col gap-8 md:gap-10">

            {/* Hero Stats + Filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-[#006039] text-[10px] font-bold tracking-[1px] uppercase">Balance Mensual</p>
                    <h1 className="text-[#191c1b] text-[36px] md:text-[48px] font-extrabold tracking-[-1.2px] leading-none">
                        $42.850,00
                    </h1>
                    <div className="flex items-center gap-2 pt-1">
                        <div className="bg-[#cbe6d3] flex items-center gap-1 px-2 py-1 rounded-[8px]">
                            <span className="text-[#1a7a4d] text-[14px] font-bold">↑12%</span>
                        </div>
                        <span className="text-[#3f4941] text-[16px]">respecto al mes pasado</span>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-[#f2f4f2] flex gap-1 items-center p-1 rounded-[12px] self-start">
                    {categorias.map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategoriaActiva(c)}
                            className={`px-4 py-2 rounded-[8px] text-[14px] font-semibold transition-colors ${categoriaActiva === c
                                    ? 'bg-white text-[#006039] shadow-sm font-bold'
                                    : 'text-[#3f4941]'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                {/* Columna izquierda — gastos + gráfico */}
                <div className="md:col-span-2 flex flex-col gap-6">

                    {/* Gastos recientes */}
                    <div className="bg-white rounded-[16px] p-8 shadow-sm flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[#191c1b] text-[20px] font-bold tracking-[-0.5px]">Gastos Recientes</h2>
                            <button className="text-[#006039] text-[14px] font-bold flex items-center gap-1">
                                Ver historial completo →
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {gastosData.map((gasto) => (
                                <div key={gasto.id} className="flex items-center justify-between p-4 rounded-[12px] hover:bg-[#f8faf8] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-[20px] shrink-0"
                                            style={{ backgroundColor: gasto.colorBg }}
                                        >
                                            {gasto.emoji}
                                        </div>
                                        <div>
                                            <p className="text-[#191c1b] text-[16px] font-bold">{gasto.descripcion}</p>
                                            <p className="text-[#6f7a71] text-[12px]">{gasto.fecha} • {gasto.categoria}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-[#191c1b] text-[16px] font-bold">{gasto.monto}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gasto.estado === 'Pagado'
                                                ? 'bg-[#cee9d6] text-[#344c3e]'
                                                : 'bg-[#ffdada] text-[#7b2c33]'
                                            }`}>
                                            {gasto.estado}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribución de gastos */}
                    <div className="bg-[#eceeec] rounded-[16px] p-8 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[#191c1b] text-[18px] font-bold">Distribución de Gastos</h3>
                            <span className="text-[#6f7a71] text-[12px]">Últimos 30 días</span>
                        </div>

                        {/* Barras */}
                        <div className="flex items-end gap-3 h-[136px] px-4 pt-2">
                            {distribucion.map((d) => (
                                <div key={d.dia} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full rounded-t-[8px]"
                                        style={{ height: `${d.altura}%`, backgroundColor: d.color }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Labels */}
                        <div className="flex items-center justify-between px-4">
                            {distribucion.map((d) => (
                                <span key={d.dia} className="flex-1 text-center text-[#6f7a71] text-[10px] font-bold tracking-[0.5px] uppercase">
                                    {d.dia}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Columna derecha — formulario + tip + scanner */}
                <div className="flex flex-col gap-6">

                    {/* Formulario */}
                    <div className="bg-white rounded-[16px] p-8 shadow-[0px_20px_25px_rgba(0,96,57,0.05)] border border-[rgba(0,96,57,0.05)] flex flex-col gap-5">
                        <h2 className="text-[#006039] text-[20px] font-extrabold">Registrar Gasto</h2>

                        {/* Monto */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Monto</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006039] text-[16px] font-bold">$</span>
                                <input
                                    type="number"
                                    value={monto}
                                    onChange={e => setMonto(e.target.value)}
                                    placeholder="0,00"
                                    className="bg-[#eceeec] rounded-[12px] pl-8 pr-4 py-5 text-[18px] font-bold text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Descripción</label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Ej: Compra de insumos..."
                                className="bg-[#eceeec] rounded-[12px] px-4 py-[17px] text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                            />
                        </div>

                        {/* Categoría */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#6f7a71] text-[10px] font-bold tracking-[1px] uppercase">Categoría</label>
                            <select
                                value={categoria}
                                onChange={e => setCategoria(e.target.value)}
                                className="bg-[#eceeec] rounded-[12px] px-4 py-[17px] text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full appearance-none"
                            >
                                <option>Insumos</option>
                                <option>Servicios</option>
                                <option>Logística</option>
                                <option>Otros</option>
                            </select>
                        </div>

                        {/* Botón */}
                        <button
                            onClick={handleGuardar}
                            className="w-full py-4 rounded-[12px] text-white text-[16px] font-bold shadow-[0px_20px_25px_-5px_rgba(0,96,57,0.2)]"
                            style={{ background: 'linear-gradient(137deg, #006039 0%, #1a7a4d 100%)' }}
                        >
                            Guardar Gasto
                        </button>
                    </div>

                    {/* Tip del Almacén */}
                    <div className="bg-[#006039] rounded-[16px] p-6 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-1">
                            <p className="text-white/80 text-[16px] font-bold">Tip del Almacén</p>
                            <p className="text-white text-[14px] font-medium leading-[22px]">
                                Tus gastos de <span className="font-extrabold underline decoration-[#cbe6d3]">logística</span> bajaron un 5% esta semana. ¡Buen trabajo!
                            </p>
                        </div>
                    </div>

                    {/* Escanear ticket */}
                    <div className="bg-[#f2f4f2] rounded-[16px] p-6 border-2 border-dashed border-[#bec9bf] flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[20px]">
                            🧾
                        </div>
                        <p className="text-[#191c1b] text-[12px] font-bold">Escanear Ticket</p>
                        <p className="text-[#6f7a71] text-[10px] text-center leading-[15px]">
                            Usa la cámara para registrar automáticamente
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}