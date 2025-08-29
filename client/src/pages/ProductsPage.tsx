import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus, ShoppingCart, Star } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  company?: string
}

interface ProductsPageProps {
  user: User
}

export function ProductsPage({ user }: ProductsPageProps) {
  // Demo ürün verileri
  const demoProducts = [
    {
      id: '1',
      name: 'Premium Kahve Çekirdekleri',
      description: 'Özel seçilmiş Arabica kahve çekirdekleri. Orta kavrum.',
      category: 'Gıda',
      price: 25.00,
      stock: 500,
      minOrderQuantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop&crop=center',
      seller: {
        id: 'seller-1',
        company: 'Kahve Dünyası Ltd.',
        firstName: 'Mehmet',
        lastName: 'Kaya'
      }
    },
    {
      id: '2',
      name: 'Organik Zeytinyağı',
      description: 'Soğuk sıkım, filtre edilmemiş organik zeytinyağı.',
      category: 'Gıda',
      price: 45.00,
      stock: 200,
      minOrderQuantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop&crop=center',
      seller: {
        id: 'seller-2',
        company: 'Ege Zeytinyağı A.Ş.',
        firstName: 'Ayşe',
        lastName: 'Demir'
      }
    },
    {
      id: '3',
      name: 'Doğal Çiçek Balı',
      description: 'Katkısız, doğal çiçek balı. Cam kavanozda.',
      category: 'Gıda',
      price: 15.00,
      stock: 1000,
      minOrderQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop&crop=center',
      seller: {
        id: 'seller-3',
        company: 'Anadolu Arı Ürünleri',
        firstName: 'Mustafa',
        lastName: 'Yıldız'
      }
    },
    {
      id: '4',
      name: 'Antep Fıstığı',
      description: 'Kabuklu, taze Antep fıstığı. Premium kalite.',
      category: 'Gıda',
      price: 120.00,
      stock: 150,
      minOrderQuantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop&crop=center',
      seller: {
        id: 'seller-4',
        company: 'Güneydoğu Kuruyemiş',
        firstName: 'Ali',
        lastName: 'Çelik'
      }
    }
  ]

  return (
    <div className="space-y-6" data-testid="products-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Ürünler</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {user.role === 'SELLER' && (
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ürün
            </Button>
          )}
          
          <Badge variant="secondary">
            {demoProducts.length} ürün
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoProducts.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-lg transition-shadow"
            data-testid={`product-${product.id}`}
          >
            <CardHeader className="p-0">
              <div className="aspect-video w-full bg-gray-100 rounded-t-lg overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <CardTitle className="text-lg line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {product.description}
                  </CardDescription>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500">4.8</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      ₺{product.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Min: {product.minOrderQuantity} adet
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Stok: <span className="font-medium">{product.stock} adet</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500 mb-2">
                    Satıcı: <span className="font-medium">{product.seller.company}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {user.role === 'BUYER' ? (
                      <Button 
                        className="flex-1"
                        data-testid={`button-order-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Sipariş Ver
                      </Button>
                    ) : product.seller.id === user.id ? (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        data-testid={`button-edit-${product.id}`}
                      >
                        Düzenle
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        disabled
                      >
                        Başka Satıcı
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-details-${product.id}`}
                    >
                      Detaylar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {demoProducts.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz ürün yok
              </h3>
              <p className="text-gray-500">
                {user.role === 'SELLER' 
                  ? 'İlk ürününüzü eklemek için "Yeni Ürün" butonunu kullanın.'
                  : 'Satıcılar tarafından eklenen ürünler burada görünecek.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}