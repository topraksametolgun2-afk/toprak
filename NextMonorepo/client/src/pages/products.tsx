import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image_url: string
  created_by: string
  created_at: string
}

interface ProductWithSupplier extends Product {
  supplier_email?: string
}

export default function ProductsPage() {
  const { user, userRole, signOut } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const [products, setProducts] = useState<ProductWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    image_url: ''
  })
  const [orderQuantity, setOrderQuantity] = useState<{[key: string]: number}>({})
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSupplier | null>(null)

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
    fetchProducts()
  }, [userRole])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      if (userRole === 'Toptancı') {
        // Toptancı sadece kendi ürünlerini görür
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('created_by', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } else if (userRole === 'Alıcı') {
        // Alıcı tüm ürünleri görür, toptancı bilgileriyle birlikte
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            profiles!created_by (
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        const productsWithSupplier = data?.map(product => ({
          ...product,
          supplier_email: product.profiles?.email
        })) || []
        
        setProducts(productsWithSupplier)
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Ürünler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          image_url: formData.image_url || 'https://via.placeholder.com/300x200',
          created_by: user?.id!
        })

      if (error) throw error

      toast({
        title: 'Başarılı',
        description: 'Ürün başarıyla eklendi.',
      })

      setIsAddModalOpen(false)
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        image_url: ''
      })
      fetchProducts()
    } catch (error) {
      console.error('Ürün eklenirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Ürün eklenirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast({
        title: 'Başarılı',
        description: 'Ürün başarıyla silindi.',
      })

      fetchProducts()
    } catch (error) {
      console.error('Ürün silinirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Ürün silinirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  const handleOrderProduct = (product: ProductWithSupplier) => {
    setSelectedProduct(product)
    setOrderQuantity({...orderQuantity, [product.id]: 1})
    setIsOrderModalOpen(true)
  }

  const handlePlaceOrder = async () => {
    if (!selectedProduct || !user) return

    const quantity = orderQuantity[selectedProduct.id] || 1

    if (quantity <= 0) {
      toast({
        title: 'Hata',
        description: 'Sipariş adedi 1 veya daha fazla olmalıdır.',
        variant: 'destructive',
      })
      return
    }

    if (quantity > selectedProduct.stock) {
      toast({
        title: 'Hata',
        description: 'Yeterli stok bulunmamaktadır.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          product_id: selectedProduct.id,
          buyer_id: user.id,
          seller_id: selectedProduct.created_by,
          quantity: quantity,
          status: 'Beklemede'
        })

      if (error) throw error

      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: selectedProduct.stock - quantity })
        .eq('id', selectedProduct.id)

      if (stockError) throw stockError

      toast({
        title: 'Sipariş Alındı',
        description: 'Siparişiniz başarıyla alınmıştır. Toptancı en kısa sürede hazırlamaya başlayacaktır.',
      })

      setIsOrderModalOpen(false)
      setSelectedProduct(null)
      fetchProducts() // Refresh to show updated stock
    } catch (error) {
      console.error('Sipariş verilirken hata:', error)
      toast({
        title: 'Hata',
        description: 'Sipariş verilirken bir hata oluştu.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ürünler yükleniyor...</p>
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
                  <span className="text-primary-foreground text-lg">📦</span>
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  {userRole === 'Toptancı' ? 'Ürün Yönetimi' : 'Ürünler'}
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {userRole === 'Toptancı' ? 'Ürünlerim' : 'Tüm Ürünler'}
        </h2>
        
        {userRole === 'Toptancı' && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-product">
                <span className="mr-2">+</span>
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <DialogDescription>
                  Yeni ürün bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ürün Adı *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ürün adını girin"
                      required
                      data-testid="input-product-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Kategori girin"
                      required
                      data-testid="input-product-category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Fiyat (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                      data-testid="input-product-price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok Adedi *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="0"
                      required
                      data-testid="input-product-stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Resim URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-product-image"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" data-testid="button-save-product">
                    Ürün Ekle
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium mb-2">
              {userRole === 'Toptancı' ? 'Henüz ürün eklenmemiş' : 'Henüz hiç ürün yok'}
            </h3>
            <p className="text-muted-foreground text-center">
              {userRole === 'Toptancı' 
                ? 'İlk ürününüzü eklemek için yukarıdaki "Ürün Ekle" butonunu kullanın.'
                : 'Toptancılar henüz ürün eklememiş.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden" data-testid={`product-card-${product.id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Resim+Yok'
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2" data-testid={`product-category-${product.id}`}>
                  {product.category}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-primary" data-testid={`product-price-${product.id}`}>
                    ₺{product.price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${product.stock > 0 ? 'text-success' : 'text-destructive'}`} data-testid={`product-stock-${product.id}`}>
                    Stok: {product.stock}
                  </span>
                </div>
                
                {userRole === 'Alıcı' && product.supplier_email && (
                  <p className="text-xs text-muted-foreground mb-3" data-testid={`product-supplier-${product.id}`}>
                    Satıcı: {product.supplier_email}
                  </p>
                )}

                {userRole === 'Toptancı' && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      data-testid={`button-edit-${product.id}`}
                    >
                      Düzenle
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteProduct(product.id)}
                      data-testid={`button-delete-${product.id}`}
                    >
                      Sil
                    </Button>
                  </div>
                )}

                {userRole === 'Alıcı' && product.stock > 0 && (
                  <Button 
                    className="w-full mt-3" 
                    onClick={() => handleOrderProduct(product)}
                    data-testid={`button-order-${product.id}`}
                  >
                    Sipariş Ver
                  </Button>
                )}

                {userRole === 'Alıcı' && product.stock === 0 && (
                  <Button 
                    className="w-full mt-3" 
                    disabled
                    data-testid={`button-out-of-stock-${product.id}`}
                  >
                    Stokta Yok
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sipariş Ver</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} için sipariş adetini belirleyin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
                <p className="text-lg font-bold text-primary">₺{selectedProduct.price.toFixed(2)}</p>
                <p className="text-sm">Mevcut Stok: {selectedProduct.stock}</p>
              </div>
              
              <div>
                <Label htmlFor="quantity">Sipariş Adedi</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={orderQuantity[selectedProduct.id] || 1}
                  onChange={(e) => setOrderQuantity({
                    ...orderQuantity,
                    [selectedProduct.id]: parseInt(e.target.value) || 1
                  })}
                  data-testid="input-order-quantity"
                />
              </div>
              
              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>Toplam Tutar:</span>
                  <span className="font-bold">
                    ₺{((orderQuantity[selectedProduct.id] || 1) * selectedProduct.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handlePlaceOrder} data-testid="button-confirm-order">
              Sipariş Ver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  )
}