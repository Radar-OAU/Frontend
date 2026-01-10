import Sidebar from "@/components/organizersDashboardComponents/sidebar"
import OrganizerHeader from "@/components/OrganizerHeader"
import React from 'react'

const organizersDashboardLayout = ({children}) => {
  return (
   <>
    {/* Mobile Header - only visible on mobile */}
    <div className="md:hidden">
      <OrganizerHeader />
    </div>
    <section className='flex flex-col md:flex-row min-h-screen  bg-black border-r border-gray-900 md:p-5 text-foreground gap-6'>
      {/* sidebar content */}
 <nav className='fixed bottom-0 w-full mt-20 p-2 rounded-xl md:mt-4 md:left-0 md:pt-10 md:w-66 lg:w-65 border-border md:min-h-screen order-1 z-10'>
        <Sidebar />
      </nav>
      {/* main content */}
      <main className='flex-1 md:ml-70 p-0 pb-20 md:pb-0'>
        {children}
      </main>
    </section>
   </>
  )
}

export default organizersDashboardLayout
