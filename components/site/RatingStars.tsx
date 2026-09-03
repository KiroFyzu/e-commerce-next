import { StarIcon } from "@/components/icons";

export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} dari 5`}>
      <div className="flex items-center text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            filled={i < Math.round(rating)}
            className={i < Math.round(rating) ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-line"}
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
