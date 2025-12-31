import { NextResponse } from 'next/server'
import { getActivities } from '@/lib/actions/activities'

export async function GET() {
  try {
    const activities = await getActivities()
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
