import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersTableClientWrapper from '@/components/AdminUsersClient'

export default async function AdminUsersPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/')

    const usersData = await prisma.user.findMany({
        include: {
            transactions: {
                where: {
                    type: { in: ['deposit', 'withdraw'] }
                },
                orderBy: { date: 'desc' },
                take: 1
            },
            _count: {
                select: { transactions: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const users = usersData.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        balance: u.balance,
        txCount: u._count.transactions,
        lastAddr: u.transactions[0]
            ? (u.transactions[0].type === 'deposit' ? u.transactions[0].fromAddr : u.transactions[0].toAddr)
            : '—'
    }))

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">User Management</div>
                    <div className="page-subtitle">Manage user balances and accounts</div>
                </div>
            </div>

            <UsersTableClientWrapper users={users} />
        </div>
    )
}
