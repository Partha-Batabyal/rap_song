import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="shimmer-skeleton h-40 w-full rounded-2xl glass-panel-light p-5 flex flex-col justify-between">
      <div>
        <div className="h-5 bg-zinc-800 rounded-md w-2/3 mb-3"></div>
        <div className="h-3 bg-zinc-800 rounded-md w-full mb-2"></div>
        <div className="h-3 bg-zinc-800 rounded-md w-4/5"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-zinc-800/40">
        <div className="h-4 bg-zinc-800 rounded-full w-16"></div>
        <div className="h-4 bg-zinc-800 rounded-md w-24"></div>
      </div>
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="shimmer-skeleton h-28 w-full rounded-2xl glass-panel-light p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-800 rounded-md w-1/3"></div>
        <div className="h-6 bg-zinc-800 rounded-md w-2/3"></div>
      </div>
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((n) => (
        <div key={n} className="shimmer-skeleton h-16 w-full rounded-xl glass-panel-light p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-zinc-800"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-zinc-800 rounded-md w-1/4"></div>
              <div className="h-3 bg-zinc-800 rounded-md w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-zinc-800 rounded-md w-16"></div>
        </div>
      ))}
    </div>
  );
};
