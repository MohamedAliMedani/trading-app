'use client'

import { useState } from 'react'
import { processTransaction, applyGlobalPercentage, updateUserBalance } from '@/app/actions/admin'
import { useToast } from '@/components/Toast'

export function CopyAddress({ address }: { address: string }) {
    const { showToast } = useToast()

    if (!address || address === '—' || address === 'Admin') return <span>{address || '—'}</span>

    const handleCopy = () => {
        navigator.clipboard.writeText(address)
        showToast('Address copied!', 'info')
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{address}</span>
            <button
                onClick={handleCopy}
                style={{
                    padding: '4px',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
                title="Copy full address"
            >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
            </button>
        </div>
    )
}

export function AdminTransactionActions({ txId }: { txId: string }) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    async function handleAction(action: 'approve' | 'reject') {
        setLoading(true)
        const res = await processTransaction(txId, action)
        setLoading(false)
        if (res.error) showToast(res.error, 'error')
        else showToast(`Transaction ${action}d!`, 'success')
    }

    return (
        <div className="tx-actions">
            <button disabled={loading} className="btn btn-success btn-sm" onClick={() => handleAction('approve')}>✓ Approve</button>
            <button disabled={loading} className="btn btn-danger btn-sm" onClick={() => handleAction('reject')}>✕ Reject</button>
        </div>
    )
}

export function UpdateBalanceModal({
    isOpen, onClose, user
}: {
    isOpen: boolean; onClose: () => void; user: { id: string; name: string; email: string; balance: number } | null
}) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    if (!isOpen || !user) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('userId', user!.id)
        const res = await updateUserBalance(formData)
        setLoading(false)
        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast(`Balance updated for ${user!.name}`, 'success')
            onClose()
        }
    }

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">✏️ Update User Balance</div>
                <div className="modal-sub">Manually adjust the balance for this user</div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User</label>
                        <input type="text" value={user.name} readOnly style={{ opacity: 0.6 }} />
                    </div>
                    <div className="form-group">
                        <label>Update Type</label>
                        <select name="type" required style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}>
                            <option value="Profit">📈 Profit</option>
                            <option value="Bonus">🎁 Bonus</option>
                            <option value="Reward">🏆 Reward</option>
                            <option value="Correction">🔧 Correction / Manual</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount to Add (USD)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label">$</span>
                            <input type="number" name="amount" placeholder="e.g. 50.00" step="0.01" required
                                style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                            Current balance: <strong>${user.balance.toFixed(2)}</strong>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Reason / Note</label>
                        <input type="text" name="note" placeholder="e.g. Deposit confirmed, bonus added..." />
                    </div>
                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Updating...' : 'Update Balance →'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export function GlobalPercentageModal({
    isOpen, onClose
}: {
    isOpen: boolean; onClose: () => void
}) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await applyGlobalPercentage(formData)
        setLoading(false)
        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast(`Successfully applied to ${res.count} users!`, 'success')
            onClose()
        }
    }

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">📈 Global Profit / Loss</div>
                <div className="modal-sub">Apply a percentage to ALL user balances</div>

                <form onSubmit={handleSubmit}>
                    <div className="info-box" style={{ background: 'var(--surface2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        Use positive values for <strong>Profit</strong> (e.g., 5) and negative values for <strong>Loss</strong> (e.g., -5).
                    </div>
                    <div className="form-group">
                        <label>Percentage (%)</label>
                        <input type="number" name="percentage" placeholder="e.g. 5.5 or -2.0" step="0.01" required
                            style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Reason / Note (Optional)</label>
                        <input type="text" name="note" placeholder="e.g. Weekly Trading Profit"
                            style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                        />
                    </div>
                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', background: 'linear-gradient(135deg, var(--accent2), #5b21b6)', boxShadow: '0 4px 20px rgba(124,58,237,0.25)' }}>
                        {loading ? 'Processing...' : 'Apply to All Users →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
