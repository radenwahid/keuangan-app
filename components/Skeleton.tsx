export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100 animate-pulse">
      <div className="h-4 bg-pink-100 rounded w-1/3 mb-3" />
      <div className="h-8 bg-pink-100 rounded w-2/3" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 animate-pulse flex gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-pink-100 rounded w-1/3" />
            <div className="h-3 bg-pink-50 rounded w-1/2" />
          </div>
          <div className="h-5 bg-pink-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}
