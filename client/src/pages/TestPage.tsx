import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, AlertCircle, CheckCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  company?: string
}

interface TestPageProps {
  user: User
}

export function TestPage({ user }: TestPageProps) {
  const [isCreatingNotification, setIsCreatingNotification] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

  const createTestNotification = async () => {
    setIsCreatingNotification(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (response.ok) {
        setLastResult({
          success: true,
          message: `Test bildirimi başarıyla oluşturuldu: ${result.notification?.title}`,
        })
      } else {
        setLastResult({
          success: false,
          message: result.error || 'Test bildirimi oluşturulamadı',
        })
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Bağlantı hatası: ' + (error as Error).message,
      })
    } finally {
      setIsCreatingNotification(false)
    }
  }

  const simulateOrderFlow = async (action: string) => {
    setIsCreatingNotification(true)
    setLastResult(null)

    const buyerId = user.role === 'BUYER' ? user.id : 'buyer-1'
    const sellerId = user.role === 'SELLER' ? user.id : 'seller-1'

    try {
      const response = await fetch('/api/notifications/demo/simulate-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buyerId, sellerId, action }),
      })

      const result = await response.json()

      if (response.ok) {
        setLastResult({
          success: true,
          message: `${action} bildirimi başarıyla oluşturuldu`,
        })
      } else {
        setLastResult({
          success: false,
          message: result.error || 'Simülasyon başarısız',
        })
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Bağlantı hatası: ' + (error as Error).message,
      })
    } finally {
      setIsCreatingNotification(false)
    }
  }

  return (
    <div className="space-y-6" data-testid="test-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Bildirim Sistemi Testi</h1>
        </div>
        <Badge variant="outline">
          Demo Modu
        </Badge>
      </div>

      {/* Sonuç Mesajı */}
      {lastResult && (
        <Card className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {lastResult.success ? 'Başarılı!' : 'Hata!'}
                </p>
                <p className={`text-sm mt-1 ${lastResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {lastResult.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Butonları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genel Test */}
        <Card>
          <CardHeader>
            <CardTitle>Genel Bildirim Testi</CardTitle>
            <CardDescription>
              Rastgele bir test bildirimi oluştur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createTestNotification}
              disabled={isCreatingNotification}
              className="w-full"
              data-testid="button-test-notification"
            >
              <Send className="h-4 w-4 mr-2" />
              {isCreatingNotification ? 'Oluşturuluyor...' : 'Test Bildirimi Oluştur'}
            </Button>
          </CardContent>
        </Card>

        {/* Sipariş Simülasyonları */}
        <Card>
          <CardHeader>
            <CardTitle>Sipariş İşlem Simülasyonları</CardTitle>
            <CardDescription>
              Farklı sipariş durumları için bildirim oluştur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role === 'SELLER' ? (
              <Button
                onClick={() => simulateOrderFlow('ORDER_PLACED')}
                disabled={isCreatingNotification}
                className="w-full"
                variant="outline"
                data-testid="button-simulate-order-placed"
              >
                🛒 Yeni Sipariş Simülasyonu
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => simulateOrderFlow('ORDER_APPROVED')}
                  disabled={isCreatingNotification}
                  className="w-full"
                  variant="outline"
                  data-testid="button-simulate-order-approved"
                >
                  ✅ Sipariş Onay Simülasyonu
                </Button>
                <Button
                  onClick={() => simulateOrderFlow('ORDER_SHIPPED')}
                  disabled={isCreatingNotification}
                  className="w-full"
                  variant="outline"
                  data-testid="button-simulate-order-shipped"
                >
                  🚚 Kargo Simülasyonu
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bilgi Kartı */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Kullanıcı Bilgileri</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Ad:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Rol:</strong> {user.role === 'BUYER' ? 'Alıcı' : 'Toptancı'}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Şirket:</strong> {user.company}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Test Özellikleri</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Bildirimler anlık olarak oluşturulur</p>
                  <p>• Email simülasyonu (console'da görünür)</p>
                  <p>• Farklı bildirim türleri desteklenir</p>
                  <p>• Rol bazlı bildirimler</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>İpucu:</strong> Test bildirimlerini oluşturduktan sonra "Bildirimler" sayfasına giderek 
                sonuçları görebilir, bildirimlerinizi okudun olarak işaretleyebilir ve sistemin nasıl çalıştığını test edebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}