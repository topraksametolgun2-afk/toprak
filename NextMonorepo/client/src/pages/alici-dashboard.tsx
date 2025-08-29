import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AliciDashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: 'Çıkış Yapıldı',
      description: 'Başarıyla çıkış yaptınız.',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-lg">🛒</span>
                </div>
                <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                  Alıcı Paneli
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Hoş geldiniz, {user?.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                data-testid="button-logout"
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm">🛒</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Alıcı Dashboard</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Alıcı olarak ürünleri inceleyebilir, sipariş verebilir ve satın alma işlemlerinizi takip edebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary font-medium">
                Alıcı
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success/20 text-success font-medium">
                Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card data-testid="browse-products-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">🔍</span>
                Ürün Arama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Mevcut ürünleri inceleyin ve ihtiyacınız olanları bulun.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setLocation('/products')}
                data-testid="button-browse-products"
              >
                Ürünlere Göz At
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="my-orders-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">📦</span>
                Siparişlerim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Verdiğiniz siparişleri görüntüleyin ve durumlarını takip edin.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setLocation('/orders')}
                data-testid="button-view-my-orders"
              >
                Siparişlerimi Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="favorites-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">❤️</span>
                Favorilerim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Beğendiğiniz ürünleri kaydedin ve kolayca erişin.
              </p>
              <Button variant="secondary" className="w-full">
                Favorileri Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}