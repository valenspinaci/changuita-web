import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import imgChanguita from '../assets/logoChanguita.svg'

interface Paso {
    emoji: string
    titulo: string
    texto: string
}

const PASOS: Paso[] = [
    {
        emoji: '👋',
        titulo: '¡Bienvenido a Changuita!',
        texto: 'Te mostramos rápido cómo sacarle el jugo a la plataforma. Son unos segundos.',
    },
    {
        emoji: '🛒',
        titulo: 'Ventas',
        texto: 'Registrá tus ventas del stock o como concepto libre. El stock se descuenta solo.',
    },
    {
        emoji: '📦',
        titulo: 'Stock',
        texto: 'Cargá tus productos y controlá el stock — te avisamos cuando está por acabarse.',
    },
    {
        emoji: '💸',
        titulo: 'Gastos y Clientes',
        texto: 'Anotá tus gastos por categoría y llevá un historial de tus clientes.',
    },
    {
        emoji: '📊',
        titulo: 'Reportes y Pedidos',
        texto: 'Mirá cómo va tu negocio en Reportes, y seguí tus pedidos en el tablero.',
    },
]

export default function OnboardingFlow() {
    const { completarOnboarding } = useAuth()
    const [paso, setPaso] = useState(0)
    const [saliendo, setSaliendo] = useState(false)

    const esUltimo = paso === PASOS.length - 1
    const actual = PASOS[paso]

    const finalizar = async () => {
        if (saliendo) return
        setSaliendo(true)
        await completarOnboarding()
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f8faf8 0%, #edf7f1 100%)' }}
        >
            <div className="absolute top-[-140px] right-[-100px] w-[620px] h-[620px] rounded-full bg-[rgba(203,230,211,0.3)] blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-140px] left-[-100px] w-[520px] h-[520px] rounded-full bg-[rgba(155,245,190,0.15)] blur-[70px] pointer-events-none" />

            {/* Logo */}
            <div className="flex justify-center pt-10 md:pt-14 relative z-10">
                <img src={imgChanguita} alt="Changuita" className="h-[32px] md:h-[36px]" />
            </div>

            {/* Contenido central */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
                <span className="text-[96px] md:text-[128px] leading-none mb-6">{actual.emoji}</span>

                <h1
                    className="text-[#191c1b] font-extrabold tracking-[-1px] leading-tight mb-4"
                    style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}
                >
                    {actual.titulo}
                </h1>
                <p className="text-[#3f4941] text-[16px] md:text-[19px] font-medium leading-[26px] max-w-[520px]">
                    {actual.texto}
                </p>

                <div className="flex gap-2 mt-10">
                    {PASOS.map((_, i) => (
                        <span
                            key={i}
                            className={`h-2 rounded-full transition-all ${i === paso ? 'w-8 bg-[#006039]' : 'w-2 bg-[#cbe6d3]'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navegación inferior */}
            <div className="relative z-10 flex items-center justify-between w-full px-6 md:px-12 py-8 md:py-10">
                <button
                    onClick={finalizar}
                    disabled={saliendo}
                    className="text-[#6f7a71] text-[15px] font-bold disabled:opacity-50"
                >
                    Omitir
                </button>

                <div className="flex gap-3">
                    {paso > 0 && (
                        <button
                            onClick={() => setPaso(p => p - 1)}
                            disabled={saliendo}
                            className="px-6 py-3 rounded-[8px] bg-[#f2f4f2] text-[#3f4941] text-[15px] font-bold disabled:opacity-50"
                        >
                            Atrás
                        </button>
                    )}
                    <button
                        onClick={() => (esUltimo ? finalizar() : setPaso(p => p + 1))}
                        disabled={saliendo}
                        className="px-8 py-3 rounded-[8px] text-white text-[15px] font-bold disabled:opacity-50 shadow-[0px_10px_15px_-3px_rgba(0,96,57,0.2)]"
                        style={{ background: 'linear-gradient(136.97deg, #006039 0%, #1a7a4d 100%)' }}
                    >
                        {esUltimo ? 'Empezar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    )
}
