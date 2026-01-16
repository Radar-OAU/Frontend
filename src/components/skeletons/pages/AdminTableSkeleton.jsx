"use client";

import { SkeletonBox, SkeletonLine } from "../primitives";

/**
 * AdminTableSkeleton
 * Matches the exact layout of admin table pages like /lighthouse/events and /lighthouse/users:
 * - Header with title and filters/search
 * - Data table with rows
 */
export const AdminTableSkeleton = ({ 
  columns = 5, 
  rows = 8,
  showFilters = true,
  showSearch = true 
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <SkeletonLine width="120px" height="1.75rem" />
          <SkeletonLine width="240px" height="0.875rem" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          {showSearch && (
            <SkeletonBox width="256px" height="32px" borderRadius="0.5rem" className="w-full sm:w-64" />
          )}
          {showFilters && (
            <div className="flex gap-2 bg-muted p-1 rounded-lg">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} width="60px" height="28px" borderRadius="0.375rem" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="p-3 font-medium">
                    <SkeletonLine width={i === 0 ? "100px" : "70px"} height="0.75rem" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="p-3">
                      {j === 0 ? (
                        <div className="space-y-1">
                          <SkeletonLine width="140px" height="0.875rem" />
                          <SkeletonLine width="100px" height="0.625rem" />
                        </div>
                      ) : j === columns - 1 ? (
                        <div className="flex justify-end gap-1">
                          <SkeletonBox width="28px" height="28px" borderRadius="0.25rem" />
                          <SkeletonBox width="28px" height="28px" borderRadius="0.25rem" />
                        </div>
                      ) : j === Math.floor(columns / 2) ? (
                        <SkeletonBox width="60px" height="20px" borderRadius="999px" />
                      ) : (
                        <SkeletonLine width="80px" height="0.75rem" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTableSkeleton;
