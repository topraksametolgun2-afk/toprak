import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
  showText = false,
  reviewCount
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= rating;
      const isHalfFilled = i - 0.5 <= rating && i > rating;
      
      stars.push(
        <button
          key={i}
          type="button"
          className={cn(
            "relative",
            interactive && "hover:scale-110 transition-transform cursor-pointer",
            !interactive && "cursor-default"
          )}
          onClick={() => handleStarClick(i)}
          disabled={!interactive}
          data-testid={`star-${i}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : isHalfFilled
                ? "fill-yellow-200 text-yellow-400"
                : "fill-gray-200 text-gray-200",
              interactive && "hover:text-yellow-400 hover:fill-yellow-300"
            )}
          />
        </button>
      );
    }
    
    return stars;
  };

  const formatRating = (rating: number) => {
    return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      {showText && (
        <div className={cn("flex items-center gap-1 ml-1", textSizeClasses[size])}>
          <span className="font-medium text-foreground">
            {formatRating(rating)}
          </span>
          {reviewCount !== undefined && (
            <span className="text-muted-foreground">
              ({reviewCount} değerlendirme)
            </span>
          )}
        </div>
      )}
    </div>
  );
}