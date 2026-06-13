import { NextRequest } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'rinconcito_admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8

const DEV_ADMIN_USER = 'Adminrinconcito1.'
const DEV_ADMIN_PASSWORD = 'Adminespanol1.'

export function getAdminCredentials() {
  const user = process.env.ADMIN_USER || (process.env.NODE_ENV === 'development' ? DEV_ADMIN_USER : '')
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'development' ? DEV_ADMIN_PASSWORD : '')
  const secret = process.env.ADMIN_SESSION_SECRET || password

  return { user, password, secret }
}

export async function createAdminSession() {
  const { secret } = getAdminCredentials()
  const payload = {
    sub: 'admin',
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
    nonce: crypto.randomUUID()
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = await signValue(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export async function isAdminSessionValid(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!session) return false

  return verifyAdminSession(session)
}

export async function verifyAdminSession(session: string) {
  const { secret } = getAdminCredentials()
  const [encodedPayload, signature] = session.split('.')
  if (!encodedPayload || !signature || !secret) return false

  const expectedSignature = await signValue(encodedPayload, secret)
  if (!secureCompare(signature, expectedSignature)) return false

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as { sub?: string; exp?: number }
    return payload.sub === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export function secureCompare(actual: string, expected: string) {
  const actualBytes = new TextEncoder().encode(actual)
  const expectedBytes = new TextEncoder().encode(expected)
  const length = Math.max(actualBytes.length, expectedBytes.length)
  let result = actualBytes.length ^ expectedBytes.length

  for (let index = 0; index < length; index += 1) {
    result |= (actualBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0)
  }

  return result === 0
}

async function signValue(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return atob(padded)
}
