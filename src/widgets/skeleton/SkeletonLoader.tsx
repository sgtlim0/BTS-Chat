export function SkeletonLoader() {
  return (
    <div className="mb-6 animate-[fadeIn_0.15s_ease-out]">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <span>✦</span>
        </div>
        <span className="text-[13px] font-medium text-text-primary">CardNews AI</span>
      </div>
      <div className="space-y-2.5 pl-0">
        <div className="h-3.5 w-3/4 rounded-md bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-3.5 w-full rounded-md bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-3.5 w-5/6 rounded-md bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <div className="h-3.5 w-1/2 rounded-md bg-gradient-to-r from-skeleton-from via-skeleton-to to-skeleton-from bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
