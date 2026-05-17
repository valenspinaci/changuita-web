import { NavLink, useNavigate } from 'react-router-dom'
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

export default function Sidebar() {
    const navigate = useNavigate()

    return (
        <aside className="fixed left-0 top-0 h-screen w-[288px] bg-[#f8faf8] shadow-[0px_12px_16px_rgba(25,28,27,0.06)] flex flex-col pt-[90px] pb-8 px-6 z-30">

            {/* Nav Items */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map(({ path, label, Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
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
                onClick={() => navigate('/ventas')}
                className="w-full py-4 rounded-[8px] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
            >
                <IconPlus className="w-4 h-4 text-white" />
                Nueva Venta
            </button>
        </aside>
    )
}