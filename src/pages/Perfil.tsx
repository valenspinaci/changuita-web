import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEmprendimiento } from '../context/EmprendimientoContext'
import { crearEmprendimiento, actualizarEmprendimiento } from '../services/api'
import { useToast } from '../context/ToastContext'

const NOMBRES_MODULO: Record<string, string> = {
    ventas: 'Ventas',
    pedidos: 'Pedidos',
    gastos: 'Gastos',
    clientes: 'Clientes',
    stock: 'Stock',
    reportes: 'Reportes',
    integraciones: 'Integraciones',
}

export default function Perfil() {
    const { user, logout, actualizarNombre } = useAuth()
    const { emprendimientos, emprendimientoActivo, setEmprendimientoActivo, recargar, modulos, cambiarModulo } = useEmprendimiento()
    const { showToast } = useToast()
    const [moduloCambiando, setModuloCambiando] = useState<number | null>(null)
    const navigate = useNavigate()
    const [confirmandoLogout, setConfirmandoLogout] = useState(false)

    // Edición de nombre de usuario
    const [editandoPerfil, setEditandoPerfil] = useState(false)
    const [nombrePerfil, setNombrePerfil] = useState('')
    const [guardandoPerfil, setGuardandoPerfil] = useState(false)
    const [errorPerfil, setErrorPerfil] = useState('')

    // Edición de un emprendimiento existente
    const [empEditandoId, setEmpEditandoId] = useState<number | null>(null)
    const [nombreEmp, setNombreEmp] = useState('')
    const [descripcionEmp, setDescripcionEmp] = useState('')
    const [guardandoEmp, setGuardandoEmp] = useState(false)
    const [errorEmp, setErrorEmp] = useState('')

    // Alta de nuevo emprendimiento
    const [creandoNuevo, setCreandoNuevo] = useState(false)
    const [nombreNuevo, setNombreNuevo] = useState('')
    const [descripcionNuevo, setDescripcionNuevo] = useState('')
    const [guardandoNuevo, setGuardandoNuevo] = useState(false)
    const [errorNuevo, setErrorNuevo] = useState('')

    const inicial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const abrirEdicionPerfil = () => {
        setNombrePerfil(user?.name || '')
        setErrorPerfil('')
        setEditandoPerfil(true)
    }

    const guardarPerfil = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombrePerfil.trim()) return
        try {
            setGuardandoPerfil(true)
            setErrorPerfil('')
            await actualizarNombre(nombrePerfil.trim())
            setEditandoPerfil(false)
            showToast('Perfil actualizado', 'success')
        } catch (err: any) {
            setErrorPerfil(err.message || 'No se pudo actualizar el perfil')
        } finally {
            setGuardandoPerfil(false)
        }
    }

    const abrirEdicionEmp = (emp: { id: number; nombre: string; descripcion?: string }) => {
        setEmpEditandoId(emp.id)
        setNombreEmp(emp.nombre)
        setDescripcionEmp(emp.descripcion || '')
        setErrorEmp('')
        setCreandoNuevo(false)
    }

    const guardarEmp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (empEditandoId === null || !nombreEmp.trim()) return
        try {
            setGuardandoEmp(true)
            setErrorEmp('')
            const actualizado = await actualizarEmprendimiento(empEditandoId, {
                nombre: nombreEmp.trim(),
                descripcion: descripcionEmp.trim() || undefined,
            })
            if (emprendimientoActivo?.id === empEditandoId) {
                setEmprendimientoActivo(actualizado)
            }
            await recargar()
            setEmpEditandoId(null)
            showToast('Emprendimiento actualizado', 'success')
        } catch (err: any) {
            setErrorEmp(err.message || 'No se pudo actualizar el emprendimiento')
        } finally {
            setGuardandoEmp(false)
        }
    }

    const handleToggleModulo = async (moduloId: number, habilitado: boolean) => {
        try {
            setModuloCambiando(moduloId)
            await cambiarModulo(moduloId, habilitado)
        } catch (err: any) {
            showToast(err.message || 'No se pudo actualizar el módulo', 'error')
        } finally {
            setModuloCambiando(null)
        }
    }

    const abrirNuevoEmp = () => {
        setNombreNuevo('')
        setDescripcionNuevo('')
        setErrorNuevo('')
        setEmpEditandoId(null)
        setCreandoNuevo(true)
    }

    const guardarNuevoEmp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nombreNuevo.trim()) return
        try {
            setGuardandoNuevo(true)
            setErrorNuevo('')
            await crearEmprendimiento({ nombre: nombreNuevo.trim(), descripcion: descripcionNuevo.trim() || undefined })
            await recargar()
            setCreandoNuevo(false)
            showToast('Emprendimiento creado', 'success')
        } catch (err: any) {
            setErrorNuevo(err.message || 'No se pudo crear el emprendimiento')
        } finally {
            setGuardandoNuevo(false)
        }
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
            <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6">
                {!editandoPerfil ? (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#006039] flex items-center justify-center text-white text-[24px] font-bold shrink-0">
                            {inicial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[#191c1b] text-[18px] font-bold truncate">
                                {user?.name || 'Emprendedor'}
                            </p>
                            <p className="text-[#6f7a71] text-[14px] truncate">
                                {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={abrirEdicionPerfil}
                            className="p-2 rounded-[8px] hover:bg-[#f0f4f1] transition-colors text-[#506859] shrink-0"
                            title="Editar perfil"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={guardarPerfil} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={nombrePerfil}
                                onChange={e => setNombrePerfil(e.target.value)}
                                className="bg-[#eceeec] rounded-[8px] px-4 py-3 text-[16px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                autoFocus
                            />
                        </div>
                        <p className="text-[#6f7a71] text-[13px]">{user?.email}</p>
                        {errorPerfil && <p className="text-[#ba1a1a] text-[13px]">{errorPerfil}</p>}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setEditandoPerfil(false)}
                                className="px-4 py-2 rounded-[8px] bg-[#f2f4f2] text-[#3f4941] text-[14px] font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardandoPerfil || !nombrePerfil.trim()}
                                className="px-4 py-2 rounded-[8px] text-white text-[14px] font-bold disabled:opacity-50"
                                style={{ background: '#006039' }}
                            >
                                {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Emprendimientos */}
            <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6">
                <h2 className="text-[#191c1b] text-[16px] font-bold mb-4">
                    Tus emprendimientos
                </h2>
                <div className="flex flex-col gap-2">
                    {emprendimientos.map(emp => {
                        const activo = emp.id === emprendimientoActivo?.id
                        const editando = empEditandoId === emp.id

                        if (editando) {
                            return (
                                <form
                                    key={emp.id}
                                    onSubmit={guardarEmp}
                                    className="flex flex-col gap-3 p-3 rounded-[10px] bg-[#f8faf8] border border-[#cbe6d3]"
                                >
                                    <input
                                        type="text"
                                        value={nombreEmp}
                                        onChange={e => setNombreEmp(e.target.value)}
                                        placeholder="Nombre del negocio"
                                        className="bg-white rounded-[8px] px-3 py-2 text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={descripcionEmp}
                                        onChange={e => setDescripcionEmp(e.target.value)}
                                        placeholder="Descripción (opcional)"
                                        className="bg-white rounded-[8px] px-3 py-2 text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                    />
                                    {errorEmp && <p className="text-[#ba1a1a] text-[13px]">{errorEmp}</p>}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEmpEditandoId(null)}
                                            className="px-3 py-2 rounded-[8px] bg-[#eceeec] text-[#3f4941] text-[13px] font-bold"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={guardandoEmp || !nombreEmp.trim()}
                                            className="px-3 py-2 rounded-[8px] text-white text-[13px] font-bold disabled:opacity-50"
                                            style={{ background: '#006039' }}
                                        >
                                            {guardandoEmp ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </form>
                            )
                        }

                        return (
                            <div
                                key={emp.id}
                                className={`w-full flex items-center gap-3 p-3 rounded-[10px] transition-colors ${activo ? 'bg-[#cbe6d3]' : 'bg-[#f8faf8] hover:bg-[#f0f4f1]'
                                    }`}
                            >
                                <button
                                    onClick={() => setEmprendimientoActivo(emp)}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                >
                                    <div className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center text-[#006039] text-[14px] font-extrabold shrink-0">
                                        {emp.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[#191c1b] text-[14px] font-bold truncate">
                                        {emp.nombre}
                                    </span>
                                    {activo && (
                                        <span className="text-[#006039] text-[12px] font-bold uppercase tracking-[0.5px] shrink-0">
                                            Activo
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => abrirEdicionEmp(emp)}
                                    className="p-1.5 rounded-[6px] hover:bg-white/60 transition-colors text-[#506859] shrink-0"
                                    title="Editar emprendimiento"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                </div>

                {creandoNuevo ? (
                    <form onSubmit={guardarNuevoEmp} className="flex flex-col gap-3 mt-3 p-3 rounded-[10px] bg-[#f8faf8] border border-[#cbe6d3]">
                        <input
                            type="text"
                            value={nombreNuevo}
                            onChange={e => setNombreNuevo(e.target.value)}
                            placeholder="Ej: Almacén San Juan"
                            className="bg-white rounded-[8px] px-3 py-2 text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={descripcionNuevo}
                            onChange={e => setDescripcionNuevo(e.target.value)}
                            placeholder="Descripción (opcional)"
                            className="bg-white rounded-[8px] px-3 py-2 text-[14px] text-[#191c1b] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                        />
                        {errorNuevo && <p className="text-[#ba1a1a] text-[13px]">{errorNuevo}</p>}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setCreandoNuevo(false)}
                                className="px-3 py-2 rounded-[8px] bg-[#eceeec] text-[#3f4941] text-[13px] font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardandoNuevo || !nombreNuevo.trim()}
                                className="px-3 py-2 rounded-[8px] text-white text-[13px] font-bold disabled:opacity-50"
                                style={{ background: '#006039' }}
                            >
                                {guardandoNuevo ? 'Creando...' : 'Crear emprendimiento'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={abrirNuevoEmp}
                        className="w-full mt-3 py-3 rounded-[10px] border-2 border-dashed border-[#cbe6d3] text-[#006039] text-[14px] font-bold hover:bg-[#f8faf8] transition-colors"
                    >
                        + Agregar otro emprendimiento
                    </button>
                )}
            </div>

            {/* Módulos */}
            {emprendimientoActivo && modulos.length > 0 && (
                <div className="bg-white rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] p-6">
                    <h2 className="text-[#191c1b] text-[16px] font-bold mb-1">
                        Módulos
                    </h2>
                    <p className="text-[#6f7a71] text-[13px] mb-4">
                        Elegí qué secciones ves en el menú de <strong>{emprendimientoActivo.nombre}</strong>.
                    </p>
                    <div className="flex flex-col gap-1">
                        {modulos.map(modulo => (
                            <div
                                key={modulo.id}
                                className="w-full flex items-center gap-3 py-2.5"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#191c1b] text-[14px] font-bold">
                                        {NOMBRES_MODULO[modulo.nombre] || modulo.nombre}
                                    </p>
                                    {modulo.descripcion && (
                                        <p className="text-[#6f7a71] text-[12px] truncate">
                                            {modulo.descripcion}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={modulo.habilitado}
                                    disabled={moduloCambiando === modulo.id}
                                    onClick={() => handleToggleModulo(modulo.id, !modulo.habilitado)}
                                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${modulo.habilitado ? 'bg-[#006039]' : 'bg-[#d9dcda]'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${modulo.habilitado ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
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
