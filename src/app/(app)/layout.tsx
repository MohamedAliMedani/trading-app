import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession()
    if (!session) redirect('/')

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) {
        // Session is invalid, force fresh login
        redirect('/')
    }

    return (
        <div id="app-screen" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
            <Sidebar user={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
            <main className="main" id="main-content">
                {children}
            </main>
        </div>
    )
}
