'use client'

import { useState } from 'react'
import { updateUserBalance, processTransaction } from '@/app/actions/admin'
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
