'use client'

import { useState } from 'react'
import { DepositModal, WithdrawModal } from '@/components/Modals'
import { useToast } from '@/components/Toast'

export function CopyButton({ text }: { text: string }) {
    const { showToast } = useToast()

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        showToast('ID copied to clipboard!', 'info')
    }

    return (
        <button
            onClick={handleCopy}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
            title="Copy ID"
        >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
        </button>
    )
}

export function DashboardActions({ balance, hasDoubled }: { balance: number; hasDoubled: boolean }) {
    const [isDepositOpen, setDepositOpen] = useState(false)
    const [isWithdrawOpen, setWithdrawOpen] = useState(false)

    return (
        <>
            <div className="balance-actions">
                <button className="action-btn deposit" onClick={() => setDepositOpen(true)}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                    Deposit
                </button>
                <button className="action-btn withdraw" onClick={() => setWithdrawOpen(true)}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                    Withdraw
                </button>
            </div>
            <DepositModal isOpen={isDepositOpen} onClose={() => setDepositOpen(false)} />
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setWithdrawOpen(false)} balance={balance} hasDoubled={hasDoubled} />
        </>
    )
}
