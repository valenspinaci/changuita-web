import { useAuth0 } from '@auth0/auth0-react'
import imgChanguita from '../../assets/logoChanguita.svg'
import { ReactComponent as IconBusqueda } from '../../assets/icons/busqueda.svg'

export default function TopBar() {
    const { user, logout } = useAuth0()

    return (
        <header className="fixed top-0 left-0 right-0 h-[64px] bg-[#f8faf8] flex items-center justify-between px-8 z-40 border-b border-[rgba(236,238,236,0.5)]">

            {/* Logo */}
            <div className="flex items-center gap-2">
                <img src={imgChanguita} alt="Changuita" className="h-[28px]" />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">

                {/* Buscador */}
                <div className="bg-[#f2f4f2] flex items-center gap-3 px-4 py-2 rounded-full w-[300px]">
                    <IconBusqueda className="w-4 h-4 text-[#506859] shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar ventas o productos..."
                        className="bg-transparent text-[14px] text-[#506859] outline-none w-full placeholder-[#506859]"
                    />
                </div>

                {/* Iconos */}
                <div className="flex items-center gap-3">

                    {/* Notificaciones */}
                    <button className="p-2 rounded-full hover:bg-[#f0f4f1] transition-colors relative">
                        <svg className="w-5 h-5 text-[#506859]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>

                    {/* Avatar */}
                    <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
                        className="w-9 h-9 rounded-full bg-[#006039] flex items-center justify-center text-white text-[14px] font-bold hover:bg-[#1a7a4d] transition-colors"
                        title="Cerrar sesión"
                    >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </button>
                </div>
            </div>
        </header>
    )
}