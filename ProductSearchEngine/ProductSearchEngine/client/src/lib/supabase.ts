// Since we're using Drizzle directly with Supabase PostgreSQL,
// this file contains utility functions for working with the database
// through our backend API rather than direct Supabase client usage

export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '';

export const apiEndpoints = {
  products: '/api/products',
  categories: '/api/categories',
  product: (id: string) => `/api/products/${id}`,
} as const;

// Utility function to build query strings
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  });
  
  return searchParams.toString();
}

// Utility function for handling API errors
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Beklenmeyen bir hata oluştu';
}
