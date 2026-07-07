"use client";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className ?? ""}`} />;
}

export function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]" aria-busy="true" aria-label="Loading store">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]/30">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SkeletonBlock className="size-11 rounded-2xl shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-3 w-56" />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <SkeletonBlock className="size-9 rounded-xl" />
              <SkeletonBlock className="size-9 rounded-xl" />
            </div>
          </div>
          <div className="mt-3">
            <SkeletonBlock className="h-10 w-full rounded-2xl" />
          </div>
        </div>
      </header>

      <div className="w-[95%] max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] sm:overflow-visible sm:pb-0">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="min-w-[84px] sm:min-w-0 h-[92px] sm:h-[100px] rounded-2xl shrink-0" />
          ))}
        </div>
      </div>

      <div className="w-[95%] max-w-[1600px] mx-auto px-4 pb-20">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[220px] sm:w-[250px] shrink-0 space-y-2">
              <SkeletonBlock className="w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl" />
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAF9] px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-red-50 text-[#EF4444] mb-5 shadow-sm border border-red-100">
        <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
      </div>
      <h2 className="text-xl font-extrabold text-[#0B0F19]">Store Not Found</h2>
      <p className="text-sm text-[#64748B] max-w-sm mt-2 leading-relaxed">
        This store doesn&apos;t exist or is currently unavailable. Check the link and try again.
      </p>
    </div>
  );
}
