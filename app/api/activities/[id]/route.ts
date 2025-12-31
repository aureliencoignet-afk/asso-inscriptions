import { NextResponse } from 'next/server'
import { getActivityById } from '@/lib/actions/activities'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await getActivityById(params.id)
    return NextResponse.json(activity)
  } catch (error) {
    return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
  }
}
