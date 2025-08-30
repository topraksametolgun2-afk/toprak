import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import ProductPagination from "@/components/ProductPagination";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import type { ProductsResponse, ProductFilters as ProductFiltersType } from "@shared/schema";

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-5 w-full" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse URL parameters on mount and location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const urlFilters: ProductFiltersType = {};

    const query = searchParams.get('query');
    if (query) urlFilters.query = query;

    const category = searchParams.get('category');
    if (category) urlFilters.category = category;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) urlFilters.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) urlFilters.maxPrice = parseFloat(maxPrice);

    const minRating = searchParams.get('minRating');
    if (minRating) urlFilters.minRating = parseFloat(minRating);

    const minStock = searchParams.get('minStock');
    if (minStock) urlFilters.minStock = parseInt(minStock);

    const sort = searchParams.get('sort');
    if (sort && ['price_asc', 'price_desc', 'rating_desc', 'newest', 'popular'].includes(sort)) {
      urlFilters.sort = sort as ProductFiltersType['sort'];
    }

    const page = searchParams.get('page');
    if (page) urlFilters.page = parseInt(page);

    const limit = searchParams.get('limit');
    if (limit) urlFilters.limit = parseInt(limit);

    setFilters(urlFilters);
  }, [location]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<ProductFiltersType>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Reset to page 1 when filters change (except when page is explicitly changed)
    if (!('page' in newFilters)) {
      updatedFilters.page = 1;
    }

    setFilters(updatedFilters);

    // Update URL
    const searchParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const newUrl = searchParams.toString() ? `/urunler?${searchParams.toString()}` : '/urunler';
    setLocation(newUrl);
  };

  const clearFilters = () => {
    setFilters({});
    setLocation('/urunler');
  };

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['/api/products', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/products?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken hata oluştu');
      }
      return response.json();
    },
  });

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  // Get active filter tags
  const getActiveFilterTags = () => {
    const tags: Array<{ key: string; label: string; value: any }> = [];

    if (filters.query) {
      tags.push({ key: 'query', label: `Arama: "${filters.query}"`, value: filters.query });
    }
    if (filters.category) {
      tags.push({ key: 'category', label: `Kategori: ${filters.category}`, value: filters.category });
    }
    if (filters.minPrice) {
      tags.push({ key: 'minPrice', label: `Min: ₺${filters.minPrice}`, value: filters.minPrice });
    }
    if (filters.maxPrice) {
      tags.push({ key: 'maxPrice', label: `Max: ₺${filters.maxPrice}`, value: filters.maxPrice });
    }
    if (filters.minRating) {
      tags.push({ key: 'minRating', label: `Min Puan: ${filters.minRating}`, value: filters.minRating });
    }
    if (filters.minStock) {
      const stockLabel = filters.minStock === 1 ? 'Stokta Var' : filters.minStock === 10 ? 'Bol Stok' : `Min Stok: ${filters.minStock}`;
      tags.push({ key: 'minStock', label: stockLabel, value: filters.minStock });
    }

    return tags;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof ProductFiltersType];
    updateFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Bir hata oluştu</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ürünler</h1>
          <p className="text-muted-foreground">Geniş ürün yelpazemizi keşfedin ve aradığınız ürünü kolayca bulun</p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                className="w-full" 
                data-testid="button-mobile-filters"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtreler
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <div className="py-4">
                <h2 className="text-xl font-semibold text-foreground mb-6">Filtreler</h2>
                <ProductFilters
                  filters={filters}
                  categories={categories}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="lg:w-80">
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Filtreler</h2>
              <ProductFilters
                filters={filters}
                categories={categories}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <p className="text-muted-foreground" data-testid="text-results-count">
                  {isLoading ? 'Yükleniyor...' : `${productsData?.total || 0} ürün bulundu`}
                </p>
                
                {/* Active Filter Tags */}
                {getActiveFilterTags().length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2" data-testid="active-filters">
                    {getActiveFilterTags().map((tag) => (
                      <Badge 
                        key={tag.key} 
                        variant="default" 
                        className="inline-flex items-center"
                        data-testid={`filter-tag-${tag.key}`}
                      >
                        {tag.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 text-current hover:text-current"
                          onClick={() => removeFilter(tag.key)}
                          data-testid={`button-remove-filter-${tag.key}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-foreground font-medium">Sırala:</label>
                <select 
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={filters.sort || ''}
                  onChange={(e) => updateFilters({ sort: e.target.value as ProductFilters['sort'] || undefined })}
                  data-testid="select-sort"
                >
                  <option value="">Varsayılan</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="rating_desc">En Yüksek Puan</option>
                  <option value="newest">En Yeni</option>
                  <option value="popular">En Popüler</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="mb-8">
              {isLoading ? (
                <LoadingSkeleton />
              ) : productsData?.items.length === 0 ? (
                <div className="text-center py-12" data-testid="empty-state">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ürün bulunamadı</h3>
                  <p className="text-muted-foreground mb-4">
                    Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
                  </p>
                  <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                    Filtreleri Temizle
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsData?.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {productsData && productsData.items.length > 0 && (
              <ProductPagination
                currentPage={productsData.page}
                totalPages={productsData.pages}
                totalItems={productsData.total}
                onPageChange={(page: number) => updateFilters({ page })}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
