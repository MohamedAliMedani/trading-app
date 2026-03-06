'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'
import Link from 'next/link'

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const res = await requestPasswordReset(formData)

        setLoading(false)
        if (res.error) {
            setMessage({ text: res.error, type: 'error' })
        } else {
            setMessage({ text: 'If an account with that email exists, we have sent a password reset link to it. (Check terminal for dev link)', type: 'success' })
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <div className="auth-logo">FinVault</div>
                    <div className="auth-subtitle">Reset Your Password</div>
                </div>

                {message && (
                    <div className={`auth-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" required />
                    </div>
                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Sending...' : 'Send Reset Link →'}
                    </button>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                        Remember your password? <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in here</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
