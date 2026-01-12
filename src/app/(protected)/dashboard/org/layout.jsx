import Sidebar from "@/components/organizersDashboardComponents/Sidebar"
import OrganizerHeader from "@/components/OrganizerHeader"
import React from 'react'

const organizersDashboardLayout = ({ children }) => {
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
