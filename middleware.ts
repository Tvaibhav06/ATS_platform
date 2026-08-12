import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from './lib/jwt'

// Simple middleware to secure API routes and Dashboard
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Public paths
  if (path.startsWith('/api/v1/auth/register') || path.startsWith('/api/v1/auth/login')) {
    return NextResponse.next()
  }

  // Protect /dashboard
  if (path.startsWith('/dashboard')) {
    const refreshToken = req.cookies.get('refreshToken')?.value
    const accessToken = req.cookies.get('accessToken')?.value
    
    // If no tokens exist, redirect to login (or home in this case, since we don't have a dedicated login page yet)
    if (!refreshToken && !accessToken) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Protect /api/v1 routes
  if (path.startsWith('/api/v1/')) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = await verifyAccessToken(token)

    if (!payload) {
      return NextResponse.json({ success: false, error: { message: 'Invalid or expired token' } }, { status: 401 })
    }

    // Role Based Access Control (RBAC) Example
    if (path.startsWith('/api/v1/admin') && payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    // Pass payload as headers for the route handlers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/v1/:path*', '/dashboard/:path*'],
}
