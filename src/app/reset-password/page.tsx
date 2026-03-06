'use client'

import { useState, useEffect } from 'react'
import { resetPassword } from '@/app/actions/auth'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ResetPasswordForm() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setMessage({ text: 'Invalid or missing reset token.', type: 'error' })
        }
    }, [token])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!token) return

        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        formData.append('token', token)

        const res = await resetPassword(formData)

        setLoading(false)
        if (res.error) {
            setMessage({ text: res.error, type: 'error' })
        } else {
            setMessage({ text: 'Password reset completely successfully. Redirecting...', type: 'success' })
            setTimeout(() => {
                router.push('/')
            }, 2000)
        }
    }

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <div className="auth-logo">FinVault</div>
                        <div className="auth-subtitle">Invalid Token</div>
                    </div>
                    <div className="auth-message error">
                        Warning: No reset token provided in the URL.
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                        <Link href="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Request a new reset link</Link>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <div className="auth-logo">FinVault</div>
                    <div className="auth-subtitle">Set New Password</div>
                </div>

                {message && (
                    <div className={`auth-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="password" placeholder="••••••••" required />
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                            Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).
                        </div>
                    </div>
                    <button disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Resetting...' : 'Reset Password →'}
                    </button>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
                        Or return to <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="auth-container">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
