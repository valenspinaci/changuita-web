import { useState } from 'react'

type Categoria = 'Todos' | 'Almacén' | 'Bebidas' | 'Limpieza' | 'Lácteos'
type EstadoStock = 'AGOTADO' | 'BAJO STOCK' | 'ÓPTIMO'

interface Producto {
    id: number
    nombre: string
    sku: string
    categoria: string
    precio: string
    stock: number
    estadoStock: EstadoStock
    emoji: string
}

const productosData: Producto[] = [
    { id: 1, nombre: 'Yogurt Natural 1kg', sku: 'CH-9021', categoria: 'Lácteos', precio: '$1.450', stock: 0, estadoStock: 'AGOTADO', emoji: '🥛' },
    { id: 2, nombre: 'Aceite Girasol 1.5L', sku: 'CH-4432', categoria: 'Almacén', precio: '$2.100', stock: 5, estadoStock: 'BAJO STOCK', emoji: '🫙' },
    { id: 3, nombre: 'Jabón Líquido Matic 3L', sku: 'CH-1122', categoria: 'Limpieza', precio: '$4.800', stock: 42, estadoStock: 'ÓPTIMO', emoji: '🧴' },
]

const categorias: Categoria[] = ['Todos', 'Almacén', 'Bebidas', 'Limpieza', 'Lácteos']

const stockConfig = {
    'AGOTADO': { color: '#ba1a1a', bg: 'rgba(255,218,214,0.3)', textColor: '#ba1a1a' },
    'BAJO STOCK': { color: '#8a383e', bg: 'rgba(255,218,218,0.4)', textColor: '#8a383e' },
    'ÓPTIMO': { color: '#006039', bg: '#cbe6d3', textColor: '#006039' },
}

export default function Productos() {
    const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos')

    const productosFiltrados = categoriaActiva === 'Todos'
        ? productosData
        : productosData.filter(p => p.categoria === categoriaActiva)

    return (
        <div className="flex flex-col gap-8">

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">

                {/* Total inventario */}
                <div className="md:col-span-2 bg-[#006039] rounded-[16px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute bg-[rgba(255,255,255,0.1)] blur-[32px] bottom-[-40px] right-[-40px] rounded-full w-48 h-48" />
                    <div>
                        <p className="text-[rgba(255,255,255,0.7)] text-[12px] font-medium tracking-[1.2px] uppercase mb-2">
                            Total de Inventario
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-[48px] font-extrabold leading-none">1.248</span>
                            <span className="text-[rgba(255,255,255,0.6)] text-[20px]">uds.</span>
                        </div>
                    </div>
                    <div>
                        <span className="bg-[rgba(255,255,255,0.2)] text-white text-[12px] px-3 py-1 rounded-full">
                            +12% vs mes anterior
                        </span>
                    </div>
                </div>

                {/* Stock bajo */}
                <div className="bg-white rounded-[16px] px-6 py-4 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[28px]">⚠️</span>
                        <span className="text-[#8a383e] text-[12px] font-bold tracking-[0.5px] uppercase">Accion Requerida</span>
                    </div>
                    <p className="text-[#191c1b] text-[30px] font-extrabold leading-tight">14</p>
                    <p className="text-[#6f7a71] text-[14px]">Productos con Stock Bajo</p>
                </div>

                {/* Sin existencias */}
                <div className="bg-white rounded-[16px] px-6 py-4 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[28px]">🚫</span>
                        <span className="text-[#ba1a1a] text-[12px] font-bold tracking-[0.5px] uppercase">Crítico</span>
                    </div>
                    <p className="text-[#191c1b] text-[30px] font-extrabold leading-tight">3</p>
                    <p className="text-[#6f7a71] text-[14px]">Sin Existencias</p>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="flex flex-col gap-5">

                {/* Header + Filtros */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-[#191c1b] text-[24px] font-bold tracking-[-0.6px]">Gestión de Productos</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        {categorias.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategoriaActiva(c)}
                                className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-colors ${categoriaActiva === c
                                        ? 'bg-[#006039] text-white'
                                        : 'bg-[#cbe6d3] text-[#506859]'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-[#f2f4f2] rounded-[16px] overflow-hidden">

                    {/* Header — desktop: 5 cols, mobile: 3 cols */}
                    <div className="bg-[#e6e9e7] grid grid-cols-3 md:grid-cols-12 px-4 md:px-8 py-4">
                        <div className="md:col-span-5">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Producto</span>
                        </div>
                        <div className="hidden md:flex md:col-span-2 justify-center">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Categoría</span>
                        </div>
                        <div className="hidden md:flex md:col-span-2 justify-center">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Precio</span>
                        </div>
                        <div className="flex justify-center md:col-span-2">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Stock</span>
                        </div>
                        <div className="flex justify-end md:col-span-1">
                            <span className="text-[#6f7a71] text-[12px] font-bold tracking-[1.2px] uppercase">Acción</span>
                        </div>
                    </div>

                    {/* Filas */}
                    {productosFiltrados.map((producto, i) => {
                        const config = stockConfig[producto.estadoStock]
                        return (
                            <div
                                key={producto.id}
                                className={`grid grid-cols-3 md:grid-cols-12 px-4 md:px-8 py-5 md:py-6 items-center ${i > 0 ? 'border-t border-[rgba(0,0,0,0.04)]' : ''}`}
                            >
                                {/* Producto */}
                                <div className="md:col-span-5 flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#e1e3e1] rounded-[12px] flex items-center justify-center text-[20px] shrink-0">
                                        {producto.emoji}
                                    </div>
                                    <div>
                                        <p className="text-[#191c1b] text-[14px] md:text-[16px] font-bold">{producto.nombre}</p>
                                        <p className="text-[#6f7a71] text-[12px]">SKU: {producto.sku}</p>
                                    </div>
                                </div>

                                {/* Categoría — solo desktop */}
                                <div className="hidden md:flex md:col-span-2 justify-center">
                                    <span className="bg-[#cee9d6] text-[#344c3e] text-[10px] font-bold px-3 py-1 rounded-full tracking-[0.5px] uppercase">
                                        {producto.categoria}
                                    </span>
                                </div>

                                {/* Precio — solo desktop */}
                                <div className="hidden md:flex md:col-span-2 justify-center">
                                    <span className="text-[#006039] text-[16px] font-bold">{producto.precio}</span>
                                </div>

                                {/* Stock */}
                                <div className="md:col-span-2 flex flex-col items-center gap-1">
                                    <span className="font-extrabold text-[16px] md:text-[18px]" style={{ color: config.color }}>
                                        {producto.stock}
                                    </span>
                                    <span
                                        className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] uppercase"
                                        style={{ backgroundColor: config.bg, color: config.textColor }}
                                    >
                                        {producto.estadoStock}
                                    </span>
                                </div>

                                {/* Acción */}
                                <div className="md:col-span-1 flex justify-end">
                                    <button className="p-2 rounded-full hover:bg-[#e6e9e7] transition-colors text-[#6f7a71] text-[16px]">
                                        ✏️
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* FAB — Agregar producto */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    className="w-16 h-16 bg-[#006039] rounded-full flex items-center justify-center text-white text-[24px] shadow-[0px_12px_16px_rgba(0,96,57,0.3)] hover:bg-[#1a7a4d] transition-colors"
                    title="Agregar Producto"
                >
                    +
                </button>
            </div>
        </div>
    )
}