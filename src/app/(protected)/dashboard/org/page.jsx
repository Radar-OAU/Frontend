"use client";

import { useEffect, useState } from "react";
import api from "../../../../lib/axios";
import { Ticket, Users, Calendar, TrendingUp, DollarSign, Clock, Plus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../../../store/authStore";
import { toast } from "react-hot-toast";
import useOrganizerStore from "../../../../store/orgStore";
import Loading from "@/components/ui/Loading";


export default function Overview() {
  const [analytics, setAnalytics] = useState(null);
  const [eventsSummary, setEventsSummary] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { events, setOrganization, setEvents, lastUpdate, hydrated } = useOrganizerStore();

  useEffect(() => {
    // Wait for orgStore hydration before fetching data
    if (!hydrated) return;

    async function fetchOverview() {
      try {
        setLoading(true);

        const [
          analyticsRes,
          summaryRes,
          eventsRes,
          orgRes,
        ] = await Promise.allSettled([
          api.get("/analytics/global/"),
          api.get("/analytics/events-summary/"),
          api.get("/organizer/events/"),
          api.get("/organizer/profile/"),
        ]);
          // this part sorts events by date in descending order
        const sortedEvents = [...eventsRes.value.data.events].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (analyticsRes.status === "fulfilled") {
          setAnalytics(analyticsRes.value.data.analytics);
        }

        if (summaryRes.status === "fulfilled") {
          setEventsSummary(summaryRes.value.data);
        }

        if (eventsRes.status === "fulfilled") {
          const eventsData = eventsRes.value.data.events || [];
          setEvents(eventsData);
          setRecentEvents(sortedEvents.slice(0, 3));
        }

        if (orgRes.status === "fulfilled") {
          setOrganization(orgRes.value.data.Org_profile || orgRes.value.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load overview");
        setLoading(false);
      }
    }


    fetchOverview();
  }, [hydrated, setOrganization, setEvents]);

  // get the organization from the store to display in the welcome message
  const { organization } = useOrganizerStore();
  organization && console.log("Organization Name:", organization.Organization_Name);
  
  

  // Refetch analytics and events summary when events change to update total events count and summary
  useEffect(() => {
    async function refetchData() {
      try {
        const [analyticsRes, summaryRes] = await Promise.allSettled([
          api.get("/analytics/global/"),
          api.get("/analytics/events-summary/")
        ]);

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value.data.analytics);
        }

        if (summaryRes.status === 'fulfilled') {
          setEventsSummary(summaryRes.value.data);
        }
      } catch (err) {
        console.error("Failed to refetch data:", err);
      }
    }
      console.log("Refetch effect fired", lastUpdate);

  // refetch data so that the overview stats are always up to date
    refetchData();
  }, [lastUpdate]);

  if (loading) {
    return <Loading />;
  }

  if (!analytics) {
     return (
       <div className="text-white flex flex-col items-center justify-center h-screen">
         <p className="mb-4">Failed to load dashboard data.</p>
         <button 
           onClick={() => window.location.reload()}
           className="px-4 py-2 bg-rose-600 rounded-lg hover:bg-rose-700"
         >
           Retry
         </button>
       </div>
     );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Welcome back, {organization?.Organization_Name || 'Organizer'}!
          </h1>
          <p className="text-gray-400 text-xs">Overview of your event performance and analytics.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/org/create-event")}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 font-semibold text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Event
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          label="Total revenue"
          value={`₦${analytics.total_revenue?.toLocaleString() || 0}`}
          description="Gross earnings from all events"
          trend="Live"
        />
        <StatCard
          icon={<Ticket className="w-5 h-5 text-blue-500" />}
          label="Tickets sold"
          value={analytics.total_tickets_sold?.toLocaleString() || 0}
          description="Total confirmed bookings"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-cyan-500" />}
          label="Total events"
          value={analytics.total_events_created?.toLocaleString() || 0}
          description="Events created on the platform"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          label="Pending orders"
          value={analytics.total_tickets_pending?.toLocaleString() || 0}
          description="Waitlisted or awaiting payment"
        />
      </div>

      {/* Organizer Analytics Section */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-white/5 rounded-lg">
             <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold">Event Status Overview</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <SummaryBox label="Total created" value={analytics.total_events_created} color="text-white" />
          <SummaryBox label="Verified & live" value={analytics.verified_events} color="text-emerald-500" />
          <SummaryBox label="Pending review" value={analytics.pending_events} color="text-amber-500" />
          <SummaryBox label="Denied" value={analytics.denied_events} color="text-rose-500" />
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Calendar className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold">Recent Events</h2>
          </div>
          <button
            onClick={() => router.push('/dashboard/org/my-event')}
            className="text-xs font-semibold text-gray-500 hover:text-white flex items-center gap-1 transition-colors group"
          >
            View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <Calendar className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No events found</p>
            <p className="text-gray-600 text-sm mt-1">Start by creating your first event</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvents.map(event => (
              <div
                key={event.event_id}
                onClick={() => router.push(`/dashboard/org/my-event/${event.event_id}`)}
                className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group cursor-pointer shadow-lg"
              >
                {/* Event Cover Image */}
                <div className="h-40 relative overflow-hidden bg-white/5">
                   <img
                      src={event.image || "/api/placeholder/400/200"}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentElement.innerHTML = '<div class="text-gray-600 font-bold text-xs">No cover image</div>';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                          event.pricing_type === 'free' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                       }`}>
                          {event.pricing_type}
                       </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold line-clamp-1 mb-1 group-hover:text-rose-500 transition-colors tracking-tight">{event.name}</h3>
                    <div className="flex items-center text-gray-400 text-xs gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <span className="text-rose-500">📍</span>
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex gap-4">
                        <div>
                           <p className="text-rose-500 font-bold text-sm">₦{(event.ticket_stats?.total_revenue || 0).toLocaleString()}</p>
                           <p className="text-[10px] text-gray-500 font-bold">Revenue</p>
                        </div>
                        <div>
                           <p className="text-blue-500 font-bold text-sm">{event.ticket_stats?.confirmed_tickets || 0}</p>
                           <p className="text-[10px] text-gray-500 font-bold">Sold</p>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-rose-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function StatCard({ label, value, icon, description, trend }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl shadow-lg hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        {trend && (
           <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full pulse">
             {trend}
           </div>
        )}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-gray-600 text-[10px] mt-1.5 font-medium">{description}</p>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, color }) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center group hover:bg-white/[0.04] transition-colors">
      <p className={`text-2xl font-black mb-1 ${color || 'text-white'}`}>{value || 0}</p>
      <p className="text-[10px] text-gray-500 font-bold">{label}</p>
    </div>
  );
}


