import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/actions/auth'

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur actuel est admin
    const profile = await getProfile()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission admin requise' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, first_name, last_name, role } = body

    // Validation
    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Utiliser le client admin pour créer l'utilisateur
    const adminClient = createAdminClient()

    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // 2. Créer le profil
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role,
        association_id: profile.association_id,
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Rollback: supprimer l'utilisateur auth si la création du profil échoue
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role,
      }
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}
