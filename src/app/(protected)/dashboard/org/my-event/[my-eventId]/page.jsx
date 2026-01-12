"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../lib/axios";
import { Copy, ArrowLeft, ChevronLeft, FileText, BarChart3, ArrowRight, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../../../../lib/utils";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMountedRef = useRef(true);

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const handleCopyLink = () => {
    if (!event) return;
    const link = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const fetchEvent = useCallback(async () => {
    if (!id) {
      toast.error("Invalid event id");
      setLoading(false);
      return;
    }

    setLoading(true);

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
          else toast.error("Event not found");
        }
      } catch (inner) {
        if (isMountedRef.current) {
          toast.error(
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
        value: (event.ticket_stats?.total_tickets ?? 0).toLocaleString(),
      },
      {
        label: "Confirmed",
        value: (event.ticket_stats?.confirmed_tickets ?? 0).toLocaleString(),
      },
      {
        label: "Pending",
        value: (event.ticket_stats?.pending_tickets ?? 0).toLocaleString(),
      },
      {
        label: "Available",
        value: event.ticket_stats?.available_spots ?? "-",
      },
      {
        label: "Revenue",
        value: `₦${(event.ticket_stats?.total_revenue ?? 0).toLocaleString()}`,
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

  {/* Error handling moved to toasts */ }

  if (!event) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push(
                `/dashboard/org/edit-event/${event.event_id ?? event.id}`
              )
            }
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700  text-white"
          >
            Edit
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-white/5 border border-slate-700 text-slate-100 hover:bg-slate-800 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={() => router.push(`/dashboard/org/my-event/${event.event_id ?? event.id}/tickets`)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-slate-700 text-slate-100 hover:bg-slate-800 flex items-center gap-2"
          >
            <Ticket className="h-4 w-4" />
            Manage Tickets
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left */}
        <section className="lg:col-span-2 space-y-8">
          <div className="h-96 rounded-2xl overflow-hidden bg-slate-800">
            <img
              src={getImageUrl(event.image)}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "")}
            />
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
        </section>

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
