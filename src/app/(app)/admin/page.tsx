import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function typeBadge(type: string) {
    if (type === 'deposit') return <span className="badge badge-deposit">Deposit</span>
    if (type === 'withdraw') return <span className="badge badge-withdraw">Withdraw</span>
    if (type === 'admin_update') return <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent3)' }}>Balance Update</span>
    return <span className="badge">{type}</span>
}

function statusBadge(status: string) {
    if (status === 'pending') return <span className="badge badge-pending">Pending</span>
    if (status === 'approved') return <span className="badge badge-approved">Approved</span>
    if (status === 'rejected') return <span className="badge badge-rejected">Rejected</span>
    return <span className="badge">{status}</span>
}

function shortAddr(addr: string) {
    if (!addr || addr === '—' || addr === 'Admin') return addr || '—'
    if (addr.length <= 12) return addr
    return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export default async function AdminDashboardPage() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/')

    const [users, txs] = await Promise.all([
        prisma.user.findMany(),
        prisma.transaction.findMany({ include: { user: true }, orderBy: { date: 'desc' }, take: 8 })
    ])

    const uCount = users.length
    const totalBal = users.reduce((acc, u) => acc + u.balance, 0)
    const pendCount = txs.filter(t => t.status === 'pending').length
    const totalDep = txs.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0)

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Admin Overview</div>
                    <div className="page-subtitle">Platform-wide statistics</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent3)' }}>
                    <span className="live-dot"></span> Live Data
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card cyan">
                    <div className="stat-icon cyan"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg></div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value cyan">{uCount}</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div className="stat-label">Total Balance</div>
                    <div className="stat-value green">${totalBal.toFixed(0)}</div>
                </div>
                <div className="stat-card warn">
                    <div className="stat-icon warn"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <div className="stat-label">Pending Requests</div>
                    <div className="stat-value warn">{pendCount}</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg></div>
                    <div className="stat-label">Total Deposits</div>
                    <div className="stat-value purple">${totalDep.toFixed(0)}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Recent Transactions</div>
                        <div className="card-subtitle">Latest activity across all users</div>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txs.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No transactions</td></tr>
                            ) : (
                                txs.map(tx => (
                                    <tr key={tx.id}>
                                        <td><span style={{ fontWeight: 600 }}>{tx.user.name}</span><br /><span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{tx.user.email}</span></td>
                                        <td>{typeBadge(tx.type)}</td>
                                        <td className="mono">${tx.amount.toFixed(2)}</td>
                                        <td><span className="addr-short">{shortAddr(tx.toAddr)}</span></td>
                                        <td>{statusBadge(tx.status)}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{new Date(tx.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
