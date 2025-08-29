import { useQuery } from "@tanstack/react-query";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ProductSearchParams } from "@shared/schema";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductSearchParams;
  onFiltersChange: (filters: Partial<ProductSearchParams>) => void;
  onClearFilters: () => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters
}: MobileFilterDrawerProps) {
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      minPrice: values[0] || undefined,
      maxPrice: values[1] || undefined,
    });
  };

  const applyFiltersAndClose = () => {
    onClose();
  };

  const clearFiltersAndClose = () => {
    onClearFilters();
    onClose();
  };

  const maxPrice = 200000;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 overflow-y-auto" data-testid="mobile-filter-drawer">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Filter className="w-5 h-5 text-primary mr-2" />
            Filtreler
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Kategori</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => onFiltersChange({ category: value === 'all' ? undefined : value })}
            >
              <SelectTrigger data-testid="mobile-select-category">
                <SelectValue placeholder="Tüm Kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Fiyat Aralığı</Label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFiltersChange({ 
                    minPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="mt-1"
                  data-testid="mobile-input-min-price"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Input
                  type="number"
                  placeholder="200000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFiltersChange({ 
                    maxPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="mt-1"
                  data-testid="mobile-input-max-price"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Slider
                min={0}
                max={maxPrice}
                step={1000}
                value={[filters.minPrice || 0, filters.maxPrice || maxPrice]}
                onValueChange={handlePriceRangeChange}
                className="w-full"
                data-testid="mobile-slider-price-range"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₺0</span>
                <span>₺{maxPrice.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Puan</Label>
            <Select
              value={filters.minRating ? String(filters.minRating) : 'all'}
              onValueChange={(value) => onFiltersChange({ 
                minRating: value === 'all' ? undefined : Number(value) 
              })}
            >
              <SelectTrigger data-testid="mobile-select-min-rating">
                <SelectValue placeholder="Tüm Puanlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Puanlar</SelectItem>
                <SelectItem value="4">4+ Yıldız</SelectItem>
                <SelectItem value="3">3+ Yıldız</SelectItem>
                <SelectItem value="2">2+ Yıldız</SelectItem>
                <SelectItem value="1">1+ Yıldız</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Stok Durumu</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mobile-inStock"
                checked={filters.inStock || false}
                onCheckedChange={(checked) => onFiltersChange({ inStock: !!checked })}
                data-testid="mobile-checkbox-in-stock"
              />
              <Label htmlFor="mobile-inStock" className="text-sm">Sadece Stokta Var</Label>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sıralama</Label>
            <Select
              value={filters.sort || 'newest'}
              onValueChange={(value) => onFiltersChange({ sort: value as any })}
            >
              <SelectTrigger data-testid="mobile-select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price_asc">Fiyat (Düşükten Yükseğe)</SelectItem>
                <SelectItem value="price_desc">Fiyat (Yüksekten Düşüğe)</SelectItem>
                <SelectItem value="rating_desc">En Yüksek Puan</SelectItem>
                <SelectItem value="name_asc">İsim (A-Z)</SelectItem>
                <SelectItem value="stock_desc">Stok Durumu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8 pt-6 border-t">
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={clearFiltersAndClose}
            data-testid="mobile-button-clear-filters"
          >
            Temizle
          </Button>
          <Button 
            className="flex-1"
            onClick={applyFiltersAndClose}
            data-testid="mobile-button-apply-filters"
          >
            Uygula
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
