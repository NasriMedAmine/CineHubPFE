// Affichage d'un avis : auteur, note, date et commentaire

import RatingStars from "./RatingStars";

type ReviewCardProps = {
  authorName: string;
  rating: number;
  comment: string;
  date: string; // date déjà formatée
  children?: React.ReactNode; // boutons éventuels (modifier / supprimer)
};

export default function ReviewCard({ authorName, rating, comment, date, children }: ReviewCardProps) {
  return (
    <div className="review-card">
      <div className="review-header">
        <strong>{authorName}</strong>
        <RatingStars rating={rating} />
      </div>
      <small className="muted">{date}</small>
      <p>{comment}</p>
      {children}
    </div>
  );
}
