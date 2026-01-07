
"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../../lib/admin";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export default function RevenuePage() {
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState(null);

   useEffect(() => {
     adminService.getAnalytics().then(data => {
       setStats(data);
       setLoading(false);
     }).catch(() => setLoading(false));
   }, []);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin mx-auto mt-20 text-primary" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Revenue Analytics</h2>
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-base">Total Revenue</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
               <div className="text-3xl font-bold text-green-600">
                  ₦{stats?.total_revenue?.toLocaleString() || "0.00"}
               </div>
               <p className="text-xs text-muted-foreground mt-1">
                  Total revenue generated from platform fees.
               </p>
            </CardContent>
         </Card>
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-base">By The Numbers</CardTitle></CardHeader>
            <CardContent className="space-y-3 p-4">
               <div className="flex justify-between border-b pb-2 text-sm">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-semibold">{stats?.total_events}</span>
               </div>
               <div className="flex justify-between border-b last:border-0 pb-2 text-sm">
                  <span className="text-muted-foreground">Paying Users (Organizers)</span>
                  <span className="font-semibold">{stats?.total_organisers}</span>
               </div>
            </CardContent>
         </Card>
      </div>
      
    </div>
  );
}
