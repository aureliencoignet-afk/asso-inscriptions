import { NextResponse } from 'next/server'
import { getSeasons } from '@/lib/actions/seasons'

export async function GET() {
  try {
    const seasons = await getSeasons()
    return NextResponse.json(seasons)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
