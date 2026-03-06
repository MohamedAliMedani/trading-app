'use client'

import { useState } from 'react'
import { requestDeposit, requestWithdrawal } from '@/app/actions/transactions'
import { useToast } from './Toast'

export function DepositModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await requestDeposit(formData)
        setLoading(false)
        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast('Deposit request submitted! Awaiting confirmation.', 'success')
            onClose()
        }
    }

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">💰 Deposit Funds</div>
                <div className="modal-sub">Send funds to the wallet address below, then confirm the amount</div>

                <div className="info-box">
                    <strong>Our Wallet Address</strong><br />
                    Send your crypto to the address below. Once confirmed, enter the amount and we'll update your balance.
                </div>

                <div className="form-group">
                    <label>Platform Wallet Address</label>
                    <div className="wallet-box" onClick={() => {
                        navigator.clipboard.writeText('0xA1B2C3D4E5F6a1b2c3d4e5f6A1B2C3D4E5F6a1b2')
                        showToast('Wallet address copied!', 'success')
                    }}>
                        <span className="copy-hint" style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>Tap to Copy</span>
                        <span>0xA1B2C3D4E5F6a1b2c3d4e5f6A1B2C3D4E5F6a1b2</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Sending Address</label>
                        <input type="text" name="fromAddr" placeholder="Your wallet address (0x...)" required />
                    </div>

                    <div className="form-group">
                        <label>Amount (USD)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label">$</span>
                            <input type="number" name="amount" placeholder="0.00" min="1" step="0.01" required
                                style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '0.5rem' }}>
                        ⏳ Deposits are reviewed and confirmed within <strong>1–24 hours</strong> by our team.
                    </div>

                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Submitting...' : 'Submit Deposit Request →'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export function WithdrawModal({ isOpen, onClose, balance }: { isOpen: boolean; onClose: () => void; balance: number }) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await requestWithdrawal(formData)
        setLoading(false)
        if (res.error) {
            showToast(res.error, 'error')
        } else {
            showToast('Withdrawal request submitted! Processing...', 'info')
            onClose()
        }
    }

    return (
        <div className="modal-overlay open" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">🏧 Withdraw Funds</div>
                <div className="modal-sub">Enter your wallet address and amount to withdraw</div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Receiving Address</label>
                        <input type="text" name="toAddr" placeholder="Your wallet address (0x...)" required />
                    </div>

                    <div className="form-group">
                        <label>Amount (USD)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label">$</span>
                            <input type="number" name="amount" placeholder="0.00" min="1" step="0.01" max={balance} required
                                style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '1rem' }}>
                        💡 Your current balance: <strong>${balance.toFixed(2)}</strong><br />
                        Withdrawals are processed after admin approval, typically within <strong>24–48 hours</strong>.
                    </div>

                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Submitting...' : 'Request Withdrawal →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
