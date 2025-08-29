import { useQuery } from "@tanstack/react-query";
import type { ProductSearchParams, ProductSearchResponse } from "@shared/schema";

export function useProducts(params: ProductSearchParams) {
  return useQuery<ProductSearchResponse>({
    queryKey: ['/api/products', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      
      const response = await fetch(`/api/products?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: true,
  });
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ['/api/categories'],
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['/api/products', id],
    enabled: !!id,
  });
}
