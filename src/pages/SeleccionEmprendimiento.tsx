import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { crearEmprendimiento } from '../services/api'
import imgChanguita from '../assets/logoChanguita.svg'

export default function SeleccionEmprendimiento() {
    const { logout } = useAuth0()
    const { emprendimientos, setEmprendimientoActivo, recargar } = useEmprendimiento()
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombre.trim()) return
        try {
            setLoading(true)
            setError('')
            await crearEmprendimiento({ nombre, descripcion })
            await recargar()
            setMostrarFormulario(false)
            setNombre('')
            setDescripcion('')
        } catch (err: any) {
            setError(err.message || 'Error al crear el emprendimiento')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-4 relative"
            style={{ background: 'linear-gradient(135deg, #f8faf8 0%, #edf7f1 100%)' }}
        >
            {/* Background blobs */}
            <div className="absolute top-[-102px] right-[-64px] w-[512px] h-[512px] rounded-full bg-[rgba(203,230,211,0.2)] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-102px] left-[-64px] w-[384px] h-[384px] rounded-full bg-[rgba(155,245,190,0.1)] blur-[50px] pointer-events-none" />

            <div className="bg-white w-full max-w-[560px] rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-8 md:p-10 relative z-10">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src={imgChanguita} alt="Changuita" className="h-[36px]" />
                </div>

                {!mostrarFormulario ? (
                    <>
                        <div className="flex flex-col gap-2 mb-8">
                            <h1 className="text-[#191c1b] text-[24px] font-extrabold tracking-[-0.6px]">
                                {emprendimientos.length === 0 ? '¡Bienvenido!' : 'Tus emprendimientos'}
                            </h1>
                            <p className="text-[#3f4941] text-[16px] font-medium">
                                {emprendimientos.length === 0
                                    ? 'Creá tu primer emprendimiento para empezar.'
                                    : 'Elegí con cuál querés trabajar hoy.'}
                            </p>
                        </div>

                        {/* Lista de emprendimientos */}
                        {emprendimientos.length > 0 && (
                            <div className="flex flex-col gap-3 mb-6">
                                {emprendimientos.map((emp) => (
                                    <button
                                        key={emp.id}
                                        onClick={() => setEmprendimientoActivo(emp)}
                                        className="w-full flex items-center gap-4 p-4 bg-[#f8faf8] hover:bg-[#f0f7f4] border-2 border-transparent hover:border-[#006039] rounded-[12px] transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 bg-[#cbe6d3] rounded-[10px] flex items-center justify-center text-[#006039] text-[18px] font-extrabold shrink-0">
                                            {emp.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#191c1b] text-[16px] font-bold truncate">{emp.nombre}</p>
                                            {emp.descripcion && (
                                                <p className="text-[#6f7a71] text-[13px] truncate">{emp.descripcion}</p>
                                            )}
                                        </div>
                                        <span className="text-[#006039] text-[20px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Botón crear nuevo */}
                        <button
                            onClick={() => setMostrarFormulario(true)}
                            className="w-full py-4 rounded-[8px] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                            style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
                        >
                            + {emprendimientos.length === 0 ? 'Crear mi emprendimiento' : 'Agregar otro emprendimiento'}
                        </button>

                        {/* Cerrar sesión */}
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: `${process.env.REACT_APP_URL}` } })}
                            className="w-full mt-4 text-center text-[#6f7a71] text-[14px] font-medium"
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-2 mb-8">
                            <h1 className="text-[#191c1b] text-[24px] font-extrabold tracking-[-0.6px]">
                                Nuevo emprendimiento
                            </h1>
                            <p className="text-[#3f4941] text-[16px] font-medium">
                                Completá los datos de tu negocio.
                            </p>
                        </div>

                        <form onSubmit={handleCrear} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                    Nombre del negocio
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Almacén San Juan"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                    Descripción <span className="text-[#6f7a71] normal-case font-normal">(opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    placeholder="Ej: Venta de productos de almacén"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>

                            {error && (
                                <p className="text-[#ba1a1a] text-[14px]">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="flex-1 py-4 rounded-[8px] bg-[#f2f4f2] text-[#3f4941] text-[16px] font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !nombre.trim()}
                                    className="flex-1 py-4 rounded-[8px] text-white text-[16px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
                                >
                                    {loading ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}