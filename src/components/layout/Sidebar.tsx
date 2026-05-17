import { NavLink, useNavigate } from 'react-router-dom'
import imgChanguita from '../../assets/logoChanguita.svg'
import { ReactComponent as IconMiNegocio } from '../../assets/icons/mi-negocio.svg'
import { ReactComponent as IconVentas } from '../../assets/icons/ventas.svg'
import { ReactComponent as IconPedidos } from '../../assets/icons/pedidos.svg'
import { ReactComponent as IconGastos } from '../../assets/icons/gastos.svg'
import { ReactComponent as IconClientes } from '../../assets/icons/clientes.svg'
import { ReactComponent as IconStock } from '../../assets/icons/stock.svg'
import { ReactComponent as IconReportes } from '../../assets/icons/reportes.svg'
import { ReactComponent as IconIntegraciones } from '../../assets/icons/integraciones.svg'
import { ReactComponent as IconPlus } from '../../assets/icons/plus.svg'

const navItems = [
    { path: '/', label: 'Mi Negocio', Icon: IconMiNegocio },
    { path: '/ventas', label: 'Ventas', Icon: IconVentas },
    { path: '/pedidos', label: 'Pedidos', Icon: IconPedidos },
    { path: '/gastos', label: 'Gastos', Icon: IconGastos },
    { path: '/clientes', label: 'Clientes', Icon: IconClientes },
    { path: '/productos', label: 'Stock', Icon: IconStock },
    { path: '/reportes', label: 'Reportes', Icon: IconReportes },
    { path: '/integraciones', label: 'Integraciones', Icon: IconIntegraciones },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate()

    return (
        <>
            {/* Overlay mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed left-0 top-0 h-screen w-[288px] bg-[#f8faf8]
        shadow-[0px_12px_16px_rgba(25,28,27,0.06)]
        flex flex-col pb-8 px-6 z-40
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:pt-[90px]
        ${isOpen ? 'translate-x-0 pt-[64px]' : '-translate-x-full pt-[90px]'}
      `}>

                {/* Logo — solo mobile, arriba del drawer */}
                <div className="md:hidden flex items-center h-[64px] absolute top-0 left-0 right-0 px-6 border-b border-[rgba(236,238,236,0.5)] bg-[#f8faf8]">
                    <img src={imgChanguita} alt="Changuita" className="h-[28px]" />
                </div>

                {/* Nav Items */}
                <nav className="flex flex-col gap-1 flex-1 mt-4 md:mt-0">
                    {navItems.map(({ path, label, Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-[8px] text-[16px] transition-colors ${isActive
                                    ? 'bg-[#cbe6d3] text-[#006039] font-bold'
                                    : 'text-[#506859] font-normal hover:bg-[#f0f4f1]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#006039]' : 'text-[#506859]'}`} />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Botón Nueva Venta */}
                <button
                    onClick={() => { navigate('/ventas'); onClose() }}
                    className="w-full py-4 rounded-[8px] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                    style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
                >
                    <IconPlus className="w-4 h-4 text-white" />
                    Nueva Venta
                </button>
            </aside>
        </>
    )
}