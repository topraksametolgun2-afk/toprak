import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, X, TrendingUp, Star, Tag } from "lucide-react";
import type { ProductFilters as ProductFiltersType } from "@shared/schema";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  categories: string[];
  onFiltersChange: (filters: Partial<ProductFiltersType>) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({ 
  filters, 
  categories, 
  onFiltersChange, 
  onClearFilters 
}: ProductFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.query || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ query: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onFiltersChange]);

  // Update local search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.query || '');
  }, [filters.query]);

  return (
    <div className="space-y-6">
      {/* Search Filter */}
      <div>
        <Label htmlFor="search-input" className="text-sm font-medium text-foreground mb-2 block">
          <Search className="inline h-4 w-4 mr-2" />
          Ürün Ara
        </Label>
        <div className="relative">
          <Input
            id="search-input"
            type="text"
            placeholder="Ürün adı veya açıklama ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchValue('')}
              data-testid="button-clear-search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">Kategori</Label>
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
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Fiyat Aralığı</Label>
        <div className="space-y-4">
          {/* Price Slider */}
          <div className="px-2">
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || 20000]}
              onValueChange={([min, max]) => {
                onFiltersChange({ 
                  minPrice: min > 0 ? min : undefined,
                  maxPrice: max < 20000 ? max : undefined
                });
              }}
              max={20000}
              min={0}
              step={50}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>₺0</span>
              <span>₺20.000</span>
            </div>
          </div>
          
          {/* Price Input Fields */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min ₺"
                value={filters.minPrice || ''}
                onChange={(e) => onFiltersChange({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                data-testid="input-min-price"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max ₺"
                value={filters.maxPrice || ''}
                onChange={(e) => onFiltersChange({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                data-testid="input-max-price"
              />
            </div>
          </div>
          
          {/* Current Range Display */}
          <div className="text-center text-sm text-muted-foreground">
            {(filters.minPrice || filters.maxPrice) && (
              <span>
                {filters.minPrice ? `₺${filters.minPrice.toLocaleString('tr-TR')}` : '₺0'} - {filters.maxPrice ? `₺${filters.maxPrice.toLocaleString('tr-TR')}` : '₺20.000+'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Minimum Puan: {filters.minRating ? `${filters.minRating} ve üzeri` : 'Tüm puanlar'}
        </Label>
        
        {/* Rating Slider */}
        <div className="px-2 mb-4">
          <Slider
            value={[filters.minRating || 0]}
            onValueChange={([rating]) => {
              onFiltersChange({ minRating: rating > 0 ? rating : undefined });
            }}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
            data-testid="slider-rating"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        
        {/* Quick Rating Options */}
        <RadioGroup 
          value={filters.minRating?.toString() || ''} 
          onValueChange={(value) => onFiltersChange({ minRating: value ? parseFloat(value) : undefined })}
          data-testid="radio-group-rating"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="rating-4" />
            <Label htmlFor="rating-4" className="flex items-center cursor-pointer">
              <div className="flex text-yellow-400 mr-2 text-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                <span className="text-gray-300">★</span>
              </div>
              <span className="text-sm text-foreground">4 ve üzeri</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="rating-3" />
            <Label htmlFor="rating-3" className="flex items-center cursor-pointer">
              <div className="flex text-yellow-400 mr-2 text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={i} className="text-gray-300">★</span>
                ))}
              </div>
              <span className="text-sm text-foreground">3 ve üzeri</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="rating-all" />
            <Label htmlFor="rating-all" className="text-sm text-foreground cursor-pointer ml-6">
              Tüm puanlar
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Stock Filter */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          <TrendingUp className="inline h-4 w-4 mr-2" />
          Stok Durumu
        </Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filters.minStock === undefined ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFiltersChange({ minStock: undefined })}
              data-testid="badge-stock-all"
            >
              Tümü
            </Badge>
            <Badge 
              variant={filters.minStock === 1 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFiltersChange({ minStock: 1 })}
              data-testid="badge-stock-available"
            >
              Stokta Var
            </Badge>
            <Badge 
              variant={filters.minStock === 10 ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFiltersChange({ minStock: 10 })}
              data-testid="badge-stock-plenty"
            >
              Bol Stok
            </Badge>
          </div>
        </div>
      </div>

      {/* Advanced Sorting */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          <Tag className="inline h-4 w-4 mr-2" />
          Sıralama
        </Label>
        <Select 
          value={filters.sort || 'default'} 
          onValueChange={(value) => onFiltersChange({ sort: value === 'default' ? undefined : value as ProductFiltersType['sort'] })}
        >
          <SelectTrigger data-testid="select-sort-filters">
            <SelectValue placeholder="Varsayılan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Varsayılan</SelectItem>
            <SelectItem value="price_asc">Fiyat: Düşükten Yükseğe</SelectItem>
            <SelectItem value="price_desc">Fiyat: Yüksekten Düşüğe</SelectItem>
            <SelectItem value="rating_desc">En Yüksek Puan</SelectItem>
            <SelectItem value="newest">En Yeni Ürünler</SelectItem>
            <SelectItem value="popular">En Popüler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onClearFilters}
        data-testid="button-clear-filters"
      >
        <X className="mr-2 h-4 w-4" />
        Filtreleri Temizle
      </Button>
    </div>
  );
}
