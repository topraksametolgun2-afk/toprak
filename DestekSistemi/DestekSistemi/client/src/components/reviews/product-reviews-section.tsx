import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./star-rating";
import { ReviewList } from "./review-list";
import { CreateReviewModal } from "./create-review-modal";
import { EditReviewModal } from "./edit-review-modal";
import { apiRequest } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  currentUserId?: string;
}

export function ProductReviewsSection({ 
  productId, 
  productName, 
  currentUserId 
}: ProductReviewsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Fetch rating average
  const { data: ratingData } = useQuery({
    queryKey: ["/api/reviews/product", productId, "average"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/reviews/product/${productId}/average`);
      return response.json() as Promise<{ average: number }>;
    },
  });

  // Fetch user's review for this product
  const { data: userReview, isLoading: isUserReviewLoading } = useQuery({
    queryKey: ["/api/reviews/user", productId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const response = await apiRequest("GET", `/api/reviews/user/${productId}`);
      return response.json() as Promise<Review | null>;
    },
    enabled: !!currentUserId,
  });

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const canCreateReview = currentUserId && !userReview && !isUserReviewLoading;

  return (
    <div className="space-y-6" data-testid="product-reviews-section">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ürün Değerlendirmeleri</span>
            {canCreateReview && (
              <Button
                onClick={() => setShowCreateModal(true)}
                data-testid="create-review-button"
              >
                Değerlendir
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratingData && ratingData.average > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating 
                rating={ratingData.average} 
                readonly 
                size="lg" 
                data-testid="average-rating"
              />
              <span className="text-lg font-semibold">
                {ratingData.average.toFixed(1)} / 5.0
              </span>
            </div>
          ) : (
            <p className="text-gray-500" data-testid="no-rating">
              Bu ürün için henüz değerlendirme yok
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* User's Review (if exists) */}
      {userReview && (
        <Card data-testid="user-review-section">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sizin Değerlendirmeniz</span>
              <Button
                variant="outline"
                onClick={() => handleEditReview(userReview)}
                data-testid="edit-user-review"
              >
                Düzenle
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <StarRating rating={userReview.rating} readonly />
              {userReview.comment && (
                <p className="text-gray-700" data-testid="user-review-comment">
                  {userReview.comment}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Değerlendirmeler</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewList
            productId={productId}
            currentUserId={currentUserId}
            onEditReview={handleEditReview}
          />
        </CardContent>
      </Card>

      {/* Create Review Modal */}
      <CreateReviewModal
        productId={productId}
        productName={productName}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Review Modal */}
      <EditReviewModal
        review={editingReview}
        productName={productName}
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
      />
    </div>
  );
}