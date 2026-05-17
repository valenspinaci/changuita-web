import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

import imgChanguita from '../assets/logoChanguita.svg';
import imgAlmacen from '../assets/imgLogin.png';
import imgGoogle from '../assets/logoGoogle.svg';

export default function Login() {
    const { loginWithRedirect } = useAuth0()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        loginWithRedirect({ authorizationParams: { login_hint: email } })
    }

    const handleGoogle = () => {
        loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })
    }

    return (
        <div
            className="h-screen overflow-hidden flex items-center justify-center p-4 md:p-8 relative"
            style={{ background: 'linear-gradient(135deg, #f8faf8 0%, #edf7f1 100%)' }}
        >
            {/* Background blobs */}
            <div className="absolute top-[-102px] right-[-64px] w-[512px] h-[512px] rounded-full bg-[rgba(203,230,211,0.2)] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-102px] left-[-64px] w-[384px] h-[384px] rounded-full bg-[rgba(155,245,190,0.1)] blur-[50px] pointer-events-none" />

            {/* Card */}
            <div className="bg-white w-full max-w-[1152px] h-full max-h-[716px] rounded-[12px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.06)] overflow-hidden flex flex-col md:grid md:grid-cols-12 relative z-10">

                {/* Left - Illustration (solo desktop) */}
                <div className="hidden md:flex md:col-span-7 bg-[#cbe6d3] relative flex-col p-8 overflow-hidden gap-6">

                    {/* Logo */}
                    <div className="relative z-10">
                        <img src={imgChanguita} alt="Changuita" className="h-[36px]" />
                    </div>

                    {/* Imagen con border radius ocupa el resto */}
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

                {/* Right - Form */}
                <div className="col-span-5 flex flex-col justify-center px-6 py-10 md:px-16 md:py-12 bg-white overflow-y-auto">

                    {/* Logo mobile */}
                    <div className="flex md:hidden items-center mb-8 justify-center">
                        <img src={imgChanguita} alt="Changuita" className="h-[36px]" />
                    </div>

                    <div className="flex flex-col gap-8 w-full max-w-[352px] mx-auto">

                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#191c1b] text-[28px] md:text-[30px] font-extrabold tracking-[-0.75px] leading-tight">
                                Bienvenido de vuelta
                            </h1>
                            <p className="text-[#3f4941] text-[15px] md:text-[16px] font-medium leading-[24px]">
                                Ingresá tus datos para gestionar tu emprendimiento
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-5">

                            {/* Email */}
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

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[#3f4941] text-[12px] font-bold tracking-[0.6px] uppercase">
                                        Contraseña
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'reset-password' } })}
                                        className="text-[#006039] text-[12px] font-bold"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-[#eceeec] rounded-[8px] px-4 py-4 text-[16px] font-medium text-[#191c1b] placeholder-[rgba(111,122,113,0.5)] outline-none focus:ring-2 focus:ring-[#006039] w-full"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-[8px] text-white text-[16px] font-bold flex items-center justify-center gap-2 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                                    style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
                                >
                                    Ingresar al sistema →
                                </button>

                                {/* Divider */}
                                <div className="relative flex items-center justify-center py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[rgba(190,201,191,0.3)]" />
                                    </div>
                                    <span className="relative bg-white px-4 text-[12px] font-bold tracking-[1.2px] uppercase text-[rgba(63,73,65,0.6)]">
                                        O TAMBIÉN
                                    </span>
                                </div>

                                {/* Google */}
                                <button
                                    type="button"
                                    onClick={handleGoogle}
                                    className="w-full py-4 rounded-[8px] bg-[#cbe6d3] text-[#506859] text-[16px] font-bold flex items-center justify-center gap-2"
                                >
                                    <img src={imgGoogle} alt="Google" className="w-5 h-5" />
                                    Continuar con Google
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-[#3f4941] text-[14px] font-medium">
                            ¿No tenés una cuenta?{' '}
                            <a href="/registro" className="text-[#006039] font-bold underline">
                                Creá una hoy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}