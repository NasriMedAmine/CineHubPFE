// Affiche une note sur 5 avec des étoiles (ex : ★★★★☆ 4.2)

type RatingStarsProps = {
  rating: number | null; // null = pas encore d'avis
  reviewCount?: number;
};

export default function RatingStars({ rating, reviewCount }: RatingStarsProps) {
  if (rating === null) {
    return <span className="rating-stars"><small>Pas encore noté</small></span>;
  }

  const fullStars = Math.round(rating);
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= fullStars ? "" : "empty"}>
        ★
      </span>
    );
  }

  return (
    <span className="rating-stars" title={`${rating} sur 5`}>
      {stars}
      <small>
        {rating.toFixed(1)}
        {reviewCount !== undefined && ` (${reviewCount} avis)`}
      </small>
    </span>
  );
}
