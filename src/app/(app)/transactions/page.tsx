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
                                <th>Address</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txs.length === 0 ? (
                                <tr><td colSpan={5}><div className="empty-state"><p>No transactions yet.</p></div></td></tr>
                            ) : (
                                txs.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{typeBadge(tx.type)}</td>
                                        <td className="mono">${tx.amount.toFixed(2)}</td>
                                        <td><span className="addr-short">{shortAddr(tx.type === 'withdraw' ? tx.toAddr : tx.fromAddr)}</span></td>
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
