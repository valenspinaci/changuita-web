import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import imgChanguita from '../assets/logoChanguita.svg'
import imgAlmacen from '../assets/imgLogin.png'

export default function Registro() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register(email, password, nombre)
            navigate('/')
        } catch (err: any) {
            setError(err.message || 'No se pudo crear la cuenta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-4 md:p-8 relative"
            style={{ background: 'linear-gradient(135deg, #f8faf8 0%, #edf7f1 100%)' }}
        >
            <div className="absolute top-[-102px] right-[-64px] w-[512px] h-[512px] rounded-full bg-[rgba(203,230,211,0.2)] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-102px] left-[-64px] w-[384px] h-[384px] rounded-full bg-[rgba(155,245,190,0.1)] blur-[50px] pointer-events-none" />

            <div className="bg-white w-full max-w-[1152px] h-full max-h-[716px] rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] overflow-hidden flex flex-col md:grid md:grid-cols-12 relative z-10">

                {/* Left - Form */}
                <div className="col-span-5 flex flex-col justify-center px-6 py-10 md:px-16 md:py-12 bg-white overflow-y-auto">
                    <div className="flex md:hidden items-center mb-8 justify-center">
                        <img src={imgChanguita} alt="Changuita" className="h-[36px]" />
                    </div>

                    <div className="flex flex-col gap-8 w-full max-w-[352px] mx-auto">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold tracking-[-0.75px] leading-tight">
                                ¡Bienvenido!
                            </h1>
                            <p className="text-[#3f4941] text-[15px] md:text-[16px] font-medium leading-[24px]">
                                Ingresá tus datos para empezar a controlar tu changa
                            </p>
                        </div>

                        <form onSubmit={handleRegistro} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] font-medium text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ejemplo@almacen.com"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] font-medium text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] font-medium text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-[13px] font-medium">{error}</p>
                            )}

                            <div className="flex flex-col gap-4 pt-2">
                                <button
    type="submit"
    disabled={loading}
    className="w-full py-4 rounded-[8px] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)] disabled:opacity-60"
    style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
>
    {loading ? (
        <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creando cuenta...
        </>
    ) : (
        'Registrarme →'
    )}
</button>
                            </div>
                        </form>

                        <p className="text-center text-[#3f4941] text-[14px] font-medium">
                            ¿Ya tenés una cuenta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-[#006039] font-bold underline"
                            >
                                Ingresá acá
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right - Illustration */}
                <div className="hidden md:flex md:col-span-7 bg-[#cbe6d3] relative flex-col p-8 overflow-hidden gap-6">
                    <div className="relative z-10">
                        <img src={imgChanguita} alt="Changuita" className="h-[36px]" />
                    </div>
                    <div className="relative flex-1 rounded-[12px] overflow-hidden">
                        <img src={imgAlmacen} alt="Almacén" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 z-10">
                            <p className="text-white font-bold text-[19px] leading-[25px]">
                                Digitalizando la confianza del que deja todo por lo suyo.
                            </p>
                            <p className="text-[rgba(255,255,255,0.8)] text-[14px] leading-[20px] mt-1">
                                Tu changa, ahora más inteligente que nunca.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}