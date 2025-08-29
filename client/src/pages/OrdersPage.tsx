import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, Truck, MessageCircle } from 'lucide-react'
import { useCreateChatRoom } from '@/hooks/useMessages'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  company?: string
}

interface OrdersPageProps {
  user: User
}

export function OrdersPage({ user }: OrdersPageProps) {
  const createChatRoom = useCreateChatRoom()

  // Chat odası oluştur/getir ve mesajlara yönlendir
  const handleOpenChat = (orderId: string) => {
    const buyerId = user.role === 'BUYER' ? user.id : 'buyer-1'
    const sellerId = user.role === 'SELLER' ? user.id : 'seller-1'

    createChatRoom.mutate({
      orderId,
      buyerId,
      sellerId
    }, {
      onSuccess: () => {
        // Mesajlar sayfasına yönlendir
        window.location.href = '/messages'
      }
    })
  }

  // Demo sipariş verileri
  const demoOrders = [
    {
      id: '1',
      productName: 'Premium Kahve Çekirdekleri',
      quantity: 50,
      unitPrice: 25.00,
      totalPrice: 1250.00,
      status: user.role === 'BUYER' ? 'APPROVED' : 'APPROVED',
      buyerName: 'Ahmet Yılmaz',
      sellerName: 'Mehmet Kaya',
      createdAt: '2024-01-28T10:00:00Z',
      notes: 'Hızlı teslimat isteniyor'
    },
    {
      id: '2',
      productName: 'Organik Zeytinyağı',
      quantity: 25,
      unitPrice: 45.00,
      totalPrice: 1125.00,
      status: 'PENDING',
      buyerName: 'Ahmet Yılmaz',
      sellerName: 'Mehmet Kaya',
      createdAt: '2024-01-28T14:30:00Z',
      notes: ''
    },
    {
      id: '3',
      productName: 'Doğal Bal',
      quantity: 100,
      unitPrice: 15.00,
      totalPrice: 1500.00,
      status: 'SHIPPED',
      buyerName: 'Ahmet Yılmaz',
      sellerName: 'Mehmet Kaya',
      createdAt: '2024-01-27T09:15:00Z',
      notes: 'Özel ambalaj'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'DELIVERED':
        return <Package className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Beklemede</Badge>
      case 'APPROVED':
        return <Badge variant="success">Onaylandı</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Reddedildi</Badge>
      case 'SHIPPED':
        return <Badge variant="default">Kargoda</Badge>
      case 'DELIVERED':
        return <Badge variant="success">Teslim Edildi</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">
            {user.role === 'BUYER' ? 'Verdiğim Siparişler' : 'Aldığım Siparişler'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {demoOrders.length} sipariş
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {demoOrders.map((order) => (
          <Card key={order.id} data-testid={`order-${order.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {order.productName}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
              <CardDescription>
                Sipariş #{order.id} • {formatDate(order.createdAt)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Miktar & Fiyat</div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">{order.quantity} adet</span> × 
                      <span className="font-medium"> ₺{order.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ₺{order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">
                    {user.role === 'BUYER' ? 'Satıcı' : 'Alıcı'}
                  </div>
                  <div className="text-sm">
                    {user.role === 'BUYER' ? order.sellerName : order.buyerName}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {user.role === 'SELLER' && order.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        data-testid={`button-approve-${order.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        data-testid={`button-reject-${order.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  )}
                  
                  {user.role === 'SELLER' && order.status === 'APPROVED' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-ship-${order.id}`}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Kargola
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    data-testid={`button-details-${order.id}`}
                  >
                    Detaylar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenChat(order.id)}
                    disabled={createChatRoom.isPending}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    data-testid={`button-chat-${order.id}`}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {createChatRoom.isPending ? 'Açılıyor...' : 'Mesajlaş'}
                  </Button>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm font-medium text-gray-600 mb-1">Notlar:</div>
                  <div className="text-sm text-gray-800">{order.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {demoOrders.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz sipariş yok
              </h3>
              <p className="text-gray-500">
                {user.role === 'BUYER' 
                  ? 'İlk siparişinizi vermek için ürünlere göz atın.'
                  : 'Müşterilerinizden gelen siparişler burada görünecek.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}