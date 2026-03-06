'use client'

import { useState } from 'react'
import { updateUserBalance, processTransaction, applyGlobalPercentage } from '@/app/actions/admin'
import { useToast } from '@/components/Toast'

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
                        <label>New Balance (USD)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label">$</span>
                            <input type="number" name="amount" defaultValue={user.balance} min="0" step="0.01" required
                                style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                            />
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
