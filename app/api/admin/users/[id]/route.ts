import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/actions/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getProfile()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission admin requise' },
        { status: 403 }
      )
    }

    if (params.id === profile.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient.auth.admin.deleteUser(params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getProfile()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission admin requise' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, password } = body

    if (action === 'reset_password') {
      if (!password || password.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }

      const adminClient = createAdminClient()

      const { error } = await adminClient.auth.admin.updateUserById(params.id, {
        password,
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
