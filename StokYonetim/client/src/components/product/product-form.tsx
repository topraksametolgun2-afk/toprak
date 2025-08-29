import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category, ProductWithInventory } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  price: z.string().min(1, "Fiyat gerekli").regex(/^\d+(\.\d{1,2})?$/, "Geçerli bir fiyat girin"),
  sku: z.string().min(1, "SKU gerekli"),
  categoryId: z.string().min(1, "Kategori seçin"),
  imageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  currentStock: z.number().int().min(0, "Stok negatif olamaz"),
  criticalLevel: z.number().int().min(0, "Kritik seviye negatif olamaz"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: ProductWithInventory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || "",
      price: product.price,
      sku: product.sku,
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
      currentStock: product.inventory.currentStock,
      criticalLevel: product.inventory.criticalLevel,
    } : {
      name: "",
      description: "",
      price: "",
      sku: "",
      categoryId: "",
      imageUrl: "",
      currentStock: 0,
      criticalLevel: 10,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        sku: data.sku,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || null,
        isActive: true,
      };
      
      const inventoryData = {
        currentStock: data.currentStock,
        criticalLevel: data.criticalLevel,
        reservedStock: 0,
      };

      const response = await apiRequest("POST", "/api/products", {
        product: productData,
        inventory: inventoryData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Ürün eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        sku: data.sku,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || null,
      };

      const response = await apiRequest("PATCH", `/api/products/${product!.id}`, productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Ürün güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (product) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Card data-testid="form-product">
      <CardHeader>
        <CardTitle>
          {product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ürün Bilgileri</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ürün Adı *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (₺) *</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="0.00" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="PROD-001" data-testid="input-sku" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resim URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Inventory Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stok Bilgileri</h3>
                
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mevcut Stok *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-current-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="criticalLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kritik Stok Seviyesi *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-critical-level"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Stok Durumu Önizleme</h4>
                  <p className="text-sm text-muted-foreground">
                    {form.watch("currentStock") === 0 ? (
                      <span className="text-destructive">• Stok tükendi</span>
                    ) : form.watch("currentStock") <= form.watch("criticalLevel") ? (
                      <span className="text-amber-600">• Kritik seviyede ({form.watch("currentStock")} adet)</span>
                    ) : (
                      <span className="text-green-600">• Yeterli stok ({form.watch("currentStock")} adet)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isLoading}
                  data-testid="button-cancel"
                >
                  İptal
                </Button>
              )}
              <Button 
                type="submit"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? (
                  product ? "Güncelleniyor..." : "Ekleniyor..."
                ) : (
                  product ? "Güncelle" : "Ekle"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
