import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import { StarRating } from "@/components/star-rating";
import { Search, Package, Filter, ArrowRight } from "lucide-react";
import { authService } from "@/lib/auth";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string | null;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products', {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ürünler getirilemedi');
      return response.json();
    }
  });

  // Kategorileri çıkar
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))];

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;
  };

  const getCategoryDisplayName = (category: string) => {
    if (category === "all") return "Tüm Kategoriler";
    return category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Ürünlerimiz</h1>
          <p className="text-lg text-muted-foreground">
            Kaliteli hizmetlerimizi keşfedin ve müşteri deneyimlerimizi okuyun
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="select-category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Ürün bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" 
                ? "Arama kriterlerinizi değiştirerek tekrar deneyin."
                : "Henüz ürün eklenmemiş."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
                <CardContent className="p-6">
                  {/* Product Image Placeholder */}
                  <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>

                  {/* Category Badge */}
                  {product.category && (
                    <Badge variant="secondary" className="mb-3">
                      {product.category}
                    </Badge>
                  )}

                  {/* Product Info */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="mb-4">
                    <StarRating 
                      rating={product.averageRating}
                      showText
                      reviewCount={product.reviewCount}
                      size="sm"
                    />
                  </div>

                  {/* Price */}
                  <div className="text-xl font-bold text-primary mb-4">
                    {formatPrice(product.price)}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Link href={`/urunler/${product.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors" data-testid={`button-view-product-${product.id}`}>
                      Detay Görüntüle
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}