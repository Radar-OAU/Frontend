import Sidebar from "@/components/organizersDashboardComponents/Sidebar"
import React from 'react'

const organizersDashboardLayout = ({children}) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-gray-800 p-2 md:static md:w-64 md:min-h-screen md:bg-black md:border-r md:border-t-0 md:p-6">
        <div className="md:sticky md:top-24">
          <Sidebar />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

export default organizersDashboardLayout
