"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * AdminDashboardSkeleton
 * Matches the exact layout of /lighthouse/dashboard/page.jsx:
 * - Header with title
 * - 4 metric cards grid
 * - 4/3 grid with recent activity and quick actions
 */
export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <SkeletonLine width="140px" height="1.75rem" />
          <SkeletonLine width="280px" height="0.875rem" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
              <SkeletonLine width="80px" height="0.75rem" />
              <SkeletonBox width="16px" height="16px" />
            </div>
            <div className="p-4 pt-0">
              <SkeletonLine width="80px" height="1.5rem" className="mb-1" />
              <SkeletonLine width="140px" height="0.625rem" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Card */}
        <div className="col-span-4 rounded-lg border bg-card shadow-sm">
          <div className="p-4 pb-2">
            <SkeletonLine width="120px" height="1rem" />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="space-y-0.5 flex-1">
                    <SkeletonLine width="180px" height="0.875rem" />
                    <SkeletonLine width="120px" height="0.625rem" />
                  </div>
                  <SkeletonBox width="60px" height="20px" borderRadius="999px" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="col-span-3 rounded-lg border bg-card shadow-sm">
          <div className="p-4 pb-2">
            <SkeletonLine width="100px" height="1rem" />
          </div>
          <div className="p-4 space-y-3">
            <SkeletonLine width="200px" height="0.75rem" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} height="40px" borderRadius="0.375rem" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
