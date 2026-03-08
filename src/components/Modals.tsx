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
                    <strong>Our USDT (BEP20) Address</strong><br />
                    Send exactly <strong style={{ color: 'var(--accent)' }}>USDT on the BEP20 (BSC) network</strong> to the address below. Any other token or network will be lost.
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
                        <input type="text" name="fromAddr" placeholder="Your BEP20 wallet address (0x...)" required />
                    </div>

                    <div className="form-group">
                        <label>Amount (USDT)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label" style={{ fontSize: '0.8rem', paddingTop: '2px' }}>USDT</span>
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

export function WithdrawModal({ isOpen, onClose, balance, hasDoubled }: { isOpen: boolean; onClose: () => void; balance: number; hasDoubled: boolean }) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState<string>('')

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

                {!hasDoubled && (
                    <div className="info-box warn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            <div>
                                <strong style={{ fontSize: '0.85rem' }}>High Withdrawal Fee (25%)</strong>
                                <p style={{ fontSize: '0.75rem', margin: '0.15rem 0 0', lineHeight: 1.4 }}>
                                    Your account has not yet doubled its investment. To lower the fee to <strong>2%</strong>, your total profit must equal your total deposit.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Receiving Address <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>(USDT BEP20 Only)</span></label>
                        <input type="text" name="toAddr" placeholder="Your BEP20 wallet address (0x...)" required />
                    </div>

                    <div className="form-group">
                        <label>Amount (USDT)</label>
                        <div className="amount-input-wrap">
                            <span className="currency-label" style={{ fontSize: '0.8rem', paddingTop: '2px' }}>USDT</span>
                            <input type="number" name="amount" placeholder="0.00" min="1" step="0.01" max={balance} required
                                value={amount} onChange={(e) => setAmount(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem', paddingLeft: '2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--muted)' }}>Current Balance:</span>
                            <strong>${balance.toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--muted)' }}>Withdrawal Fee ({hasDoubled ? '2%' : '25%'}):</span>
                            <strong style={{ color: hasDoubled ? 'var(--accent)' : '#ef4444' }}>-${(Number(amount) * (hasDoubled ? 0.02 : 0.25)).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                            <span><strong>You will receive:</strong></span>
                            <strong style={{ color: 'var(--success, #22c55e)' }}>${(Number(amount) * (hasDoubled ? 0.98 : 0.75)).toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="info-box" style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
                        Withdrawals are processed after admin approval, typically within <strong>6 hours during day</strong>.
                    </div>

                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Submitting...' : 'Request Withdrawal →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
