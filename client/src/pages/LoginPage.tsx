import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  company?: string
}

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (role: 'BUYER' | 'SELLER') => {
    setIsLoading(true)
    
    // Demo kullanıcıları
    const demoUsers = {
      BUYER: {
        id: 'buyer-1',
        email: 'alici@example.com',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        role: 'BUYER' as const,
        company: 'Alıcı Şirket A.Ş.'
      },
      SELLER: {
        id: 'seller-1',
        email: 'toptanci@example.com',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        role: 'SELLER' as const,
        company: 'Toptancı Ltd. Şti.'
      }
    }
    
    setTimeout(() => {
      onLogin(demoUsers[role])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            B2B Marketplace
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bildirim sistemi demo uygulaması
          </p>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Alıcı Olarak Giriş
                <Badge variant="secondary">BUYER</Badge>
              </CardTitle>
              <CardDescription>
                Sipariş verebilir ve bildirimlerinizi takip edebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleLogin('BUYER')}
                disabled={isLoading}
                className="w-full"
                data-testid="login-buyer"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Alıcı Olarak Giriş Yap'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Toptancı Olarak Giriş
                <Badge variant="default">SELLER</Badge>
              </CardTitle>
              <CardDescription>
                Ürün satabilir ve sipariş bildirimlerinizi alabilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleLogin('SELLER')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
                data-testid="login-seller"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Toptancı Olarak Giriş Yap'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Bu bir demo uygulamadır. Gerçek bir giriş sistemi değildir.</p>
        </div>
      </div>
    </div>
  )
}