export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden p-3" aria-hidden="true">
      <div className="skeleton aspect-square w-full rounded" />
      <div className="skeleton mt-3 h-4 w-11/12 rounded" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      <div className="skeleton mt-3 h-6 w-1/3 rounded" />
      <div className="skeleton mt-3 h-8 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSpinner({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-[#565959]" role="status">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-[#e7e9e9] border-t-brand" />
      <span className="text-sm">{label}...</span>
    </div>
  );
}
