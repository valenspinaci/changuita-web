import { useState } from 'react'

interface Cliente {
    id: number
    nombre: string
    telefono: string
    iniciales: string
    tag?: { label: string; textColor: string }
    premium?: boolean
}

interface Compra {
    id: string
    fecha: string
    productos: string
    monto: string
    completado: boolean
}

const clientesData: Cliente[] = [
    { id: 1, nombre: 'Ricardo Martínez', telefono: '+54 11 4455-6677', iniciales: 'RM', premium: true },
    { id: 2, nombre: 'Andrea Moreno', telefono: '+54 11 2233-4455', iniciales: 'AM' },
    { id: 3, nombre: 'Juan Pablo Sosa', telefono: '+54 11 8899-0011', iniciales: 'JP' },
    { id: 4, nombre: 'Luciana Castro', telefono: '+54 11 5566-7788', iniciales: 'LC', tag: { label: 'Moroso', textColor: '#ba1a1a' } },
    { id: 5, nombre: 'Facundo Benítez', telefono: '+54 11 1122-3344', iniciales: 'FB' },
]

const comprasData: Compra[] = [
    { id: '#CH-9210', fecha: '14 Oct, 2023', productos: 'Yogur, Pan, Yerba...', monto: '$4.250', completado: true },
    { id: '#CH-9188', fecha: '08 Oct, 2023', productos: 'Queso cremoso, Jamón', monto: '$2.900', completado: true },
    { id: '#CH-9142', fecha: '01 Oct, 2023', productos: 'Limpieza, Bazar', monto: '$12.100', completado: true },
]

export default function Clientes() {
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente>(clientesData[0])
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [direccion, setDireccion] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)

    const handleRegistrar = () => {
        // TODO: conectar con API
        alert(`Cliente ${nombre} registrado!`)
        setNombre('')
        setTelefono('')
        setDireccion('')
        setMostrarFormulario(false)
    }

    return (
        <div className="flex flex-col gap-6 md:gap-8">

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-[#191c1b] text-[28px] md:text-[36px] font-bold tracking-[-0.9px] leading-tight">
                    Gestión de Clientes
                </h1>
                <p className="text-[#4c6455] text-[16px] font-medium">
                    Administrá tus contactos y construí relaciones con tus compradores frecuentes.
                </p>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Columna izquierda — lista */}
                <div className="md:col-span-4 flex flex-col gap-4">

                    {/* Encabezado lista */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-[#006039] text-[18px] font-bold">Clientes Activos</h2>
                        <button
                            onClick={() => setMostrarFormulario(true)}
                            className="bg-[#cbe6d3] flex items-center gap-1 px-3 py-1 rounded-full text-[#006039] text-[12px] font-bold"
                        >
                            + AGREGAR
                        </button>
                    </div>

                    {/* Lista */}
                    <div className="flex flex-col gap-3">
                        {clientesData.map((cliente) => (
                            <button
                                key={cliente.id}
                                onClick={() => setClienteSeleccionado(cliente)}
                                className={`w-full text-left flex items-center gap-3 p-4 rounded-[12px] transition-all ${clienteSeleccionado.id === cliente.id
                                        ? 'bg-white border-l-4 border-[#006039] shadow-sm pl-3'
                                        : 'bg-[#f8faf8] hover:bg-white'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${clienteSeleccionado.id === cliente.id
                                        ? 'bg-[#cbe6d3] text-[#006039]'
                                        : 'bg-[#e1e3e1] text-[#6f7a71]'
                                    }`}>
                                    {cliente.iniciales}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#191c1b] text-[16px] font-semibold truncate">{cliente.nombre}</p>
                                    <p className="text-[#3f4941] text-[12px]">{cliente.telefono}</p>
                                </div>
                                {cliente.premium && (
                                    <span className="bg-[#cee9d6] text-[#344c3e] text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-[0.5px] uppercase shrink-0">
                                        PREMIUM
                                    </span>
                                )}
                                {cliente.tag && (
                                    <span className="text-[12px] font-bold shrink-0" style={{ color: cliente.tag.textColor }}>
                                        {cliente.tag.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Columna derecha — detalle */}
                <div className="md:col-span-8 bg-[rgba(248,250,248,0.8)] backdrop-blur-sm border border-[rgba(255,255,255,0.4)] rounded-[16px] p-6 md:p-8 shadow-[0px_12px_40px_rgba(0,96,57,0.05)] flex flex-col gap-8">

                    {/* Detalle del cliente */}
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[#191c1b] text-[24px] md:text-[30px] font-extrabold">
                                {clienteSeleccionado.nombre}
                            </h2>
                            <p className="text-[#4c6455] text-[14px] md:text-[16px] font-medium flex items-center gap-1">
                                📍 Av. Corrientes 1420, CABA
                            </p>
                            <div className="flex items-center gap-2 pt-2 flex-wrap">
                                <span className="bg-[rgba(0,96,57,0.1)] text-[#006039] text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.5px] uppercase">
                                    CLIENTE FRECUENTE
                                </span>
                                <span className="bg-[#ffdada] text-[#7b2c33] text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.5px] uppercase">
                                    DEUDOR: $0
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button className="bg-[#eceeec] p-3 rounded-[12px] text-[16px]">✏️</button>
                            <button className="bg-[#eceeec] p-3 rounded-[12px] text-[16px]">🗑️</button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {[
                            { label: 'TOTAL COMPRAS', valor: '$45.820', sub: '+12% vs mes pasado' },
                            { label: 'FRECUENCIA', valor: 'Semanal', sub: 'Última visita: Ayer' },
                            { label: 'PREFERENCIA', valor: 'Lácteos', sub: 'Marca: La Serenísima' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-[#f2f4f2] rounded-[16px] p-4 md:p-5 flex flex-col gap-1">
                                <p className="text-[#bec9bf] text-[10px] md:text-[12px] font-bold tracking-[1.2px] uppercase">{stat.label}</p>
                                <p className="text-[#006039] text-[16px] md:text-[24px] font-extrabold leading-tight">{stat.valor}</p>
                                <p className="text-[rgba(0,96,57,0.6)] text-[10px] font-medium">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Historial de compras */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[#191c1b] text-[20px] font-bold">Historial de Compras</h3>
                            <button className="text-[#006039] text-[14px] font-bold">Ver todo</button>
                        </div>

                        <div className="bg-white border border-[rgba(190,201,191,0.1)] rounded-[16px] overflow-hidden">
                            {/* Header tabla — desktop: 5 cols, mobile: 3 cols */}
                            <div className="bg-[rgba(236,238,236,0.5)] grid grid-cols-3 md:grid-cols-5 px-4 md:px-6 py-4">
                                <p className="text-[#bec9bf] text-[12px] font-bold tracking-[1.2px] uppercase">ID VENTA</p>
                                <p className="text-[#bec9bf] text-[12px] font-bold tracking-[1.2px] uppercase hidden md:block">FECHA</p>
                                <p className="text-[#bec9bf] text-[12px] font-bold tracking-[1.2px] uppercase hidden md:block">PRODUCTOS</p>
                                <p className="text-[#bec9bf] text-[12px] font-bold tracking-[1.2px] uppercase">MONTO</p>
                                <p className="text-[#bec9bf] text-[12px] font-bold tracking-[1.2px] uppercase text-center">ESTADO</p>
                            </div>

                            {/* Filas */}
                            {comprasData.map((compra, i) => (
                                <div
                                    key={compra.id}
                                    className={`grid grid-cols-3 md:grid-cols-5 px-4 md:px-6 py-4 items-center ${i > 0 ? 'border-t border-[#eceeec]' : ''}`}
                                >
                                    <p className="text-[#006039] text-[14px] md:text-[16px] font-bold">{compra.id}</p>
                                    <p className="text-[#4c6455] text-[14px] hidden md:block">{compra.fecha}</p>
                                    <p className="text-[#4c6455] text-[14px] hidden md:block">{compra.productos}</p>
                                    <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{compra.monto}</p>
                                    <div className="flex justify-center">
                                        <span className="text-[#006039] text-[18px]">✓</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Formulario nuevo cliente */}
                    <div className={`flex flex-col gap-5 border-t border-[rgba(190,201,191,0.2)] pt-6 ${!mostrarFormulario ? 'hidden md:flex' : 'flex'}`}>
                        <h3 className="text-[#191c1b] text-[20px] font-bold">Agregar Nuevo Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Maria Lopez"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">WhatsApp / Teléfono</label>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    placeholder="+54 9..."
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-[#6f7a71] text-[12px] font-bold tracking-[0.3px] uppercase">Dirección (Opcional)</label>
                                <input
                                    type="text"
                                    value={direccion}
                                    onChange={e => setDireccion(e.target.value)}
                                    placeholder="Calle, Altura, Departamento..."
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[14px] text-[#191c1b] placeholder-[#6b7280] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setMostrarFormulario(false)}
                                className="px-6 py-3 rounded-[12px] text-[#4c6455] text-[16px] font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegistrar}
                                className="bg-[#006039] text-white px-8 py-3 rounded-[12px] text-[16px] font-bold shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                            >
                                Registrar Cliente
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}