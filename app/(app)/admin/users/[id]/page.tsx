'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUser, deleteUser, resetUserPassword } from '@/lib/actions/users'
import { ArrowLeft, Trash2, Key, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'lecture' as 'admin' | 'gestionnaire' | 'lecture',
  })

  useEffect(() => {
    import('@/lib/actions/users').then(({ getUserById }) => {
      getUserById(params.id)
        .then(data => {
          setUser(data)
          setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
          })
        })
        .catch(err => setError('Erreur de chargement'))
    })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateUser(params.id, formData)
      router.push('/admin/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir SUPPRIMER définitivement cet utilisateur ?')) return
    
    try {
      await deleteUser(params.id)
      router.push('/admin/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetUserPassword(params.id, newPassword)
      setShowPasswordReset(false)
      setNewPassword('')
      alert('Mot de passe réinitialisé avec succès')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-muted-foreground mt-2">{user.email}</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">ID</p>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rôle actuel</p>
              <p className="font-medium">
                {user.role === 'admin' ? 'Administrateur' :
                 user.role === 'gestionnaire' ? 'Gestionnaire' : 'Lecture seule'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Créé le</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Modifier l'utilisateur</CardTitle>
          <CardDescription>
            Modifiez les informations de l'utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Rôle *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="lecture">Lecture seule</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card>
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Définissez un nouveau mot de passe pour cet utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordReset ? (
            <Button variant="outline" onClick={() => setShowPasswordReset(true)}>
              <Key className="mr-2 h-4 w-4" />
              Réinitialiser le mot de passe
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleResetPassword} disabled={loading}>
                  Confirmer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordReset(false)
                    setNewPassword('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zone de danger</CardTitle>
          <CardDescription>
            La suppression d'un utilisateur est définitive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer l'utilisateur
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
