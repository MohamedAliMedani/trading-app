'use client'

import { useState } from 'react'
import { DepositModal, WithdrawModal } from '@/components/Modals'

export function DashboardActions({ balance }: { balance: number }) {
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
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setWithdrawOpen(false)} balance={balance} />
        </>
    )
}
