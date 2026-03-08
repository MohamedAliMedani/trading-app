'use client'

import { useState } from 'react'
import { UpdateBalanceModal } from '@/components/AdminComponents'
import Pagination from '@/components/Pagination'

interface UserWithReferrals {
    id: string
    name: string
    email: string
    balance: number
    bonusTradesRemaining: number
    _count: { referrals: number }
    referredBy: { name: string; email: string } | null
}

export default function AdminReferralsClient({
    users,
    currentPage,
    totalPages
}: {
    users: UserWithReferrals[]
    currentPage: number
    totalPages: number
}) {
    const [selectedUser, setSelectedUser] = useState<UserWithReferrals | null>(null)

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Active Bonuses & Referrers</div>
                        <div className="card-subtitle">Users with pending 4% trades or successful referrals</div>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Referrals</th>
                                <th>Bonus Trades</th>
                                <th>Status</th>
                                <th>Referred By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No referral activity found</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span><br />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{u.email}</span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                            {u._count.referrals} users
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: u.bonusTradesRemaining > 0 ? 'var(--accent3)' : 'var(--muted)' }}>
                                                    {u.bonusTradesRemaining}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>remaining</span>
                                            </div>
                                        </td>
                                        <td>
                                            {u.bonusTradesRemaining > 0 ? (
                                                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent3)' }}>4% Active</span>
                                            ) : (
                                                <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>Standard</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                            {u.referredBy ? (
                                                <div>
                                                    <strong>{u.referredBy.name}</strong><br />
                                                    {u.referredBy.email}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setSelectedUser(u)}
                                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                                            >
                                                📈 Add Profit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
            <UpdateBalanceModal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
            />
        </>
    )
}
