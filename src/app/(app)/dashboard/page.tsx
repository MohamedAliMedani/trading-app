import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardActions, CopyButton } from '@/components/DashboardActions'

function statusBadge(status: string) {
    if (status === 'pending') return <span className="badge badge-pending">Pending</span>
    if (status === 'approved') return <span className="badge badge-approved">Approved</span>
    if (status === 'rejected') return <span className="badge badge-rejected">Rejected</span>
    return <span className="badge">{status}</span>
}

function getReceiveAmount(amount: number, type: string, note?: string | null) {
    if (type === 'withdraw' && note && note.includes('Net: $')) {
        const parts = note.split('Net: $')
        if (parts.length > 1) {
            return parseFloat(parts[1])
        }
    }
    return amount
}

export default async function DashboardPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const [user, allTxStats] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.id },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 50 // Limit local fetching for history list but calculate stats separately
                },
                _count: {
                    select: { referrals: true }
                }
            }
        }),
        prisma.transaction.findMany({
            where: { userId: session.id, status: 'approved' },
            select: { type: true, amount: true, note: true }
        })
    ])

    if (!user) redirect('/')

    const txs = user.transactions
    const deps = allTxStats.filter((t: any) => t.type === 'deposit').reduce((s: number, t: any) => s + t.amount, 0)
    const wits = allTxStats.filter((t: any) => t.type === 'withdraw').reduce((s: number, t: any) => s + t.amount, 0)

    // Calculate Total Profit/Loss from admin updates
    const adminUpdates = allTxStats.filter(t => t.type === 'admin_update')
    let totalProfit = 0
    let totalLoss = 0

    adminUpdates.forEach(t => {
        // Simple heuristic: if the note says 'Loss' or the amount was implicitly a deduction (we'll look at the note for now if we don't have a sign)
        const isLoss = t.note?.toLowerCase().includes('loss') || t.note?.toLowerCase().includes('deduction')
        if (isLoss) {
            totalLoss += t.amount
        } else {
            totalProfit += t.amount // Assume profit or generic addition
        }
    })

    const netProfit = totalProfit - totalLoss
    const pend = await prisma.transaction.count({
        where: { userId: session.id, status: 'pending' }
    })

    // Milestone Check for Fee Display
    const hasDoubled = deps > 0 && (user.balance + wits - deps) >= deps

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
                <DashboardActions balance={user.balance} hasDoubled={hasDoubled} />
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
                                        <div className="history-type">
                                            {tx.type === 'admin_update'
                                                ? (tx.note?.toLowerCase().includes('bonus') ? 'Bonus' :
                                                    tx.note?.toLowerCase().includes('reward') ? 'Reward' :
                                                        tx.note?.toLowerCase().includes('loss') ? 'Trading Loss' : 'Trading Profit')
                                                : tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                        </div>
                                        <div className="history-date">
                                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            {tx.type === 'admin_update' && tx.note && (
                                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--muted)', marginTop: '2px' }}>{tx.note}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`history-amt ${tx.type === 'withdraw' || (tx.type === 'admin_update' && tx.note?.toLowerCase().includes('loss')) ? 'neg' : 'pos'}`}>
                                            {tx.type === 'withdraw' || (tx.type === 'admin_update' && tx.note?.toLowerCase().includes('loss')) ? '-' : '+'}${tx.amount.toFixed(2)}
                                        </div>
                                        {tx.type === 'withdraw' && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text)', fontWeight: 600, textAlign: 'right', marginTop: '2px' }}>
                                                Recv: ${getReceiveAmount(tx.amount, tx.type, tx.note).toFixed(2)}
                                            </div>
                                        )}
                                        <div className="history-status" style={{ textAlign: 'right', marginTop: '4px' }}>
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
                        <div className={`stat-card ${netProfit >= 0 ? 'cyan' : 'warn'}`} style={{ padding: '1rem', border: `1px solid ${netProfit >= 0 ? 'rgba(45,212,191,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                            <div className="stat-label">Net Profit / Loss</div>
                            <div className={`stat-value ${netProfit >= 0 ? 'cyan' : 'warn'}`} style={{ fontSize: '1.3rem' }}>
                                {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)}
                            </div>
                        </div>
                        <div className="stat-card warn" style={{ padding: '1rem' }}>
                            <div className="stat-label">Pending Requests</div>
                            <div className="stat-value warn" style={{ fontSize: '1.3rem' }}>{pend}</div>
                        </div>

                        {/* Withdrawal Cycle Progress Card */}
                        <div className="card" style={{ marginTop: '0.5rem', background: 'var(--surface1)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div className="card-header" style={{ padding: '1rem', paddingBottom: '0.5rem' }}>
                                <div>
                                    <div className="card-title" style={{ fontSize: '0.9rem' }}>Withdrawal Fee Status</div>
                                    <div className="card-subtitle" style={{ fontSize: '0.7rem' }}>Cycle-based fee milestone</div>
                                </div>
                                <span className={`badge ${hasDoubled ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                                    {hasDoubled ? '2% Fee Active' : '25% Standard Fee'}
                                </span>
                            </div>

                            <div style={{ padding: '1rem', paddingTop: '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--muted)' }}>Double Investment Progress</span>
                                    <span style={{ fontWeight: 700, color: hasDoubled ? 'var(--success)' : 'var(--accent)' }}>
                                        {Math.min(100, Math.max(0, (deps > 0 ? ((user.balance + wits - deps) / deps) * 100 : 0))).toFixed(0)}%
                                    </span>
                                </div>

                                <div style={{ height: '6px', width: '100%', background: 'var(--bg)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, Math.max(0, (deps > 0 ? ((user.balance + wits - deps) / deps) * 100 : 0)))}%`,
                                        background: hasDoubled ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, var(--accent), var(--accent2))',
                                        boxShadow: '0 0 10px rgba(0,229,255,0.2)',
                                        transition: 'width 1s ease-in-out'
                                    }}></div>
                                </div>

                                <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                    {hasDoubled ? (
                                        <p>✅ <strong>Milestone Reached!</strong> You've doubled your total investment. Your fee is locked at <strong>2%</strong>. Note: New deposits will start a new cycle.</p>
                                    ) : (
                                        <p>🚀 Profit <strong>${deps.toFixed(2)}</strong> more to reach the 2x milestone and lower your withdrawal fee to <strong>2%</strong>.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: '0.5rem', background: 'var(--bg)', border: '1px dashed var(--border)' }}>
                            <div className="card-title" style={{ fontSize: '0.85rem' }}>Account Profile</div>
                            <div style={{ marginTop: '1rem' }}>
                                <div className="stat-label" style={{ fontSize: '0.65rem' }}>Your Referral ID</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>{user.id}</span>
                                    <CopyButton text={user.id} />
                                </div>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <div className="stat-label" style={{ fontSize: '0.65rem' }}>Total Referrals</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.1rem' }}>
                                        {user._count.referrals} users
                                    </div>
                                </div>
                                {user.referredById && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div className="stat-label" style={{ fontSize: '0.65rem' }}>Referred By</div>
                                        <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{user.referredById}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
