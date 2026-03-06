import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('fv_session')?.value
    const path = request.nextUrl.pathname

    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // To properly decode and check role in middleware we'd use `jose` since it runs on Edge,
    // but since we are just checking if token exists to restrict basic access, we can rely
    // on layout/page level checks to properly kick out non-admins from /admin

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*'],
}
