import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, User } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import ProductSearch from "@/components/ProductSearch";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import ProductPagination from "@/components/ProductPagination";
import MobileFilterDrawer from "@/components/MobileFilterDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSearchParams } from "@shared/schema";

export default function ProductsPage() {
  const [location, setLocation] = useLocation();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialFilters: ProductSearchParams = {
    query: urlParams.get('query') || undefined,
    category: urlParams.get('category') || undefined,
    minPrice: urlParams.get('minPrice') ? Number(urlParams.get('minPrice')) : undefined,
    maxPrice: urlParams.get('maxPrice') ? Number(urlParams.get('maxPrice')) : undefined,
    minRating: urlParams.get('minRating') ? Number(urlParams.get('minRating')) : undefined,
    inStock: urlParams.get('inStock') === 'true' ? true : undefined,
    sort: (urlParams.get('sort') as any) || 'newest',
    page: urlParams.get('page') ? Number(urlParams.get('page')) : 1,
    limit: urlParams.get('limit') ? Number(urlParams.get('limit')) : 20,
  };

  const [filters, setFilters] = useState<ProductSearchParams>(initialFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { data: productsData, isLoading, error } = useProducts(filters);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<ProductSearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    
    // Reset to page 1 when filters change (except for pagination)
    if (!newFilters.page) {
      updatedFilters.page = 1;
    }
    
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    
    const newPath = '/urunler' + (params.toString() ? '?' + params.toString() : '');
    setLocation(newPath);
  };

  const clearFilters = () => {
    const clearedFilters: ProductSearchParams = {
      query: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStock: undefined,
      sort: 'newest',
      page: 1,
      limit: filters.limit,
    };
    setFilters(clearedFilters);
    setLocation('/urunler');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary" data-testid="logo">TicaretiPlatform</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-home">
                Ana Sayfa
              </a>
              <a href="#" className="text-foreground font-medium" data-testid="nav-products">
                Ürünler
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-orders">
                Siparişlerim
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-messages">
                Mesajlar
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" data-testid="notifications">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  3
                </Badge>
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center" data-testid="user-avatar">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight" data-testid="page-title">Ürünler</h2>
            <p className="text-muted-foreground mt-2">Geniş ürün yelpazemizi keşfedin ve ihtiyacınıza uygun olanı bulun.</p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <Button 
            className="md:hidden" 
            onClick={() => setIsMobileFilterOpen(true)}
            data-testid="mobile-filter-toggle"
          >
            <i className="fas fa-filter mr-2"></i>
            Filtrele
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <ProductSearch 
            value={filters.query || ''}
            onChange={(query) => updateFilters({ query })}
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    <span data-testid="total-results">{productsData?.total || 0}</span> ürün bulundu
                    {productsData && (
                      <span className="hidden sm:inline">
                        • Sayfa {productsData.page} / {productsData.pages}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sayfa başına:</span>
                <Select
                  value={String(filters.limit || 20)}
                  onValueChange={(value) => updateFilters({ limit: Number(value) })}
                >
                  <SelectTrigger className="w-20" data-testid="items-per-page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12" data-testid="loading-state">
                <div className="loading-spinner w-8 h-8 border-4 border-muted border-t-primary rounded-full"></div>
                <span className="ml-3 text-muted-foreground">Ürünler yükleniyor...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Ürünler yüklenirken bir hata oluştu.</p>
                <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && productsData && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8" data-testid="products-grid">
                  {productsData.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Empty State */}
                {productsData.items.length === 0 && (
                  <div className="text-center py-12" data-testid="empty-state">
                    <p className="text-muted-foreground">Arama kriterlerinize uygun ürün bulunamadı.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={clearFilters}
                      data-testid="clear-filters-button"
                    >
                      Filtreleri Temizle
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {productsData.items.length > 0 && productsData.pages > 1 && (
                  <ProductPagination
                    currentPage={productsData.page}
                    totalPages={productsData.pages}
                    onPageChange={(page) => updateFilters({ page })}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
