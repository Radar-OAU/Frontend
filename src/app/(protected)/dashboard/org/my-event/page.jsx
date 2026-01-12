"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import { Loader2, Copy, Check, ExternalLink, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../../../lib/utils";

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

  const handleCopyLink = (e, eventId) => {
    e.stopPropagation();
    const link = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-slate-800/60 p-10 text-center text-slate-400">
          <p className="text-lg font-semibold">No events yet</p>
          <p className="mt-2 text-sm">
            Create your first event to start selling tickets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => {
            const id = ev.event_id ?? ev.id;
            return (
              <article
                key={id}
                role="link"
                tabIndex={0}
                className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:bg-slate-900 shadow-sm hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-accent,#7c3aed)] group"
                aria-label={`Open event ${ev.name}`}
                onClick={() => router.push(`/dashboard/org/my-event/${id}`)}
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={getImageUrl(ev.image)}
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute left-4 bottom-3 text-white">
                    <h3 className="text-base font-semibold drop-shadow line-clamp-1">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-slate-200 mt-0.5 drop-shadow-sm flex items-center gap-1">
                      {ev.location || "TBD"}
                    </p>
                  </div>
                  <div className="absolute right-4 top-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                    {ev.pricing_type === "paid" && ev.price
                      ? `₦${parseFloat(ev.price).toLocaleString()}`
                      : "Free"}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 min-h-[160px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--sidebar-accent,#a78bfa)] uppercase tracking-wider mb-1">
                        {(ev.event_type && ev.event_type.replace('_', ' ')) || "Event"}
                      </p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        {formattedDate(ev.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyLink(e, id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                        title="Copy Public Ticket Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/events/${id}`, '_blank');
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                              title="Preview Public Page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button> */}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {ev.description || "No description provided."}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Sold</p>
                      <p className="text-white font-bold">{(ev.ticket_stats?.confirmed_tickets ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Pending</p>
                      <p className="text-white font-bold">{(ev.ticket_stats?.pending_tickets ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Revenue</p>
                      <p className="text-emerald-400 font-bold">₦{(ev.ticket_stats?.total_revenue ?? 0).toLocaleString()}</p>
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
