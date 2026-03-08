import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function typeBadge(type: string, note?: string | null) {
    if (type === 'deposit') return <span className="badge badge-deposit">Deposit</span>
    if (type === 'withdraw') return <span className="badge badge-withdraw">Withdraw</span>
    if (type === 'admin_update') {
        const n = note?.toLowerCase() || ''
        if (n.includes('bonus')) return <span className="badge" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--accent2)' }}>Bonus</span>
        if (n.includes('reward')) return <span className="badge" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent)' }}>Reward</span>
        if (n.includes('loss')) return <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>Trading Loss</span>
        return <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent3)' }}>Trading Profit</span>
    }
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

export default async function TransactionsPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const txs = await prisma.transaction.findMany({
        where: { userId: session.id },
        orderBy: { date: 'desc' },
    })

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Transactions</div>
                    <div className="page-subtitle">Full history of your deposits & withdrawals</div>
                </div>
            </div>
            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txs.length === 0 ? (
                                <tr><td colSpan={4}><div className="empty-state"><p>No transactions yet.</p></div></td></tr>
                            ) : (
                                txs.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{typeBadge(tx.type, tx.note)}</td>
                                        <td className="mono">${tx.amount.toFixed(2)}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td>{statusBadge(tx.status)}</td>
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
