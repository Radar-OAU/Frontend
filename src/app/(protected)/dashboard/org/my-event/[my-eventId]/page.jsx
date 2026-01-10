"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../lib/axios";
import { ChevronLeft, Edit, Ticket, FileText, BarChart3, ArrowRight } from "lucide-react";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isMountedRef = useRef(true);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setError("Invalid event id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/events/${id}/details`);
      if (isMountedRef.current) setEvent(res?.data ?? null);
    } catch (err) {
      try {
        const fallback = await api.get("/organizer/events/");
        const list = Array.isArray(fallback.data)
          ? fallback.data
          : (fallback.data?.events ?? []);
        const found = list.find(
          (e) => String(e.event_id ?? e.id) === String(id)
        );
        if (isMountedRef.current) {
          if (found) setEvent(found);
          else setError("Event not found");
        }
      } catch (inner) {
        if (isMountedRef.current) {
          setError(
            inner?.response?.data?.detail ||
            inner?.message ||
            "Failed to load event"
          );
        }
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchEvent();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchEvent]);

  const eventMeta = event
    ? [
      { label: "Date & Time", value: formattedDate(event.date) },
      { label: "Location", value: event.location || "TBD" },
      { label: "Capacity", value: event.capacity ?? "Unlimited" },
      {
        label: "Seat selection",
        value: event.allows_seat_selection ? "Enabled" : "Disabled",
      },
    ]
    : [];

  const ticketStats = event
    ? [
      {
        label: "Total tickets",
        value: event.ticket_stats?.total_tickets ?? 0,
      },
      {
        label: "Confirmed",
        value: event.ticket_stats?.confirmed_tickets ?? 0,
      },
      {
        label: "Pending",
        value: event.ticket_stats?.pending_tickets ?? 0,
      },
      {
        label: "Available",
        value: event.ticket_stats?.available_spots ?? "-",
      },
      {
        label: "Revenue",
        value: `₦${event.ticket_stats?.total_revenue ?? 0}`,
      },
    ]
    : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#05060a] to-black p-10 text-slate-100">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-slate-800 rounded" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-linear-to-b from-[#05060a] to-black p-10 text-slate-100">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded border border-slate-700"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold">{event.name}</h1>
          </div>
          <p className="text-gray-400 text-xs ml-9">
            {event.event_type} • <span className={event.pricing_type === 'paid' ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
              {event.pricing_type === "paid" ? "Paid Event" : "Free Event"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 ml-9 md:ml-0">
          <button
            onClick={() => router.push(`/dashboard/org/edit-event/${event.event_id ?? event.id}`)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 font-semibold text-xs"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Event
          </button>
          <button
            onClick={() => router.push(`/dashboard/org/events/${event.event_id ?? event.id}/tickets`)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl transition-all active:scale-95 font-semibold text-xs"
          >
            <Ticket className="w-3.5 h-3.5" /> Manage Tickets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0A] shadow-xl">
            <div className="h-64 sm:h-80 w-full relative">
              <img
                src={event.image || ""}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.classList.add('bg-white/5', 'flex', 'items-center', 'justify-center');
                  e.currentTarget.parentElement.innerHTML = '<div class="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#525252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image mx-auto mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-gray-500 text-xs uppercase font-bold">No Cover Image</span></div>';
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" /> Description
            </h2>
            <p className="text-gray-300 text-sm leading-loose whitespace-pre-line">
              {event.description || "No description provided."}
            </p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eventMeta.map((item) => (
              <div key={item.label} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-white font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 shadow-xl sticky top-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" /> Ticket Overview
            </h3>

            <div className="space-y-4">
              {ticketStats.map((stat) => (
                <div key={stat.label} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
                  <span className={`font-bold ${stat.label === 'Revenue' ? 'text-emerald-400' : 'text-white'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
                View Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
