import { NextResponse } from 'next/server'
import { getHouseholds } from '@/lib/actions/households'

export async function GET() {
  try {
    const households = await getHouseholds()
    return NextResponse.json(households)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
