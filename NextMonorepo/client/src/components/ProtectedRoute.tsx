import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'Toptancı' | 'Alıcı'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setLocation('/login')
        return
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'Toptancı') {
          setLocation('/toptanci-dashboard')
        } else if (userRole === 'Alıcı') {
          setLocation('/alici-dashboard')
        } else {
          setLocation('/login')
        }
        return
      }
    }
  }, [user, userRole, loading, requiredRole, setLocation])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && userRole !== requiredRole) {
    return null
  }

  return <>{children}</>
}