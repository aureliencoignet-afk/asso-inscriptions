import { NextResponse } from 'next/server'
import { getSubscribers } from '@/lib/actions/subscribers'

export async function GET() {
  try {
    const subscribers = await getSubscribers()
    return NextResponse.json(subscribers)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
