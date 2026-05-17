import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#f8faf8]">
            <TopBar />
            <Sidebar />
            <main className="pl-[288px] pt-[64px] min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}