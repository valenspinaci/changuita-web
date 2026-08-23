import { useState, useRef, useEffect } from 'react'

interface HelpTooltipProps {
    texto: string
}

export default function HelpTooltip({ texto }: HelpTooltipProps) {
    const [abierto, setAbierto] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!abierto) return
        const cerrarSiClickAfuera = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setAbierto(false)
            }
        }
        document.addEventListener('mousedown', cerrarSiClickAfuera)
        return () => document.removeEventListener('mousedown', cerrarSiClickAfuera)
    }, [abierto])

    return (
        <div ref={ref} className="relative inline-flex">
            <button
                type="button"
                onClick={() => setAbierto(prev => !prev)}
                aria-label="Ayuda de esta sección"
                className={`w-7 h-7 rounded-full text-[14px] font-extrabold flex items-center justify-center shrink-0 border-2 transition-all shadow-[0px_2px_6px_rgba(0,96,57,0.15)] ${abierto
                    ? 'bg-[#006039] text-white border-[#006039]'
                    : 'bg-[#cbe6d3] text-[#006039] border-[#9bd6ac] hover:bg-[#b8dcc3] hover:scale-105'
                    }`}
            >
                ?
            </button>
            {abierto && (
                <div className="absolute top-9 left-0 z-20 w-[260px] bg-[#191c1b] text-white text-[13px] leading-[19px] rounded-[10px] px-4 py-3 shadow-lg">
                    {texto}
                    <div className="absolute -top-1.5 left-2 w-3 h-3 bg-[#191c1b] rotate-45" />
                </div>
            )}
        </div>
    )
}
