import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsersTableClientWrapper from '@/components/AdminUsersClient'
import Pagination from '@/components/Pagination'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const limit = 10
    const skip = (currentPage - 1) * limit

    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/')

    const [usersData, totalItems] = await Promise.all([
        prisma.user.findMany({
            include: {
                transactions: {
                    where: {
                        type: { in: ['deposit', 'withdraw'] }
                    },
                    orderBy: { date: 'desc' },
                    take: 1
                },
                _count: {
                    select: {
                        transactions: true,
                        referrals: true
                    }
                },
                referredBy: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count()
    ])

    const totalPages = Math.ceil(totalItems / limit)

    const users = usersData.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        balance: u.balance,
        txCount: u._count.transactions,
        refCount: u._count.referrals,
        createdAt: u.createdAt,
        lastAddr: u.transactions[0]
            ? (u.transactions[0].type === 'deposit' ? u.transactions[0].fromAddr : u.transactions[0].toAddr)
            : '—',
        referrer: u.referredBy ? `${u.referredBy.name} (${u.referredBy.email})` : '—'
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
            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    )
}
