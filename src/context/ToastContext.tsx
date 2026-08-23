import { createContext, useContext, useCallback, useState, ReactNode } from 'react'

type TipoToast = 'success' | 'error' | 'info'

interface Toast {
    id: number
    mensaje: string
    tipo: TipoToast
}

interface ToastContextValue {
    showToast: (mensaje: string, tipo?: TipoToast) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ESTILOS: Record<TipoToast, { bg: string; icono: string }> = {
    success: { bg: '#006039', icono: '✓' },
    error: { bg: '#ba1a1a', icono: '✕' },
    info: { bg: '#191c1b', icono: 'ℹ' },
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((mensaje: string, tipo: TipoToast = 'info') => {
        const id = nextId++
        setToasts(prev => [...prev, { id, mensaje, tipo }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const cerrar = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-[420px]">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        onClick={() => cerrar(t.id)}
                        className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3.5 rounded-[10px] shadow-[0px_12px_32px_0px_rgba(25,28,27,0.25)] text-white text-[14px] font-medium cursor-pointer animate-toast-in"
                        style={{ background: ESTILOS[t.tipo].bg }}
                    >
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[12px] font-bold shrink-0">
                            {ESTILOS[t.tipo].icono}
                        </span>
                        <span className="flex-1">{t.mensaje}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
    return ctx
}
