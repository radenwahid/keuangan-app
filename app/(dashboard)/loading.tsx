import { SkeletonCard, SkeletonList } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-pink-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <SkeletonList count={5} />
    </div>
  );
}
