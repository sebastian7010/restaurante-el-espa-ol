import { afterEach, describe, expect, it } from 'vitest'
import { createAdminSession, secureCompare, verifyAdminSession } from './admin-auth'

const originalPassword = process.env.ADMIN_PASSWORD
const originalSecret = process.env.ADMIN_SESSION_SECRET

afterEach(() => {
  process.env.ADMIN_PASSWORD = originalPassword
  process.env.ADMIN_SESSION_SECRET = originalSecret
})

describe('admin auth', () => {
  it('accepts valid signed sessions and rejects tampered sessions', async () => {
    process.env.ADMIN_PASSWORD = 'test-password'
    process.env.ADMIN_SESSION_SECRET = 'test-session-secret'

    const session = await createAdminSession()
    const tamperedSession = session.replace(/.$/, (last) => (last === 'a' ? 'b' : 'a'))

    expect(await verifyAdminSession(session)).toBe(true)
    expect(await verifyAdminSession(tamperedSession)).toBe(false)
  })

  it('compares secrets without accepting different values', () => {
    expect(secureCompare('same-secret', 'same-secret')).toBe(true)
    expect(secureCompare('same-secret', 'other-secret')).toBe(false)
  })
})
