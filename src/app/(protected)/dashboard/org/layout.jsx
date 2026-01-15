"use client";

import Sidebar from "@/components/organizersDashboardComponents/Sidebar"
import OrganizerHeader from "@/components/OrganizerHeader"
import { useRoleAuth } from "@/hooks/useRoleAuth"
import { Loader2 } from "lucide-react"
import React from 'react'

const organizersDashboardLayout = ({ children }) => {
  const { loading, authorized } = useRoleAuth('organizer');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <>
      <OrganizerHeader />
      <section className='flex flex-col md:flex-row min-h-screen bg-black text-foreground relative'>
        {/* Sidebar container - Desktop aside is hidden on mobile inside the component */}
        <div className="md:w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-32 md:pb-10">
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            {children}
          </div>
        </main>
      </section>
    </>
  )
}

export default organizersDashboardLayout
