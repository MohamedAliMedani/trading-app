'use client'

import { useState, useEffect } from 'react'

type Status = 'CLOSED' | 'LIVE' | 'RECOVERY' | 'COMPLETED'

export default function TradingClient({ userBalance, beforeBalance }: { userBalance: number, beforeBalance: number }) {
    const [status, setStatus] = useState<Status>('CLOSED')
    const [timeLeft, setTimeLeft] = useState('')
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [mounted, setMounted] = useState(false)

    // Calculate profit/loss for logic overrides
    const currentProfit = userBalance - beforeBalance

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)

            const hours = now.getUTCHours()
            const minutes = now.getUTCMinutes()
            const timeInMinutes = hours * 60 + minutes

            // Session Windows in GMT (UTC)
            const liveStart = 16 * 60       // 16:00 GMT (4 PM)
            const liveEnd = 16 * 60 + 30    // 16:30 GMT (4:30 PM)

            // Status Logic
            const isLiveTime = timeInMinutes >= liveStart && timeInMinutes < liveEnd

            if (isLiveTime) {
                // If profit/loss is already detected, the session is effectively completed for the user
                if (currentProfit !== 0) {
                    setStatus('COMPLETED')
                } else {
                    setStatus('LIVE')
                }
            } else {
                setStatus('CLOSED')
            }

            // Countdown Logic using UTC Date objects
            const target = new Date(now)
            if (timeInMinutes < liveStart) {
                target.setUTCHours(16, 0, 0, 0)
            } else if (timeInMinutes < liveEnd) {
                target.setUTCHours(16, 30, 0, 0)
            } else {
                target.setUTCDate(now.getUTCDate() + 1)
                target.setUTCHours(16, 0, 0, 0)
            }

            const diff = target.getTime() - now.getTime()
            const h = Math.floor(diff / (1000 * 60 * 60))
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const s = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
        }, 1000)

        return () => clearInterval(timer)
    }, [currentProfit]) // Re-run effect if balance changes to update status immediately

    const getStatusHeader = () => {
        switch (status) {
            case 'LIVE':
                return {
                    title: 'Trade Under Process',
                    subtitle: 'Main trading session is currently active.',
                    color: 'var(--accent3)',
                    label: 'LIVE TRADING',
                    icon: '⚡'
                }
            case 'RECOVERY':
                return {
                    title: 'Trade Under Process',
                    subtitle: 'Recovery session is currently active.',
                    color: 'var(--accent2)',
                    label: 'RECOVERY SESSION',
                    icon: '🛡️'
                }
            case 'COMPLETED':
                return {
                    title: 'Session Completed',
                    subtitle: 'Your trading result for today has been processed.',
                    color: 'var(--accent)',
                    label: 'COMPLETED',
                    icon: '✅'
                }
            default:
                return {
                    title: 'Market Closed',
                    subtitle: 'Trading is currently inactive. Please wait for the next session.',
                    color: 'var(--muted)',
                    label: 'CLOSED',
                    icon: '🌙'
                }
        }
    }

    const config = getStatusHeader()
    const profit = userBalance - beforeBalance
    const profitPct = beforeBalance > 0 ? (profit / beforeBalance) * 100 : 0

    return (
        <div className="page active" style={{ display: 'block' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Trading Status</div>
                    <div className="page-subtitle">Real-time session updates</div>
                </div>
            </div>

            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--surface2)', overflow: 'hidden', position: 'relative' }}>
                {status !== 'CLOSED' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '4px',
                            background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                            animation: 'shimmer 2s infinite'
                        }}
                    ></div>
                )}

                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{config.icon}</div>
                <div style={{
                    display: 'inline-block',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    background: `${config.color}20`,
                    color: config.color,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    marginBottom: '1.5rem'
                }}>
                    {config.label}
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{config.title}</h1>
                <p style={{ color: 'var(--muted)', marginBottom: '3rem' }}>{config.subtitle}</p>

                <div className="two-col" style={{ gap: '2rem', marginBottom: '3rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '20px', padding: '2rem', flex: 1, border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div className="stat-label" style={{ marginBottom: '0.5rem' }}>
                            {status === 'LIVE' || status === 'RECOVERY' ? 'Ends In' : status === 'COMPLETED' ? 'Session Outcome' : 'Next Session In'}
                        </div>
                        <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--text)' }}>
                            {!mounted ? '--:--:--' : status === 'COMPLETED' ? 'RESULT PROCESSED' : (timeLeft || '00:00:00')}
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg)', borderRadius: '20px', padding: '2rem', flex: 1, border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Session Profit / Loss</div>
                        <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: profit >= 0 ? 'var(--accent3)' : 'var(--danger)' }}>
                            {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                            <span style={{ fontSize: '1rem', marginLeft: '0.5rem', opacity: 0.8 }}>
                                ({profit >= 0 ? '+' : ''}{profitPct.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="two-col" style={{ gap: '1rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--surface1)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', textAlign: 'left' }}>
                        <div className="stat-label" style={{ fontSize: '0.7rem' }}>BALANCE BEFORE</div>
                        <div className="mono" style={{ fontSize: '1.2rem', marginTop: '0.25rem', fontWeight: 600 }}>${beforeBalance.toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'var(--surface1)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--border)', textAlign: 'left' }}>
                        <div className="stat-label" style={{ fontSize: '0.7rem' }}>CURRENT BALANCE</div>
                        <div className="mono" style={{ fontSize: '1.2rem', marginTop: '0.25rem', fontWeight: 600, color: 'var(--accent)' }}>${userBalance.toFixed(2)}</div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg)', padding: '1.2rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                        <div className="stat-label">Daily Trading (GMT)</div>
                        <div style={{ fontSize: '1rem', marginTop: '0.5rem', fontWeight: 600 }}>16:00 - 16:30</div>
                    </div>
                    <div style={{ background: 'var(--bg)', padding: '1.2rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                        <div className="stat-label">System Time (GMT)</div>
                        <div className="mono" style={{ fontSize: '1rem', marginTop: '0.5rem', fontWeight: 600 }}>
                            {mounted && currentTime ? (
                                <>
                                    {currentTime.getUTCHours().toString().padStart(2, '0')}:
                                    {currentTime.getUTCMinutes().toString().padStart(2, '0')}:
                                    {currentTime.getUTCSeconds().toString().padStart(2, '0')}
                                </>
                            ) : '--:--:--'}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @media (max-width: 768px) {
                    .two-col { flex-direction: column; }
                }
            `}</style>
        </div>
    )
}
