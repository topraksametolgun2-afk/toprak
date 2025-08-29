import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertReview } from "@shared/schema";

interface CreateReviewFormData {
  productId: string;
  rating: number;
  comment: string;
}

interface CreateReviewModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateReviewModal({ 
  productId, 
  productName, 
  isOpen, 
  onClose 
}: CreateReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: CreateReviewFormData) => {
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Değerlendirmeniz kaydedildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/product", productId, "average"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/user", productId] });
      onClose();
      setRating(0);
      setComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Hata!",
        description: error.message || "Değerlendirme kaydedilemedi.",
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

    createReviewMutation.mutate({
      productId,
      rating,
      comment: comment.trim()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="create-review-modal">
        <DialogHeader>
          <DialogTitle>Ürünü Değerlendir</DialogTitle>
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
              data-testid="rating-input"
            />
          </div>

          <div>
            <label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Yorumunuz
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ürün hakkındaki görüşlerinizi paylaşın..."
              rows={4}
              data-testid="comment-input"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="cancel-review"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              data-testid="submit-review"
            >
              {createReviewMutation.isPending ? "Kaydediliyor..." : "Değerlendir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}