import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CopyButton } from '@/components/DashboardActions'

export default async function ProfilePage() {
    const session = await getSession()
    if (!session) redirect('/')

    const [user, allTxStats] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.id },
            include: {
                _count: {
                    select: { referrals: true }
                },
                referredBy: {
                    select: { name: true, email: true }
                }
            }
        }),
        prisma.transaction.findMany({
            where: { userId: session.id, status: 'approved' },
            select: { type: true, amount: true, note: true }
        })
    ])

    if (!user) redirect('/')

    const deps = allTxStats.filter((t: any) => t.type === 'deposit').reduce((s: number, t: any) => s + t.amount, 0)
    const wits = allTxStats.filter((t: any) => t.type === 'withdraw').reduce((s: number, t: any) => s + t.amount, 0)

    // Calculate Total Profit/Loss from admin updates
    const adminUpdates = allTxStats.filter(t => t.type === 'admin_update')
    let totalProfit = 0
    let totalLoss = 0

    adminUpdates.forEach(t => {
        const isLoss = t.note?.toLowerCase().includes('loss') || t.note?.toLowerCase().includes('deduction')
        if (isLoss) {
            totalLoss += t.amount
        } else {
            totalProfit += t.amount
        }
    })

    const netProfit = totalProfit - totalLoss

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Profile Account</div>
                    <div className="page-subtitle">Personal data and account overview</div>
                </div>
            </div>

            <div className="two-col">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">User Information</div>
                            <div className="card-subtitle">Your basic details</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(0,229,255,0.2)'
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user.email}</div>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div className="stat-label" style={{ fontSize: '0.65rem' }}>Role</div>
                                <div style={{ marginTop: '0.25rem' }}>
                                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`} style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div className="stat-label" style={{ fontSize: '0.65rem' }}>Joined Date</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <div className="stat-label" style={{ fontSize: '0.65rem' }}>Account ID / Referral ID</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{user.id}</span>
                                <CopyButton text={user.id} />
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                                Share this ID with friends to earn referral bonuses.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Referral & Network</div>
                            <div className="card-subtitle">Your referral stats</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                        <div className="stat-card cyan" style={{ padding: '1.25rem' }}>
                            <div className="stat-label">Total Referrals</div>
                            <div className="stat-value cyan" style={{ fontSize: '1.5rem' }}>{user._count.referrals} users</div>
                        </div>

                        {user.referredBy ? (
                            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <div className="stat-label" style={{ fontSize: '0.65rem' }}>Referred By</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
                                        {user.referredBy.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.referredBy.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{user.referredBy.email}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                                <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>No Referrer</div>
                            </div>
                        )}

                        <div className="card-title" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Financial Summary</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Total Deposited</span>
                                <span className="mono" style={{ fontWeight: 600 }}>${deps.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Total Withdrawn</span>
                                <span className="mono" style={{ fontWeight: 600 }}>${wits.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Net Trading Profit</span>
                                <span className={`mono ${netProfit >= 0 ? 'pos' : 'neg'}`} style={{ fontWeight: 700 }}>
                                    {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
