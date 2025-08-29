import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, ShoppingCart, Heart, MessageSquare, User, Package, Truck, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const reviewSchema = z.object({
  rating: z.string().min(1, "Puan seçiniz"),
  comment: z.string().min(10, "Yorum en az 10 karakter olmalı"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const reviewForm = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "",
      comment: "",
    },
  });

  // Mock data - in real app this would come from API
  const product: Product = {
    id: id || "1",
    name: "Samsung Galaxy S24 Ultra",
    description: "En son teknoloji ile donatılmış Samsung'un amiral gemisi telefonu. 200MP kamera, S Pen desteği ve uzun pil ömrü ile profesyonel kullanım için ideal.",
    price: 25000,
    category: "Elektronik",
    stock: 15,
    images: ["/placeholder-product.jpg"],
    rating: 4.5,
    reviewCount: 24,
    seller: {
      id: "seller1",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      company: "TechStore A.Ş."
    }
  };

  const reviews: Review[] = [
    {
      id: "1",
      userId: "user1",
      userName: "Mehmet K.",
      rating: 5,
      comment: "Harika bir telefon, kamerasını çok beğendim. Hızlı kargo ve güvenli paketleme.",
      createdAt: "2025-08-25"
    },
    {
      id: "2",
      userId: "user2",
      userName: "Ayşe T.",
      rating: 4,
      comment: "Kaliteli ürün ama fiyatı biraz yüksek. Genel olarak memnunum.",
      createdAt: "2025-08-20"
    },
    {
      id: "3",
      userId: "user3",
      userName: "Can S.",
      rating: 5,
      comment: "S Pen özelliği çok kullanışlı. İş için aldım, çok verimli.",
      createdAt: "2025-08-18"
    }
  ];

  const onSubmitReview = async (data: ReviewFormData) => {
    try {
      // API call would go here
      toast({
        title: "Yorum eklendi",
        description: "Yorumunuz başarıyla kaydedildi.",
      });
      reviewForm.reset();
      setShowReviewForm(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6"
    }[size];

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Package className="h-32 w-32 text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-square rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              {renderStars(product.rating, "md")}
              <span className="text-sm text-gray-600">({product.reviewCount} değerlendirme)</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-3xl font-bold text-blue-600">{product.price.toLocaleString('tr-TR')} ₺</div>
            
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <span className="text-sm">
                {product.stock > 0 ? (
                  <span className="text-green-600">Stokta {product.stock} adet</span>
                ) : (
                  <span className="text-red-600">Stokta yok</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Ücretsiz kargo (1-3 iş günü)</span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">2 yıl garanti</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Satıcı Bilgileri</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{product.seller.firstName[0]}{product.seller.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{product.seller.firstName} {product.seller.lastName}</p>
                {product.seller.company && (
                  <p className="text-sm text-gray-600">{product.seller.company}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              disabled={product.stock === 0}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
            </Button>
            <Button variant="outline" size="icon" data-testid="button-add-to-favorites">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ürün Açıklaması</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Değerlendirmeler ({reviews.length})
            </CardTitle>
            <CardDescription>
              Müşteri yorumları ve değerlendirmeleri
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowReviewForm(!showReviewForm)}
            data-testid="button-add-review"
          >
            Yorum Yaz
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Summary */}
          <div className="flex items-center gap-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{product.rating.toFixed(1)}</div>
              {renderStars(product.rating, "lg")}
              <div className="text-sm text-gray-600 mt-1">{product.reviewCount} değerlendirme</div>
            </div>
            <div className="flex-1">
              {Array.from({ length: 5 }, (_, i) => {
                const starCount = 5 - i;
                const percentage = Math.random() * 60 + 20; // Mock percentage
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span>{starCount}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Yorum Yaz</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...reviewForm}>
                  <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
                    <FormField
                      control={reviewForm.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Puan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-rating">
                                <SelectValue placeholder="Puan seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5 ⭐ Mükemmel</SelectItem>
                              <SelectItem value="4">4 ⭐ Çok İyi</SelectItem>
                              <SelectItem value="3">3 ⭐ İyi</SelectItem>
                              <SelectItem value="2">2 ⭐ Orta</SelectItem>
                              <SelectItem value="1">1 ⭐ Kötü</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reviewForm.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yorum</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
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
                      <Button type="submit" data-testid="button-submit-review">
                        Yorumu Gönder
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

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, "sm")}
                        <span className="text-sm text-gray-600">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}