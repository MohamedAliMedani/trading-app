'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'info' | 'success' | 'error'

interface ToastContextValue {
    showToast: (msg: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ msg: string; type: ToastType; visible: boolean }>({
        msg: '',
        type: 'info',
        visible: false,
    })

    const showToast = useCallback((msg: string, type: ToastType = 'info') => {
        setToast({ msg, type, visible: true })
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }))
        }, 3500)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>{toast.msg}</div>
        </ToastContext.Provider>
    )
}
