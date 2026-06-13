import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSession, getAdminCredentials, secureCompare } from '@/lib/admin-auth'

const attempts = globalThis as typeof globalThis & { __adminLoginAttempts?: Map<string, { count: number; resetAt: number }> }
attempts.__adminLoginAttempts ??= new Map()

export async function POST(request: NextRequest) {
  const clientId = getClientId(request)
  const rateLimit = checkRateLimit(clientId)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }, { status: 429 })
  }

  const { user: expectedUser, password: expectedPassword } = getAdminCredentials()

  if (!expectedUser || !expectedPassword) {
    return NextResponse.json({ error: 'Credenciales de admin no configuradas.' }, { status: 503 })
  }

  const body = await request.json().catch(() => null) as { user?: string; password?: string } | null
  const user = body?.user ?? ''
  const password = body?.password ?? ''
  const isValid = secureCompare(user, expectedUser) && secureCompare(password, expectedPassword)

  if (!isValid) {
    registerFailedAttempt(clientId)
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })
  }

  attempts.__adminLoginAttempts?.delete(clientId)

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: await createAdminSession(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE
  })

  return response
}

function getClientId(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}

function checkRateLimit(clientId: string) {
  const current = attempts.__adminLoginAttempts?.get(clientId)
  if (!current) return { allowed: true }

  if (current.resetAt <= Date.now()) {
    attempts.__adminLoginAttempts?.delete(clientId)
    return { allowed: true }
  }

  return { allowed: current.count < 5 }
}

function registerFailedAttempt(clientId: string) {
  const current = attempts.__adminLoginAttempts?.get(clientId)
  const resetAt = Date.now() + 10 * 60 * 1000
  attempts.__adminLoginAttempts?.set(clientId, {
    count: (current?.count ?? 0) + 1,
    resetAt: current?.resetAt && current.resetAt > Date.now() ? current.resetAt : resetAt
  })
}
