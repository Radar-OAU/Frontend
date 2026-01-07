
"use client";

import { AlertTriangle } from "lucide-react";

export default function TicketsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="bg-yellow-100 p-4 rounded-full">
         <AlertTriangle className="h-8 w-8 text-yellow-600" />
      </div>
      <h2 className="text-2xl font-bold">Tickets Management</h2>
      <p className="text-muted-foreground max-w-md">
        Global ticket management is currently under development. 
        You can view ticket statistics per event in the Events tab.
      </p>
    </div>
  );
}
