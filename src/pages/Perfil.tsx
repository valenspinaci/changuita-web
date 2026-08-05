import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEmprendimiento } from '../context/EmprendimientoContext'

export default function Perfil() {
    const { user, logout } = useAuth()
    const { emprendimientos, emprendimientoActivo, setEmprendimientoActivo } = useEmprendimiento()
    const navigate = useNavigate()
    const [confirmandoLogout, setConfirmandoLogout] = useState(false)

    const inicial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="flex flex-col gap-6 max-w-[640px]">
            <div>
                <h1 className="text-[#191c1b] text-[24px] md:text-[28px] font-extrabold tracking-[-0.6px]">
                    Mi Perfil
                </h1>
                <p className="text-[#3f4941] text-[15px] font-medium mt-1">
                    Gestioná tu cuenta y tu sesión.
                </p>
            </div>

            {/* Datos del usuario */}
            <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#006039] flex items-center justify-center text-white text-[24px] font-bold shrink-0">
                    {inicial}
                </div>
                <div className="min-w-0">
                    <p className="text-[#191c1b] text-[18px] font-bold truncate">
                        {user?.name || 'Emprendedor'}
                    </p>
                    <p className="text-[#6f7a71] text-[14px] truncate">
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Emprendimientos */}
            {emprendimientos.length > 0 && (
                <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6">
                    <h2 className="text-[#191c1b] text-[16px] font-bold mb-4">
                        Tus emprendimientos
                    </h2>
                    <div className="flex flex-col gap-2">
                        {emprendimientos.map(emp => {
                            const activo = emp.id === emprendimientoActivo?.id
                            return (
                                <button
                                    key={emp.id}
                                    onClick={() => setEmprendimientoActivo(emp)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-[10px] text-left transition-colors ${activo
                                        ? 'bg-[#cbe6d3]'
                                        : 'bg-[#f8faf8] hover:bg-[#f0f4f1]'
                                        }`}
                                >
                                    <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center text-[#006039] text-[14px] font-extrabold shrink-0">
                                        {emp.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[#191c1b] text-[14px] font-bold truncate flex-1">
                                        {emp.nombre}
                                    </span>
                                    {activo && (
                                        <span className="text-[#006039] text-[12px] font-bold uppercase tracking-[0.5px] shrink-0">
                                            Activo
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Sesión */}
            <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6">
                <h2 className="text-[#191c1b] text-[16px] font-bold mb-4">
                    Sesión
                </h2>
                {!confirmandoLogout ? (
                    <button
                        onClick={() => setConfirmandoLogout(true)}
                        className="flex items-center gap-2 text-[#ba1a1a] text-[14px] font-bold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                    </button>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-[#3f4941] text-[14px]">
                            ¿Seguro que querés cerrar sesión?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmandoLogout(false)}
                                className="px-4 py-2 rounded-[8px] bg-[#f2f4f2] text-[#3f4941] text-[14px] font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-[8px] bg-[#ba1a1a] text-white text-[14px] font-bold"
                            >
                                Sí, cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
