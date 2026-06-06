interface ProximamenteProps {
    titulo: string
    descripcion?: string
    emoji?: string
}

export default function ProximamentePage({ titulo, descripcion, emoji = '🚧' }: ProximamenteProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
            <span className="text-[64px]">{emoji}</span>
            <div className="flex flex-col gap-3">
                <h1
                    className="text-[#191c1b] font-extrabold tracking-[-1.2px] leading-tight"
                    style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
                >
                    {titulo}
                </h1>
                <p className="text-[#3f4941] text-[18px] font-medium max-w-[480px]">
                    {descripcion || 'Estamos trabajando en esta funcionalidad. Pronto va a estar disponible.'}
                </p>
            </div>
            <div className="bg-[#cbe6d3] px-6 py-3 rounded-full">
                <span className="text-[#006039] text-[14px] font-bold tracking-[0.5px] uppercase">
                    Próximamente
                </span>
            </div>
        </div>
    )
}