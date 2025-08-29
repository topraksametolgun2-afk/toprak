import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Navigation } from "@/components/navigation";
import { StarRating } from "@/components/star-rating";
import { authService } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema, updateReviewSchema } from "@shared/schema";
import { ArrowLeft, Package, MessageCircle, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import type { z } from "zod";

type InsertReview = z.infer<typeof insertReviewSchema>;
type UpdateReview = z.infer<typeof updateReviewSchema>;

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string | null;
  imageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function ProductDetail() {
  const [, params] = useRoute("/urunler/:id");
  const productId = params?.id;
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const { toast } = useToast();
  const currentUser = authService.getUser();

  // Ürün detaylarını getir
  const { data: product, isLoading } = useQuery<ProductDetail>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`, {
        headers: authService.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ürün bulunamadı');
      return response.json();
    },
    enabled: !!productId
  });

  // Yorum formu
  const reviewForm = useForm<InsertReview>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Düzenleme formu
  const editForm = useForm<UpdateReview>({
    resolver: zodResolver(updateReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  // Kullanıcının yorumu var mı kontrol et
  const userReview = product?.reviews.find(review => review.userId === currentUser?.id);

  // Yorum ekleme mutation
  const addReviewMutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      const response = await apiRequest('POST', `/api/products/${productId}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      toast({
        title: "Başarılı",
        description: "Değerlendirmeniz eklendi",
      });
      setShowReviewForm(false);
      reviewForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme eklenemedi",
        variant: "destructive",
      });
    },
  });

  // Yorum güncelleme mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: UpdateReview }) => {
      const response = await apiRequest('PUT', `/api/reviews/${reviewId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      toast({
        title: "Başarılı",
        description: "Değerlendirmeniz güncellendi",
      });
      setEditingReview(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme güncellenemedi",
        variant: "destructive",
      });
    },
  });

  // Yorum silme mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest('DELETE', `/api/reviews/${reviewId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId] });
      toast({
        title: "Başarılı",
        description: "Değerlendirmeniz silindi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme silinemedi",
        variant: "destructive",
      });
    },
  });

  const onAddReview = (data: InsertReview) => {
    addReviewMutation.mutate(data);
  };

  const onUpdateReview = (data: UpdateReview) => {
    if (editingReview) {
      updateReviewMutation.mutate({ reviewId: editingReview.id, data });
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    editForm.reset({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Bu değerlendirmeyi silmek istediğinizden emin misiniz?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = (user: Review['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  useEffect(() => {
    if (editingReview) {
      editForm.reset({
        rating: editingReview.rating,
        comment: editingReview.comment,
      });
    }
  }, [editingReview, editForm]);

  if (!productId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Ürün bulunamadı</div>
        </div>
      </div>
    );
  }

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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Ürün bulunamadı</h2>
            <p className="text-muted-foreground">Aradığınız ürün mevcut değil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ürünlere Dön
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-24 w-24 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <Badge variant="secondary" className="text-sm">
                {product.category}
              </Badge>
            )}

            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <StarRating 
                rating={product.averageRating}
                showText
                reviewCount={product.reviewCount}
                size="lg"
              />
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" data-testid="button-contact-sales">
                Satış Ekibiyle İletişime Geç
              </Button>
              
              {currentUser && !userReview && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setShowReviewForm(true)}
                  data-testid="button-add-review"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Değerlendirme Yaz
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Müşteri Değerlendirmeleri ({product.reviewCount})
            </h2>
          </div>

          {/* Add Review Form */}
          {currentUser && showReviewForm && !userReview && (
            <Card>
              <CardHeader>
                <CardTitle>Değerlendirme Yazın</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit(onAddReview)} className="space-y-4">
                    <FormField
                      control={reviewForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puanınız</FormLabel>
                          <FormControl>
                            <StarRating
                              rating={field.value}
                              interactive
                              onRatingChange={field.onChange}
                              size="lg"
                              data-testid="star-rating-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yorumunuz</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Bu ürün hakkındaki deneyiminizi paylaşın..."
                              className="min-h-[100px]"
                              {...field}
                              data-testid="textarea-comment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={addReviewMutation.isPending}
                        data-testid="button-submit-review"
                      >
                        {addReviewMutation.isPending ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowReviewForm(false)}
                        data-testid="button-cancel-review"
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* User has review notice */}
          {currentUser && userReview && !showReviewForm && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bu ürün için zaten bir değerlendirmeniz var. Aşağıda görebilir ve düzenleyebilirsiniz.
              </AlertDescription>
            </Alert>
          )}

          {/* Reviews List */}
          {product.reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Henüz değerlendirme yok
                </h3>
                <p className="text-muted-foreground">
                  Bu ürün için ilk değerlendirmeyi siz yazın!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {product.reviews.map(review => (
                <Card key={review.id} className={review.userId === currentUser?.id ? "border-primary/50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {getDisplayName(review.user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getDisplayName(review.user)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {review.userId === currentUser?.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            data-testid={`button-edit-review-${review.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            data-testid={`button-delete-review-${review.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Edit Form */}
                    {editingReview?.id === review.id ? (
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onUpdateReview)} className="space-y-4">
                          <FormField
                            control={editForm.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Puanınız</FormLabel>
                                <FormControl>
                                  <StarRating
                                    rating={field.value}
                                    interactive
                                    onRatingChange={field.onChange}
                                    size="md"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={editForm.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Yorumunuz</FormLabel>
                                <FormControl>
                                  <Textarea
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              size="sm" 
                              disabled={updateReviewMutation.isPending}
                            >
                              {updateReviewMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingReview(null)}
                            >
                              İptal
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-3">
                        <StarRating rating={review.rating} size="sm" />
                        <p className="text-foreground leading-relaxed">
                          {review.comment}
                        </p>
                        {review.updatedAt !== review.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Düzenlendi: {formatDate(review.updatedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}