import { Skeleton } from "@/components/ui/skeleton";

export function MobileHomeSkeleton() {
  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-blue-700 px-5 pb-6 md:pt-14 pt-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-lg bg-white/20" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/30" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
        </div>

        {/* Search card skeleton */}
        <div className="rounded-2xl bg-white p-4 shadow-xl space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>

      {/* AI shortcut */}
      <div className="px-5 mt-5">
        <Skeleton className="h-[72px] w-full rounded-2xl" />
      </div>

      {/* Popular destinations */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-32 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Featured adventures */}
      <div className="px-5 mt-6 pb-24">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border overflow-hidden"
            >
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-32" />
                <div className="mt-2 pt-2 flex items-center justify-between border-t">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tabs skeleton */}
      <div className="sticky bottom-0 bg-white border-t md:pb-6">
        <div className="grid grid-cols-5 py-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-2 w-10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
