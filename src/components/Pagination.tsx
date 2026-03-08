'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
    currentPage: number
    totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem' }}>
            <Link
                href={createPageURL(currentPage - 1)}
                className={`btn btn-secondary btn-sm ${currentPage <= 1 ? 'disabled' : ''}`}
                style={{ pointerEvents: currentPage <= 1 ? 'none' : 'auto', opacity: currentPage <= 1 ? 0.5 : 1, width: 'auto' }}
            >
                Previous
            </Link>

            <div style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>
                Page <span style={{ color: 'var(--text)', fontWeight: 700 }}>{currentPage}</span> of {totalPages}
            </div>

            <Link
                href={createPageURL(currentPage + 1)}
                className={`btn btn-secondary btn-sm ${currentPage >= totalPages ? 'disabled' : ''}`}
                style={{ pointerEvents: currentPage >= totalPages ? 'none' : 'auto', opacity: currentPage >= totalPages ? 0.5 : 1, width: 'auto' }}
            >
                Next
            </Link>
        </div>
    )
}
