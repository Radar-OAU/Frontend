"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../../lib/axios";
import toast from "react-hot-toast";
import useOrganizerStore from "../../../../../store/orgStore";
import Select from "@/components/ui/custom-select";
import Loading from "@/components/ui/Loading";
import { MapPin, Calendar, Camera, ImageIcon, Eye, X, ChevronDown } from "lucide-react";

const FALLBACK_EVENT_TYPES = [
  { value: "conference", label: "Conference" },
  { value: "concert", label: "Concert" },
  { value: "meetup", label: "Meetup" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export default function CreateEvent() {
  const router = useRouter();
  // const { triggerRefetch } = useOrganizerStore(); // triggerRefetch is not in the store definition
  const { addEvent } = useOrganizerStore();

  const [configLoading, setConfigLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState(FALLBACK_EVENT_TYPES);
  const [pricingTypes, setPricingTypes] = useState([
    { value: "free", label: "Free" },
    { value: "paid", label: "Paid" },
  ]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    pricing_type: "free",
    event_type: FALLBACK_EVENT_TYPES[0].value,
    location: "",
    date: "",
    capacity: "",
    price: "",
    allows_seat_selection: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch config (GET /config/) and populate eventTypes/pricingTypes.
  useEffect(() => {
    let mounted = true;
    async function loadConfig() {
      setConfigLoading(true);
      try {
        const res = await api.get("/config/");
        const data = res?.data || {};
        if (!mounted) return;
        if (Array.isArray(data.event_types) && data.event_types.length) {
          setEventTypes(data.event_types);
          setForm((f) => ({
            ...f,
            event_type: f.event_type || data.event_types[0].value,
          }));
        }
        if (Array.isArray(data.pricing_types) && data.pricing_types.length) {
          setPricingTypes(data.pricing_types);
          setForm((f) => ({
            ...f,
            pricing_type: f.pricing_type || data.pricing_types[0].value,
          }));
        }
      } catch {
        // fallback silently to defaults
      } finally {
        if (mounted) setConfigLoading(false);
      }
    }
    loadConfig();
    return () => (mounted = false);
    // api is stable (module import). Disable exhaustive-deps to avoid noisy warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview(null);
      return;
    }
    try {
      const url = URL.createObjectURL(imageFile);
      console.log("Image preview URL created:", url);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        console.log("Image preview URL revoked");
      };
    } catch (err) {
      console.error("Error creating image preview:", err);
      toast.error("Failed to preview image");
    }
  }, [imageFile]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file);
    
    if (!file) {
      console.log("No file selected");
      setImageFile(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      console.error("Invalid file type:", file.type);
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      console.error("File too large:", file.size);
      e.target.value = ''; // Reset input
      return;
    }

    console.log("Valid image file:", file.name, file.type, file.size);
    setImageFile(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!["paid", "free"].includes(form.pricing_type))
      e.pricing_type = "Invalid pricing type";
    if (!form.event_type) e.event_type = "Event type is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.date) e.date = "Date & time is required";
    if (form.pricing_type === "paid") {
      if (!form.price || Number(form.price) <= 0)
        e.price = "Price must be greater than 0";
    }
    // length checks per docs
    if (form.name && form.name.length > 200)
      e.name = "Name must be ≤ 200 characters";
    if (form.location && form.location.length > 200)
      e.location = "Location must be ≤ 200 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      pricing_type: pricingTypes[0]?.value || "free",
      event_type: eventTypes[0]?.value || FALLBACK_EVENT_TYPES[0].value,
      location: "",
      date: "",
      capacity: "",
      price: "",
      allows_seat_selection: false,
    });
    setImageFile(null);
    setPreview(null);
    setErrors({});
    setServerError("");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);

    const isoDate = new Date(form.date).toISOString();

    const sanitized = {
      name: String(form.name),
      description: String(form.description),
      pricing_type: String(form.pricing_type),
      event_type: String(form.event_type),
      location: String(form.location),
      date: isoDate,
      capacity:
        form.capacity !== "" && form.capacity != null
          ? String(Number(form.capacity))
          : "",
      price:
        form.pricing_type === "paid"
          ? String(Number(form.price))
          : "0.00",
      allows_seat_selection: String(Boolean(form.allows_seat_selection)),
      status: "draft",
    };

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("pricing_type", form.pricing_type);
      formData.append("event_type", form.event_type);
      formData.append("location", form.location.trim());

      // convert local datetime input to ISO with Z (server expects ISO 8601)
      // if user already provided an ISO string, this will still produce a valid ISO
      const isoDate = form.date ? new Date(form.date).toISOString() : "";
      formData.append("date", isoDate);

      if (form.capacity !== "" && form.capacity !== null) {
        // ensure integer
        formData.append("capacity", parseInt(form.capacity, 10));
      }
      // price required for paid; for free set 0.00 per docs
      if (form.pricing_type === "paid") {
        formData.append("price", parseFloat(form.price));
      } else {
        // append price 0 for free events (server may require)
        formData.append("price", 0.0);
      }

      formData.append(
        "allows_seat_selection",
        form.allows_seat_selection ? "true" : "false"
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.post("/event/", formData);

      if (res && res.status >= 200 && res.status < 300) {
        toast.success("Event created successfully");
        // triggerRefetch(); 
        resetForm();
        router.push('/dashboard/org/my-event');
      } else {
        setServerError(`Unexpected server response: ${res?.status}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err?.message ||
        "Failed to create event";
      setServerError(msg);
      console.error("Create event error:", err?.response || err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = (iso) => {
    if (!iso) return "TBD";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  if (configLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">
            Create Event
          </h1>
          <p className="text-gray-400 text-xs">Fill in event details. <span className="text-rose-500">*</span> required.</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-gray-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={submit} className="space-y-6" noValidate>
            {serverError && (
              <div className="rounded-xl bg-rose-900/20 border border-rose-800/50 p-4 text-rose-200 text-xs font-medium">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Summer Tech Conference 2024"
                className={`w-full bg-white/5 border ${errors.name ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-rose-500'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                placeholder="What to expect, schedule, speakers..."
                className={`w-full bg-white/5 border ${errors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-rose-500'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all min-h-[120px] resize-y`}
              />
              {errors.description && <p className="text-[10px] text-rose-500 font-bold">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pricing <span className="text-rose-500">*</span>
                </label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  {pricingTypes.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, pricing_type: p.value, price: p.value === "free" ? "" : s.price }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${form.pricing_type === p.value ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Event Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.event_type}
                    onChange={(e) => {
                      setForm(s => ({ ...s, event_type: e.target.value }));
                      setErrors(p => ({ ...p, event_type: undefined }));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value} className="bg-neutral-900">{type.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Location <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={form.location}
                    onChange={handleChange("location")}
                    placeholder="Venue address or online link"
                    className={`w-full pl-10 bg-white/5 border ${errors.location ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-rose-500'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all`}
                  />
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
                {errors.location && <p className="text-[10px] text-rose-500 font-bold">{errors.location}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={handleChange("date")}
                  className={`w-full bg-white/5 border ${errors.date ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-rose-500'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all [color-scheme:dark]`}
                />
                {errors.date && <p className="text-[10px] text-rose-500 font-bold">{errors.date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange("capacity")}
                  placeholder="Unlimited"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Price {form.pricing_type === "paid" && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange("price")}
                    placeholder="0.00"
                    disabled={form.pricing_type === "free"}
                    className={`w-full pl-8 bg-white/5 border ${errors.price ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-rose-500'} rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.price && <p className="text-[10px] text-rose-500 font-bold">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Cover Image {imageFile && <span className="text-rose-500">• Selected: {imageFile.name}</span>}
                </label>
                
                {!preview ? (
                  <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-2xl hover:border-rose-500/50 hover:bg-rose-500/5 transition-all h-32 flex flex-col items-center justify-center text-center">
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="pointer-events-none flex flex-col items-center">
                      <Camera className="w-8 h-8 mb-2 text-gray-500 group-hover:text-rose-400 transition-colors" />
                      <span className="text-xs text-gray-500 group-hover:text-rose-400 font-medium">Click to upload cover image</span>
                      <span className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 5MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 group">
                    <img 
                      src={preview} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                      onLoad={() => console.log("Preview image loaded successfully")}
                      onError={(e) => {
                        console.error("Preview image failed to load");
                        toast.error("Failed to display image preview");
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="image-upload-change"
                        className="bg-white/90 hover:bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Change
                      </label>
                      <input
                        id="image-upload-change"
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.preventDefault();
                          setImageFile(null); 
                          setPreview(null);
                          // Reset both file inputs
                          const inputs = document.querySelectorAll('input[type="file"]');
                          inputs.forEach(input => input.value = '');
                        }}
                        className="bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={form.allows_seat_selection}
                    onChange={handleChange("allows_seat_selection")}
                    id="seat-selection"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 checked:border-rose-500 checked:bg-rose-500 transition-all"
                  />
                  <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <label htmlFor="seat-selection" className="text-sm text-gray-300 font-medium cursor-pointer select-none">
                  Enable seat selection for this event
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </form>
        </section>

        {/* Live Preview Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Eye className="w-4 h-4 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold">Live Preview</h2>
          </div>

          {/* Preview Card */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-48 relative overflow-hidden bg-white/5">
              {(preview || imageFile) ? (
                <img src={preview} alt="poster" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase tracking-wider">No Cover Image</span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md border ${form.pricing_type === 'free'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                  {form.pricing_type === 'paid' ? 'PAID' : 'FREE'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold line-clamp-2 leading-tight">
                  {form.name || "Untitled Event"}
                </h3>
                <p className="text-rose-500 text-xs font-bold mt-2 uppercase tracking-wider">
                  {eventTypes.find((t) => t.value === form.event_type)?.label || form.event_type || "Event Type"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate(form.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{form.location || "Location TBD"}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                {form.description || "Description will appear here..."}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Price</p>
                  <p className="text-white font-bold text-lg">
                    {form.pricing_type === 'paid' && form.price ? `₦${form.price}` : 'Free'}
                  </p>
                </div>
                <button disabled className="px-4 py-2 bg-white/5 text-gray-500 rounded-lg text-xs font-bold cursor-default">
                  Get Tickets
                </button>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 text-xs text-rose-300 font-medium text-center">
            Values update in real-time as you type.
          </div>
        </section>
      </div>
    </div>
  );
}
