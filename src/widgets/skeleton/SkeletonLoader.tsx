export function SkeletonLoader() {
  return (
    <div className="mb-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="text-[11px] font-semibold text-text-muted mb-2">AI</div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-4 w-full rounded bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-4 w-5/6 rounded bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-4 w-1/2 rounded bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
