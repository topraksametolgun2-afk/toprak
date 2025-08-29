import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSearchParams } from "@shared/schema";

interface ProductFiltersProps {
  filters: ProductSearchParams;
  onFiltersChange: (filters: Partial<ProductSearchParams>) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: ProductFiltersProps) {
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      minPrice: values[0] || undefined,
      maxPrice: values[1] || undefined,
    });
  };

  const maxPrice = 200000; // Maximum price for slider

  return (
    <Card data-testid="filter-sidebar">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="w-5 h-5 text-primary mr-2" />
          Filtreler
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Kategori</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => onFiltersChange({ category: value === 'all' ? undefined : value })}
          >
            <SelectTrigger data-testid="select-category">
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
              <Label className="text-xs text-muted-foreground">Min Fiyat</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => onFiltersChange({ 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="mt-1"
                data-testid="input-min-price"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max Fiyat</Label>
              <Input
                type="number"
                placeholder="200000"
                value={filters.maxPrice || ''}
                onChange={(e) => onFiltersChange({ 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="mt-1"
                data-testid="input-max-price"
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
              data-testid="slider-price-range"
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
            <SelectTrigger data-testid="select-min-rating">
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
              id="inStock"
              checked={filters.inStock || false}
              onCheckedChange={(checked) => onFiltersChange({ inStock: !!checked })}
              data-testid="checkbox-in-stock"
            />
            <Label htmlFor="inStock" className="text-sm">Sadece Stokta Var</Label>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sıralama</Label>
          <Select
            value={filters.sort || 'newest'}
            onValueChange={(value) => onFiltersChange({ sort: value as any })}
          >
            <SelectTrigger data-testid="select-sort">
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

        {/* Clear Filters */}
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={onClearFilters}
          data-testid="button-clear-filters"
        >
          Filtreleri Temizle
        </Button>
      </CardContent>
    </Card>
  );
}
