import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

interface EditReviewFormData {
  rating: number;
  comment: string;
}

interface EditReviewModalProps {
  review: Review | null;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditReviewModal({ 
  review,
  productName, 
  isOpen, 
  onClose 
}: EditReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form when review changes
  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment || "");
    }
  }, [review]);

  const updateReviewMutation = useMutation({
    mutationFn: async (reviewData: EditReviewFormData) => {
      if (!review) throw new Error("Review not found");
      const response = await apiRequest("PUT", `/api/reviews/${review.id}`, reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Değerlendirmeniz güncellendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", review?.productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", review?.productId, "average"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user", review?.productId] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata!",
        description: error.message || "Değerlendirme güncellenemedi.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Hata!",
        description: "Lütfen bir puan verin.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Hata!",
        description: "Lütfen bir yorum yazın.",
        variant: "destructive",
      });
      return;
    }

    updateReviewMutation.mutate({
      rating,
      comment: comment.trim()
    });
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="edit-review-modal">
        <DialogHeader>
          <DialogTitle>Değerlendirmeyi Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{productName}</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Puanınız
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              data-testid="edit-rating-input"
            />
          </div>

          <div>
            <label htmlFor="edit-comment" className="text-sm font-medium mb-2 block">
              Yorumunuz
            </label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ürün hakkındaki görüşlerinizi paylaşın..."
              rows={4}
              data-testid="edit-comment-input"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="cancel-edit-review"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={updateReviewMutation.isPending}
              data-testid="submit-edit-review"
            >
              {updateReviewMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}