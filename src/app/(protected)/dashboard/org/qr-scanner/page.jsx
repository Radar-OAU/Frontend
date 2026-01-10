"use client"; // Validated import

import React, { useEffect, useState, useRef } from "react";
import { Camera, RotateCw, Trash2, CheckSquare, X, Check, AlertCircle, QrCode as QrIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import api from "@/lib/axios";

// Helper to play a success beep using Web Audio API
const playScanSound = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "success") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else {
      // Error sound (low buzz)
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function QrScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null); // { type: 'success' | 'error' | 'warning', message: string, detail: any }
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef(null);
  const regionId = "reader";

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/organizer/events/");
        const payload = res?.data;
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload?.events)) list = payload.events;
        else if (Array.isArray(payload?.data)) list = payload.data;
        else if (payload?.results && Array.isArray(payload.results)) list = payload.results;

        setEvents(list);
      } catch (err) {
        toast.error("Failed to load events.");
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first.");
      return;
    }

    if (scannerRef.current) {
      // Already running logic if needed, but usually we just resume or ignore
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: cameraFacingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          // aspectRatio: 1.0, // Removed to allow full container fill
        },
        (decodedText) => {
          // Success callback
          handleScan(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore mostly
        }
      );
      setIsScanning(true);
      setScanResult(null);
    } catch (err) {
      console.error("Failed to start scanner", err);
      toast.error("Could not start camera.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleSwitchCamera = async () => {
    await stopScanning();
    setCameraFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    // Restart logic is a bit complex immediately after stop, usually best to let user restart manually or use timeout
    // For specific requirement "Switch", we can try auto-restart
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  const handleScan = async (decodedText) => {
    if (isProcessing) return;

    // Pause scanning to process result
    if (scannerRef.current) {
      scannerRef.current.pause();
    }

    setIsProcessing(true);
    await processCheckIn(decodedText);
  };

  const processCheckIn = async (ticketId) => {
    // Basic validation
    if (!ticketId) {
      setScanResult({ type: "error", message: "Invalid QR Code" });
      playScanSound("error");
      resumeScanningDelay();
      return;
    }

    try {
      const response = await api.post("/tickets/check-in/", {
        ticket_id: ticketId,
        event_id: selectedEventId
      });

      // Success Logic
      const data = response.data;
      playScanSound("success");
      setScanResult({
        type: "success",
        message: "Check-in Successful",
        detail: data.ticket?.student_full_name || "Attendee Verified"
      });
      addToHistory({
        id: ticketId,
        status: "success",
        timestamp: new Date(),
        detail: data.ticket?.student_full_name
      });
      toast.success("Ticket Checked In!");

    } catch (err) {
      playScanSound("error");
      const errorMsg = err.response?.data?.error || "Check-in failed";

      let type = "error";
      if (errorMsg.toLowerCase().includes("already checked in")) {
        type = "warning";
      }

      setScanResult({
        type: type,
        message: type === "warning" ? "Already Checked In" : "Check-in Failed",
        detail: errorMsg
      });

      addToHistory({
        id: ticketId,
        status: type,
        timestamp: new Date(),
        detail: errorMsg
      });
    } finally {
      resumeScanningDelay();
    }
  };

  const resumeScanningDelay = () => {
    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null); // Clear overlay
      if (scannerRef.current) {
        scannerRef.current.resume();
      }
    }, 3000); // 3 seconds to read result
  };

  const addToHistory = (entry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (!selectedEventId) {
      toast.error("Select an event first");
      return;
    }
    processCheckIn(manualCode.trim());
    setManualCode("");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            QR Scanner
          </h1>
          <p className="text-gray-400 text-xs">Scan ticket QR codes for check-in.</p>
        </div>

        {/* Event Selector */}
        <div className="w-full md:w-72 relative">
          <select
            className="w-full appearance-none bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Select Event to Scan --</option>
            {events.map(ev => (
              <option key={ev.event_id || ev.id} value={ev.event_id || ev.id}>
                {ev.title || ev.name || "Unnamed Event"}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-1 shadow-2xl relative overflow-hidden group">
            <div className="rounded-xl overflow-hidden bg-black relative aspect-square md:aspect-video w-full">
              {/* Scanner Container */}
              <div id={regionId} className="w-full h-full"></div>

              {/* Placeholder when not scanning */}
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-10">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/10">
                      <QrIcon className="h-10 w-10 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Camera is inactive</p>
                      <p className="text-gray-600 text-xs mt-1">Select an event and start scanning</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Result Overlay */}
              {scanResult && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in zoom-in duration-200 ${scanResult.type === 'success' ? 'bg-emerald-500/20' :
                  scanResult.type === 'warning' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                  }`}>
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${scanResult.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                    scanResult.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                    }`}>
                    {scanResult.type === 'success' ? <Check className="h-12 w-12" /> :
                      scanResult.type === 'warning' ? <AlertCircle className="h-12 w-12" /> : <X className="h-12 w-12" />}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{scanResult.message}</h2>
                  <p className="text-white/90 font-medium text-lg drop-shadow-md">{scanResult.detail}</p>
                </div>
              )}

              {/* Scan Line Animation */}
              {isScanning && !scanResult && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-rose-500/50 rounded-lg relative overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_#e11d48] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!selectedEventId}
                className="col-span-2 md:col-span-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" /> Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="col-span-2 md:col-span-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5"
              >
                <X className="h-4 w-4" /> Stop Camera
              </button>
            )}

            <button
              onClick={handleSwitchCamera}
              disabled={!isScanning}
              className="bg-[#0A0A0A] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" /> Switch Cam
            </button>

            <button
              onClick={() => setHistory([])}
              className="bg-[#0A0A0A] border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Clear History
            </button>
          </div>
        </div>

        {/* Sidebar History */}
        <aside className="bg-[#0A0A0A] border border-white/5 rounded-2xl flex flex-col h-[600px] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-500" /> Recent Scans
              </h3>
              <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-60">
                <QrIcon className="w-12 h-12" />
                <p className="text-xs font-medium">No scans recorded yet</p>
              </div>
            ) : (
              history.map((scan, i) => (
                <div key={i} className={`p-3 rounded-xl border text-left transition-all hover:bg-white/[0.02] ${scan.status === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' :
                  scan.status === 'warning' ? 'border-amber-500/20 bg-amber-500/5' :
                    'border-rose-500/20 bg-rose-500/5'
                  }`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${scan.status === 'success' ? 'text-emerald-500' :
                      scan.status === 'warning' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                      {scan.status === 'success' ? 'Verified' : scan.status === 'warning' ? 'Warning' : 'Failed'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {scan.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-200 font-bold truncate leading-tight" title={scan.detail}>
                    {scan.detail || "Unknown User"}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate font-mono mt-1 opacity-70">
                    ID: {scan.id}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Manual Entry</label>
            <form onSubmit={handleManualVerify} className="flex gap-2">
              <input
                placeholder="Enter ticket code..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 rounded-xl bg-black/50 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
              />
              <button
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-50 transition-all active:scale-95"
                type="submit"
                disabled={isProcessing || !manualCode || !selectedEventId}
              >
                <Check className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}