'use client'

import { useState } from 'react'
import { UpdateBalanceModal, GlobalPercentageModal, CopyAddress } from '@/components/AdminComponents'

export default function UsersTableClientWrapper({
    users
}: {
    users: Array<{ id: string; name: string; email: string; balance: number; txCount: number; refCount: number; lastAddr: string; referrer: string; createdAt: string }>
}) {
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string; balance: number } | null>(null)
    const [isGlobalModalOpen, setGlobalModalOpen] = useState(false)

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-primary btn-sm" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => setGlobalModalOpen(true)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    Apply Global Profit / Loss
                </button>
            </div>
            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Account ID / Referrer</th>
                                <th>Joined</th>
                                <th>Balance</th>
                                <th>Wallet Address</th>
                                <th>Txs</th>
                                <th>Refs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={5}><div className="empty-state" style={{ padding: '2rem' }}><p>No users registered yet.</p></div></td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td><span style={{ fontWeight: 700 }}>{u.name}</span><br /><span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{u.email}</span></td>
                                        <td>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>ID: <CopyAddress address={u.id} /></div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '4px' }}>Ref: {u.referrer}</div>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td><span className="mono" style={{ color: 'var(--accent3)', fontWeight: 600 }}>${u.balance.toFixed(2)}</span></td>
                                        <td><span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{u.lastAddr}</span></td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{u.txCount}</td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>{u.refCount}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setSelectedUser(u)}
                                            >
                                                Edit Balance
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <UpdateBalanceModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
            <GlobalPercentageModal isOpen={isGlobalModalOpen} onClose={() => setGlobalModalOpen(false)} />
        </>
    )
}
