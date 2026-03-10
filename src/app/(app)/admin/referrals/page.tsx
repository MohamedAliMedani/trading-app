import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminReferralsClient from '@/components/AdminReferralsClient'

export default async function AdminReferralsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const limit = 10
    const skip = (currentPage - 1) * limit

    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/')

    const [users, totalItems] = await Promise.all([
        prisma.user.findMany({
            where: {
                OR: [
                    { referrals: { some: {} } },
                    { bonusTradesRemaining: { gt: 0 } }
                ]
            },
            include: {
                _count: {
                    select: { referrals: true }
                },
                referredBy: {
                    select: { name: true, email: true }
                }
            },
            orderBy: [{ bonusTradesRemaining: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limit
        }),
        prisma.user.count({
            where: {
                OR: [
                    { referrals: { some: {} } },
                    { bonusTradesRemaining: { gt: 0 } }
                ]
            }
        })
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Referral Program</div>
                    <div className="page-subtitle">Manage bonus profit trades (4% for 2 days)</div>
                </div>
            </div>

            <div className="info-box" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--accent2)', marginBottom: '1.5rem' }}>
                💡 <strong>Referral Policy:</strong> When a new user joins via referral, the <strong>Referrer</strong> automatically receives <strong>2 bonus trades</strong> at a fixed <strong>4% profit</strong> rate, overriding the global rate.
            </div>

            <AdminReferralsClient
                users={users as any}
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    )
}
