import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminTransactionActions, CopyAddress } from '@/components/AdminComponents'
import Pagination from '@/components/Pagination'

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

function getReceiveAmount(amount: number, type: string, note?: string | null) {
    if (type === 'withdraw' && note && note.includes('Net: $')) {
        const parts = note.split('Net: $')
        if (parts.length > 1) {
            return parseFloat(parts[1])
        }
    }
    return amount
}

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const limit = 10
    const skip = (currentPage - 1) * limit

    const session = await getSession()
    if (!session || session.role !== 'ADMIN') redirect('/')

    const [allTxs, totalItems, pending] = await Promise.all([
        prisma.transaction.findMany({
            include: { user: true },
            orderBy: { date: 'desc' },
            skip,
            take: limit
        }),
        prisma.transaction.count(),
        prisma.transaction.findMany({
            where: { status: 'pending' },
            include: { user: true },
            orderBy: { date: 'desc' }
        })
    ])

    const totalPages = Math.ceil(totalItems / limit)

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Manage Transactions</div>
                    <div className="page-subtitle">Approve or reject pending requests</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Pending Requests</div>
                        <div className="card-subtitle">Review and process deposits/withdrawals</div>
                    </div>
                    <span className="badge badge-pending" id="pending-count-badge">{pending.length} Pending</span>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Receive Amount</th>
                                <th>To Address</th>
                                <th>Requested</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.length === 0 ? (
                                <tr><td colSpan={6}><div className="empty-state" style={{ padding: '2rem' }}><p>✅ No pending transactions</p></div></td></tr>
                            ) : (
                                pending.map(tx => (
                                    <tr key={tx.id}>
                                        <td><span style={{ fontWeight: 600 }}>{tx.user.name}</span><br /><span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{tx.user.email}</span></td>
                                        <td>
                                            <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>${tx.amount.toFixed(2)}</span><br />
                                            {typeBadge(tx.type, tx.note)}
                                            {tx.note && <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{tx.note}</div>}
                                        </td>
                                        <td>
                                            <span className="mono" style={{ fontWeight: 700 }}>
                                                ${getReceiveAmount(tx.amount, tx.type, tx.note).toFixed(2)}
                                            </span>
                                        </td>
                                        <td><CopyAddress address={tx.toAddr} /></td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{new Date(tx.date).toLocaleString()}</td>
                                        <td><AdminTransactionActions txId={tx.id} /></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">All Transactions</div>
                        <div className="card-subtitle">Complete platform history</div>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Receive Amount</th>
                                <th>Address</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTxs.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No transactions</td></tr>
                            ) : (
                                allTxs.map(tx => (
                                    <tr key={tx.id}>
                                        <td><span style={{ fontWeight: 600 }}>{tx.user.name}</span></td>
                                        <td>{typeBadge(tx.type, tx.note)}</td>
                                        <td className="mono" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                                            ${tx.amount.toFixed(2)}
                                        </td>
                                        <td className="mono" style={{ fontWeight: 700 }}>
                                            ${getReceiveAmount(tx.amount, tx.type, tx.note).toFixed(2)}
                                        </td>
                                        <td><CopyAddress address={tx.toAddr} /></td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{new Date(tx.date).toLocaleDateString()}</td>
                                        <td>{statusBadge(tx.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
        </div>
    )
}
