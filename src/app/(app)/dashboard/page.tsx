import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardActions } from '@/components/DashboardActions'

function statusBadge(status: string) {
    if (status === 'pending') return <span className="badge badge-pending">Pending</span>
    if (status === 'approved') return <span className="badge badge-approved">Approved</span>
    if (status === 'rejected') return <span className="badge badge-rejected">Rejected</span>
    return <span className="badge">{status}</span>
}

export default async function DashboardPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
            transactions: {
                orderBy: { date: 'desc' },
            }
        }
    })
    if (!user) redirect('/')

    const txs = user.transactions
    const deps = txs.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
    const wits = txs.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((s, t) => s + t.amount, 0)
    const pend = txs.filter(t => t.status === 'pending').length

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Welcome back 👋</div>
                    <div className="page-subtitle"><span className="live-dot"></span> &nbsp;Balance updates in real-time</div>
                </div>
            </div>

            <div className="balance-hero">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount"><span>$</span>{user.balance.toFixed(2)}</div>
                <div className="balance-change">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    Live balance — last updated just now
                </div>
                <DashboardActions balance={user.balance} />
            </div>

            <div className="two-col">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Recent Activity</div>
                            <div className="card-subtitle">Your last transactions</div>
                        </div>
                    </div>
                    <div>
                        {txs.length === 0 ? (
                            <div className="empty-state">
                                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                <h3>No transactions yet</h3>
                                <p>Make a deposit to get started</p>
                            </div>
                        ) : (
                            txs.slice(0, 5).map(tx => (
                                <div className="history-item" key={tx.id}>
                                    <div className={`history-icon ${tx.type !== 'withdraw' ? 'dep' : 'wit'}`}>
                                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            {tx.type !== 'withdraw'
                                                ? <path d="M12 5v14M19 12l-7 7-7-7" />
                                                : <path d="M12 19V5M5 12l7-7 7 7" />}
                                        </svg>
                                    </div>
                                    <div className="history-info">
                                        <div className="history-type">{tx.type === 'admin_update' ? 'Balance Update' : tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</div>
                                        <div className="history-date">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div>
                                        <div className={`history-amt ${tx.type !== 'withdraw' ? 'pos' : 'neg'}`}>
                                            {tx.type === 'withdraw' ? '-' : '+'}${tx.amount.toFixed(2)}
                                        </div>
                                        <div className="history-status" style={{ textAlign: 'right' }}>
                                            {statusBadge(tx.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Stats Overview</div>
                            <div className="card-subtitle">Your account summary</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="stat-card cyan" style={{ padding: '1rem' }}>
                            <div className="stat-label">Total Deposited</div>
                            <div className="stat-value cyan" style={{ fontSize: '1.3rem' }}>${deps.toFixed(2)}</div>
                        </div>
                        <div className="stat-card purple" style={{ padding: '1rem' }}>
                            <div className="stat-label">Total Withdrawn</div>
                            <div className="stat-value purple" style={{ fontSize: '1.3rem' }}>${wits.toFixed(2)}</div>
                        </div>
                        <div className="stat-card warn" style={{ padding: '1rem' }}>
                            <div className="stat-label">Pending Requests</div>
                            <div className="stat-value warn" style={{ fontSize: '1.3rem' }}>{pend}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
