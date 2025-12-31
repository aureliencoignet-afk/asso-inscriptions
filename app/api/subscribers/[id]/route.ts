import { NextResponse } from 'next/server'
import { getSubscriberById } from '@/lib/actions/subscribers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subscriber = await getSubscriberById(params.id)
    return NextResponse.json(subscriber)
  } catch (error) {
    return NextResponse.json({ error: 'Abonné non trouvé' }, { status: 404 })
  }
}
