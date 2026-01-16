"use client";

import { SkeletonBox, SkeletonLine, SkeletonCircle } from "../primitives";

/**
 * DashboardHeaderSkeleton
 * Matches the header layout used across dashboard layouts
 */
export const DashboardHeaderSkeleton = () => (
  <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
    <div className="flex items-center gap-4">
      <SkeletonBox width="40px" height="40px" borderRadius="10px" />
      <SkeletonLine width="120px" height="1.5rem" />
    </div>
    <div className="flex items-center gap-4">
      <SkeletonBox width="100px" height="32px" className="hidden sm:block" />
      <SkeletonCircle size="36px" />
    </div>
  </header>
);

/**
 * SidebarSkeleton
 * Matches the sidebar layout used across dashboard layouts
 */
export const SidebarSkeleton = () => (
  <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-background px-4 py-6">
    <div className="flex items-center gap-3 px-2 mb-8">
      <SkeletonBox width="32px" height="32px" />
      <SkeletonLine width="100px" height="1.5rem" />
    </div>
    <div className="flex-1 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <SkeletonBox width="20px" height="20px" />
          <SkeletonLine width="60%" height="1rem" />
        </div>
      ))}
    </div>
    <div className="mt-auto px-2 pt-4 border-t">
      <div className="flex items-center gap-3 py-2">
        <SkeletonCircle size="32px" />
        <div className="space-y-1">
          <SkeletonLine width="80px" height="0.75rem" />
          <SkeletonLine width="100px" height="0.75rem" />
        </div>
      </div>
    </div>
  </aside>
);

/**
 * DashboardLayoutSkeleton
 * Complete dashboard layout skeleton for layouts that show full page loading
 */
export const DashboardLayoutSkeleton = ({ children }) => (
  <div className="min-h-screen bg-black">
    <DashboardHeaderSkeleton />
    <div className="flex">
      <div className="hidden md:block w-64">
        <SidebarSkeleton />
      </div>
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  </div>
);

/**
 * AdminLayoutSkeleton
 * Complete admin layout skeleton matching /lighthouse layout
 */
export const AdminLayoutSkeleton = ({ children }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className="hidden md:block w-64 border-r bg-card h-full">
      <SidebarSkeleton />
    </div>
    
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-14 border-b bg-card">
        <DashboardHeaderSkeleton />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  </div>
);
