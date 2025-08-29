import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Package, Search, Filter } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products/search', searchQuery, selectedCategory, priceRange[0], priceRange[1], minRating],
    queryFn: async (): Promise<Product[]> => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < 100000) params.set('maxPrice', priceRange[1].toString());
      if (minRating > 0) params.set('minRating', minRating.toString());
      
      const response = await fetch(`/api/products/search?${params}`);
      if (!response.ok) throw new Error('Ürünler yüklenemedi');
      return response.json();
    }
  });

  const categories = [
    { value: "all", label: "Tüm Kategoriler" },
    { value: "elektronik", label: "Elektronik" },
    { value: "giyim", label: "Giyim" },
    { value: "spor", label: "Spor" },
    { value: "gida", label: "Gıda" },
    { value: "icecek", label: "İçecek" },
    { value: "diger", label: "Diğer" }
  ];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(parseFloat(price));
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= numRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Hata</h3>
              <p className="text-gray-600 dark:text-gray-400">Ürünler yüklenirken bir hata oluştu.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ürün Kataloğu
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ürünleri arayın ve filtreleyin
          </p>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  data-testid="input-search"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category" className="w-full lg:w-48">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                data-testid="button-toggle-filters"
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtreler
              </Button>
            </div>

            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fiyat Aralığı: {formatPrice(priceRange[0].toString())} - {formatPrice(priceRange[1].toString())}
                  </label>
                  <Slider
                    data-testid="slider-price"
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={100000}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Puan: {minRating} Yıldız
                  </label>
                  <Slider
                    data-testid="slider-rating"
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Ürün Bulunamadı
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Arama kriterlerinize uygun ürün bulunamadı.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} data-testid={`card-product-${product.id}`} className="group hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <Badge 
                    data-testid={`badge-category-${product.id}`}
                    className="absolute top-2 right-2 bg-blue-600"
                  >
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 data-testid={`text-name-${product.id}`} className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p data-testid={`text-description-${product.id}`} className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(product.rating || "0")}
                    </div>
                    <span data-testid={`text-rating-${product.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.rating || "0"})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span data-testid={`text-price-${product.id}`} className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(product.price)}
                    </span>
                    <Badge data-testid={`badge-stock-${product.id}`} variant="outline">
                      {product.stock || "0"} adet
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {products.length} ürün bulundu
            </p>
          </div>
        )}
    </div>
  );
}