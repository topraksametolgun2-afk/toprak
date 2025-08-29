import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  product_id: string
  buyer_id: string
  seller_id: string
  quantity: number
  status: 'Beklemede' | 'Hazırlanıyor' | 'Teslim Edildi'
  created_at: string
}

interface OrderWithDetails extends Order {
  product_name?: string
  product_price?: number
  buyer_email?: string
}

export default function OrdersPage() {
  const { user, userRole, signOut } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: 'Çıkış Yapıldı',
      description: 'Başarıyla çıkış yaptınız.',
    })
  }

  const goToDashboard = () => {
    if (userRole === 'Toptancı') {
      setLocation('/toptanci-dashboard')
    } else if (userRole === 'Alıcı') {
      setLocation('/alici-dashboard')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [userRole])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      if (userRole === 'Toptancı') {
        // Toptancı kendi ürünlerine gelen siparişleri görür
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            products!inner (
              name,
              price
            ),
            profiles!buyer_id (
              email
            )
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        const ordersWithDetails = data?.map(order => ({
          ...order,
          product_name: order.products?.name,
          product_price: order.products?.price,
          buyer_email: order.profiles?.email
        })) || []
        
        setOrders(ordersWithDetails)
      } else if (userRole === 'Alıcı') {
        // Alıcı kendi verdiği siparişleri görür
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            products!inner (
              name,
              price
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        const ordersWithDetails = data?.map(order => ({
          ...order,
          product_name: order.products?.name,
          product_price: order.products?.price
        })) || []
        
        setOrders(ordersWithDetails)
      }
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Siparişler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: 'Beklemede' | 'Hazırlanıyor' | 'Teslim Edildi') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Başarılı',
        description: 'Sipariş durumu güncellendi.',
      })

      fetchOrders()
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Sipariş durumu güncellenirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Beklemede':
        return 'warning'
      case 'Hazırlanıyor':
        return 'default'
      case 'Teslim Edildi':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={goToDashboard}
                data-testid="button-back-dashboard"
              >
                ← Geri
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-lg">📋</span>
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  {userRole === 'Toptancı' ? 'Gelen Siparişler' : 'Siparişlerim'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {userRole === 'Toptancı' ? 'Gelen Siparişler' : 'Siparişlerim'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'Toptancı' 
              ? 'Ürünlerinize gelen siparişleri görüntüleyin ve durumlarını güncelleyin.'
              : 'Verdiğiniz siparişleri takip edin.'
            }
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">
                {userRole === 'Toptancı' ? 'Henüz sipariş yok' : 'Henüz sipariş vermediniz'}
              </h3>
              <p className="text-muted-foreground text-center">
                {userRole === 'Toptancı' 
                  ? 'Ürünlerinize sipariş geldiğinde burada görüntüleyebilirsiniz.'
                  : 'Ürünler sayfasından sipariş verebilirsiniz.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`order-card-${order.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" data-testid={`order-product-${order.id}`}>
                          {order.product_name}
                        </h3>
                        <Badge 
                          variant={getStatusColor(order.status) as any}
                          data-testid={`order-status-${order.id}`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Adet:</span>
                          <p className="font-medium" data-testid={`order-quantity-${order.id}`}>
                            {order.quantity}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Birim Fiyat:</span>
                          <p className="font-medium" data-testid={`order-price-${order.id}`}>
                            ₺{order.product_price?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Toplam:</span>
                          <p className="font-medium text-primary" data-testid={`order-total-${order.id}`}>
                            ₺{((order.product_price || 0) * order.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tarih:</span>
                          <p className="font-medium" data-testid={`order-date-${order.id}`}>
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>

                      {userRole === 'Toptancı' && order.buyer_email && (
                        <div className="mt-2">
                          <span className="text-muted-foreground text-sm">Alıcı: </span>
                          <span className="text-sm font-medium" data-testid={`order-buyer-${order.id}`}>
                            {order.buyer_email}
                          </span>
                        </div>
                      )}
                    </div>

                    {userRole === 'Toptancı' && order.status !== 'Teslim Edildi' && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Durumu Güncelle:</span>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value as any)}
                        >
                          <SelectTrigger className="w-full md:w-40" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beklemede">Beklemede</SelectItem>
                            <SelectItem value="Hazırlanıyor">Hazırlanıyor</SelectItem>
                            <SelectItem value="Teslim Edildi">Teslim Edildi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}