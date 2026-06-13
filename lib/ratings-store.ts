export type RatingStats = {
  average: number
  count: number
  sum: number
}

type RatingStore = Record<string, RatingStats>

const STORE_KEY = 'rinconcito-menu-ratings'
const memoryStore = globalThis as typeof globalThis & { __rinconcitoRatings?: RatingStore }

export async function getRatings() {
  return readStore()
}

export async function saveRating(itemId: string, rating: number, previousRating?: number) {
  const store = await readStore()
  const current = store[itemId] ?? { average: 0, count: 0, sum: 0 }
  const hasPreviousRating = typeof previousRating === 'number' && previousRating >= 1 && previousRating <= 5 && current.count > 0
  const nextSum = Math.max(0, current.sum - (hasPreviousRating ? previousRating : 0) + rating)
  const nextCount = hasPreviousRating ? current.count : current.count + 1
  const nextStats = normalizeStats({ sum: nextSum, count: nextCount, average: nextSum / nextCount })
  const nextStore = { ...store, [itemId]: nextStats }

  await writeStore(nextStore)
  return nextStats
}

function normalizeStats(stats: RatingStats): RatingStats {
  const count = Math.max(0, Math.round(stats.count || 0))
  const sum = Math.max(0, Number(stats.sum || 0))

  return {
    count,
    sum,
    average: count > 0 ? Number((sum / count).toFixed(2)) : 0
  }
}

async function readStore(): Promise<RatingStore> {
  const remoteStore = await readRemoteStore()
  if (remoteStore) return remoteStore

  memoryStore.__rinconcitoRatings ??= {}
  return memoryStore.__rinconcitoRatings
}

async function writeStore(store: RatingStore) {
  if (await writeRemoteStore(store)) return
  memoryStore.__rinconcitoRatings = store
}

async function readRemoteStore() {
  const client = getRedisClient()
  if (!client) return null

  try {
    const response = await redisCommand(client, ['GET', STORE_KEY])
    if (!response.result || typeof response.result !== 'string') return {}
    return JSON.parse(response.result) as RatingStore
  } catch {
    return null
  }
}

async function writeRemoteStore(store: RatingStore) {
  const client = getRedisClient()
  if (!client) return false

  try {
    await redisCommand(client, ['SET', STORE_KEY, JSON.stringify(store)])
    return true
  } catch {
    return false
  }
}

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null
  return { url, token }
}

async function redisCommand(client: { url: string; token: string }, command: string[]) {
  const response = await fetch(client.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${client.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command),
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Redis command failed: ${response.status}`)
  return response.json() as Promise<{ result?: unknown; error?: string }>
}
