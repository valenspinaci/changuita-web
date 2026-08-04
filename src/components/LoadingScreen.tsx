import imgChanguita from '../assets/logoChanguita.svg'

export default function LoadingScreen() {
    return (
        <div
            className="h-screen w-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f8faf8 0%, #edf7f1 100%)' }}
        >
            <div className="absolute top-[-102px] right-[-64px] w-[512px] h-[512px] rounded-full bg-[rgba(203,230,211,0.2)] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-102px] left-[-64px] w-[384px] h-[384px] rounded-full bg-[rgba(155,245,190,0.1)] blur-[50px] pointer-events-none" />

            <img
                src={imgChanguita}
                alt="Changuita"
                className="h-[48px] relative z-10 animate-pulse"
            />
            <div className="flex gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#006039] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#006039] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#006039] animate-bounce" />
            </div>
        </div>
    )
}
