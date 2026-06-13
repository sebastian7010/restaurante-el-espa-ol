import { NextRequest, NextResponse } from 'next/server'
import { getRatings, saveRating } from '@/lib/ratings-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ratings = await getRatings()
  return NextResponse.json({ ratings })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { itemId?: string; rating?: number; previousRating?: number }
    const itemId = body.itemId?.trim()
    const rating = Number(body.rating)
    const previousRating = typeof body.previousRating === 'number' ? Number(body.previousRating) : undefined

    if (!itemId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating payload.' }, { status: 400 })
    }

    const stats = await saveRating(itemId, rating, previousRating)
    return NextResponse.json({ itemId, stats })
  } catch {
    return NextResponse.json({ error: 'Unable to save rating.' }, { status: 500 })
  }
}
