"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../../../../lib/axios";
import { 
  ArrowLeft, 
  Users, 
  Ticket, 
  Search, 
  Download, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/components/ui/Loading";

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.["my-eventId"] ?? params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/tickets/organizer/${id}/tickets/`);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredTickets = data?.tickets?.filter(t => 
    t.student_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ticket_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Loading />
      <p className="text-gray-500 text-sm mt-4 animate-pulse uppercase tracking-[0.2em] font-black">Analyzing Data...</p>
    </div>
  );

  if (!data) return null;

  const stats = [
    { label: "Total Bookings", value: data.count, icon: <Ticket className="w-5 h-5 text-rose-500" />, sub: "Confirmed & Pending" },
    { label: "Attendees", value: data.statistics?.used || 0, icon: <UserCheck className="w-5 h-5 text-emerald-500" />, sub: "Checked In" },
    { label: "Revenue", value: `₦${data.statistics?.total_revenue?.toLocaleString() || 0}`, icon: <TrendingUp className="w-5 h-5 text-blue-500" />, sub: "Gross Earnings" },
    { label: "Pending", value: data.statistics?.pending || 0, icon: <CreditCard className="w-5 h-5 text-amber-500" />, sub: "Awaiting Payment" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Event
          </button>
          <h1 className="text-3xl md:text-4xl font-black">{data.event_name}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-rose-500" /> Detailed Analytics & Attendee List
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-2xl transition-all active:scale-95 font-bold text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                {s.icon}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black">{s.value}</h3>
              <p className="text-[10px] text-gray-600 font-medium">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendee Table Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold">Attendee List</h2>
            <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-500">
              {filteredTickets.length} RESULT{filteredTickets.length !== 1 ? 'S' : ''}
            </span>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-rose-500 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Attendee</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Ticket ID</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Quantity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? filteredTickets.map((t, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-xs font-black text-rose-500 border border-rose-500/20 uppercase">
                          {t.student_full_name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold group-hover:text-rose-500 transition-colors">{t.student_full_name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{t.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono text-gray-400">{t.ticket_id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold">{t.quantity}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        t.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        t.status === 'used' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-500 font-medium">
                        {t.checked_in_at ? new Date(t.checked_in_at).toLocaleString() : 'Not Checked In'}
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center space-y-3">
                      <Users className="w-10 h-10 text-gray-800 mx-auto" />
                      <p className="text-gray-500 font-medium">No attendees found matching your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
