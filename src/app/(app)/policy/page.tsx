import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function PolicyPage() {
    const session = await getSession()
    if (!session) redirect('/')

    const policies = [
        {
            id: 1,
            title: "Minimum Deposit",
            description: "The minimum deposit required is $300 per account.",
            icon: "💳"
        },
        {
            id: 2,
            title: "Daily Profit",
            description: "Enjoy an accumulated 2% profit every day on your deposited amount.",
            icon: "📈"
        },
        {
            id: 3,
            title: "Referral Reward",
            description: "For every new successful referral, the Referrer receives 4% accumulated daily profit for 2 days (2% normal daily profit + 2% referral reward).",
            icon: "🤝🎁"
        },
        {
            id: 4,
            title: "Withdrawal Process",
            description: "Withdrawals can be requested anytime and are processed within 24 hours. A 2% withdrawal fee applies to the withdrawn amount.",
            icon: "⌛💸"
        },
        {
            id: 5,
            title: "First & New Deposit Withdrawal Policy",
            description: "If you request a withdrawal before completing your first cycle (doubling your money), a 25% fee will be charged from the requested amount. Additionally, if a new deposit is made, the 25% withdrawal fee will apply again until the new deposited amount has been fully processed through a complete cycle.",
            icon: "⚠️"
        },
        {
            id: 6,
            title: "Trading Session",
            description: "The daily trading session runs for 30 minutes, from 16:00 - 16:30 GMT. This session occurs once per day.",
            icon: "🕗"
        },
        {
            id: 7,
            title: "Profit Distribution",
            description: "Profits are automatically distributed to users right after each trading session.",
            icon: "💰✨"
        }
    ]

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Platform Policy</div>
                    <div className="page-subtitle">FinVault Exchange - Process Overview</div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                {policies.map(p => (
                    <div key={p.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(0,229,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                            border: '1px solid rgba(0,229,255,0.2)',
                            color: 'var(--accent)'
                        }}>
                            {p.id}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>{p.title}</div>
                                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                            </div>
                            <div style={{ color: 'var(--muted)', lineHeight: 1.6 }}>{p.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.2)', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Need further clarification? Contact our <a href="https://t.me/Finvault2026" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', fontWeight: 600 }}>Customer Service on Telegram</a>.
                </p>
            </div>
        </div>
    )
}
