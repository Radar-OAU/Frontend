"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import { Loader2, Calendar, MapPin, Plus } from "lucide-react";

const MyEvent = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const isMountedRef = useRef(true);

  const fetchEvents = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await api.get("/organizer/events/");
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.events)) list = payload.events;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else list = [];
      if (isMountedRef.current) setEvents(list);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to load events";
      if (isMountedRef.current) setServerError(msg);
      console.error("Error fetching events:", msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvents();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvents]);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };



  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Your Events
          </h1>
          <p className="text-gray-400 text-xs">Manage events and view ticket stats.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/org/create-event")}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 font-semibold text-xs"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
          <button
            onClick={fetchEvents}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl transition-all active:scale-95 font-semibold text-xs"
          >
            Refresh
          </button>
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl bg-rose-900/20 border border-rose-800/50 p-4 text-rose-200 text-xs font-medium">
          {serverError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="animate-spin h-8 w-8 text-rose-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl py-24 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 font-bold">No events found</p>
          <p className="text-gray-600 text-sm mt-1 mb-6">Start by creating your first event</p>
          <button
            onClick={() => router.push("/dashboard/org/create-event")}
            className="text-rose-500 hover:text-rose-400 font-bold text-sm"
          >
            Create New Event &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const id = ev.event_id ?? ev.id;
            return (
              <article
                key={id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/org/my-event/${id}`)}
                className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl hover:shadow-rose-900/5 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-white/5">
                  <img
                    src={ev.image || null}
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                      // e.currentTarget.parentElement.innerHTML = '<span class="text-4xl">🖼️</span>';
                      // We can't render a React component into innerHTML easily without ReactDOM.render
                      // So we'll just leave it empty or use a simple unicode fallback if strictly needed,
                      // BUT better way is to conditionally render in React. 
                      // Since we are inside onError, lets just hide the img and show a backup div via state? 
                      // For now, let's just make sure we don't break. 
                      // The previous code was replacing innerHTML with emoji. 
                      // I will replace it with a text fallback or I should refactor to use state for smoother icon handling.
                      // Given I'm doing find-replace, I'll stick to innerHTML but use a font-awesome class or just text? 
                      // Wait, I can't inject a Lucide component via innerHTML string.
                      // I will use a simple workaround: If error, I'll just use a generic placeholder image URL or keep the span but use an SVG string.
                      // Let's use a simple SVG string for the icon.
                      e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${ev.pricing_type === 'free'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                      {ev.pricing_type === 'paid' && ev.price ? `₦${ev.price}` : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        {(ev.event_type && ev.event_type.replace('_', ' ')) || "Event"}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {formattedDate(ev.date).split(',')[0]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-rose-500 transition-colors">
                      {ev.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{ev.location || "Online"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {ev.description || "No description provided."}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Sold</p>
                      <p className="text-white font-bold">{ev.ticket_stats?.confirmed_tickets ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Pending</p>
                      <p className="text-white font-bold">{ev.ticket_stats?.pending_tickets ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Revenue</p>
                      <p className="text-emerald-400 font-bold">₦{ev.ticket_stats?.total_revenue ?? 0}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvent;
