import { NextRequest, NextResponse } from 'next/server'
import { isAdminSessionValid } from '@/lib/admin-auth'

export const config = {
  matcher: ['/admin/:path*']
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'
  const isAuthenticated = await isAdminSessionValid(request)

  if (isLoginPage) {
    if (!isAuthenticated) return NextResponse.next()
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (isAuthenticated) return NextResponse.next()

  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}
