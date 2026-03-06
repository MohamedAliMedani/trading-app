'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, register } from './actions/auth'
import { useToast } from '@/components/Toast'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await login(formData)
    setLoading(false)
    if (res?.error) {
      showToast(res.error, 'error')
    } else if (res?.success) {
      showToast('Login successful!', 'success')
      router.push(res.redirect!)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await register(formData)
    setLoading(false)
    if (res?.error) {
      showToast(res.error, 'error')
    } else if (res?.success) {
      showToast('Account created successfully!', 'success')
      router.push(res.redirect!)
    }
  }

  return (
    <div className="screen active" id="auth-screen">
      <div style={{ textAlign: 'center' }}>
        <div className="auth-logo">Fin<span>Vault</span></div>
        <div className="auth-tagline">Digital Wallet Platform</div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} id="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" required />
              </div>
              {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div> */}
              <button disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
              {/* <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
                Admin? Use <span style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>admin@finvault.io</span> / <span style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>admin123</span>
              </p> */}
            </form>
          ) : (
            <form onSubmit={handleRegister} id="register-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Min 8 characters" required minLength={8} />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                  Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).
                </div>
              </div>
              <button disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Creating...' : 'Create Account →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
