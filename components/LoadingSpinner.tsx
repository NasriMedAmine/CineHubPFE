// Petit indicateur de chargement animé

export default function LoadingSpinner() {
  return (
    <div className="spinner-wrapper" aria-label="Chargement en cours">
      <div className="spinner" />
    </div>
  );
}
