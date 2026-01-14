"use client";

import { useEffect, useState } from "react";
import { adminService } from "../../../lib/admin";
import { Loader2, DollarSign, Calendar, Users, BarChart3 } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = stats?.total_revenue || 0;
  const totalEvents = stats?.total_events || 0;
  const totalOrganizers = stats?.total_organisers || 0;
  const totalStudents = stats?.total_students || 0;
  const totalUsers = stats?.total_users || 0;
  
  const avgRevenuePerEvent = totalEvents > 0 ? (totalRevenue / totalEvents) : 0;
  const avgRevenuePerOrganizer = totalOrganizers > 0 ? (totalRevenue / totalOrganizers) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revenue Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Platform revenue and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform fees collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Events on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Total Platform Revenue</p>
                <p className="text-xs text-muted-foreground">All-time earnings</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₦{totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Average per Event</p>
                <p className="text-xs text-muted-foreground">Revenue per event</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₦{avgRevenuePerEvent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Average per Organizer</p>
                <p className="text-xs text-muted-foreground">Revenue per organizer</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  ₦{avgRevenuePerOrganizer.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalUsers}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Students</p>
                <p className="text-xs text-muted-foreground">Student accounts</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalStudents}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Organizers</p>
                <p className="text-xs text-muted-foreground">Event organizers</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{totalOrganizers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Per Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue per Event</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{avgRevenuePerEvent.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {totalEvents} events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue per Organizer</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{avgRevenuePerOrganizer.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {totalOrganizers} organizers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered accounts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}