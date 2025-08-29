import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./star-rating";
import { Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Review } from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ReviewListProps {
  productId: string;
  currentUserId?: string;
  onEditReview?: (review: Review) => void;
}

export function ReviewList({ productId, currentUserId, onEditReview }: ReviewListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews/product", productId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reviews/product/${productId}`);
      return response.json() as Promise<Review[]>;
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest("DELETE", `/api/reviews/${reviewId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Değerlendirmeniz silindi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", productId, "average"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user", productId] });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "Değerlendirme silinemedi.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Bu değerlendirmeyi silmek istediğinizden emin misiniz?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="no-reviews">
        <p>Bu ürün için henüz değerlendirme yapılmamış.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="reviews-list">
      {reviews.map((review) => (
        <Card key={review.id} data-testid={`review-${review.id}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} readonly size="sm" />
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), "d MMMM yyyy", { locale: tr })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mt-2" data-testid={`review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                )}
              </div>

              {currentUserId === review.userId && (
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditReview?.(review)}
                    data-testid={`edit-review-${review.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteReviewMutation.isPending}
                    data-testid={`delete-review-${review.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}