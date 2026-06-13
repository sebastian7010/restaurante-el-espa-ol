import { beforeEach, describe, expect, it } from 'vitest'
import { getRatings, saveRating } from './ratings-store'

describe('ratings store', () => {
  beforeEach(() => {
    delete (globalThis as typeof globalThis & { __rinconcitoRatings?: unknown }).__rinconcitoRatings
  })

  it('stores shared rating stats for products', async () => {
    await saveRating('mora', 5)
    await saveRating('mora', 3)

    const ratings = await getRatings()
    expect(ratings.mora).toMatchObject({ count: 2, average: 4 })
  })

  it('updates a previous vote without increasing the shared count', async () => {
    await saveRating('mora', 5)
    await saveRating('mora', 1, 5)

    const ratings = await getRatings()
    expect(ratings.mora).toMatchObject({ count: 1, average: 1 })
  })
})
