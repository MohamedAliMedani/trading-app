'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

export default function Sidebar({ user }: { user: { name: string; email: string; role: string; id: string } }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const isAdmin = user.role === 'ADMIN'

    return (
        <>
            <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">Fin<span>Vault</span></div>

                {!isAdmin ? (
                    <div>
                        <div className="nav-label" style={{ marginBottom: '0.6rem' }}>User Menu</div>
                        <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                            Dashboard
                        </Link>
                        <Link href="/transactions" className={`nav-item ${pathname === '/transactions' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                            Transactions
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="nav-label" style={{ marginBottom: '0.6rem' }}>Admin Panel</div>
                        <Link href="/admin" className={`nav-item ${pathname === '/admin' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Overview
                        </Link>
                        <Link href="/admin/transactions" className={`nav-item ${pathname === '/admin/transactions' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            Manage Transactions
                        </Link>
                        <Link href="/admin/users" className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                            Users
                        </Link>
                    </div>
                )}

                <div style={{ height: '1.5rem' }}></div>

                <div className="sidebar-user">
                    <div className="sidebar-user-name">{user.name}</div>
                    <div className="sidebar-user-role">{user.email}</div>
                    <div>
                        <span className={`sidebar-user-badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                            {isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                    </div>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                            await logout();
                            window.location.href = '/';
                        }}
                        style={{ marginTop: '0.8rem', width: '100%' }}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>
        </>
    )
}
