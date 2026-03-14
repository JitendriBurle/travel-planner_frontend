import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/api/api";
import { fetchPackingLists } from "@/api/packingApi";
import { fetchExpenses } from "@/api/expenseApi";
import { fetchDocuments } from "@/api/documentApi";
import { fetchReminders } from "@/api/reminderApi";
import { fetchReviews } from "@/api/reviewApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { getWeather, getWeatherForecast } from "@/lib/weather";
import { getDestinationImage } from "@/lib/unsplash";

import {
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  MapPin,
  Plane,
  Hotel,
  Camera,
  CloudSun,
  Droplets,
  Wind,
  Download,
  Check,
  Bell,
  MessageSquare,
  Package,
  FileText,
  Utensils,
  ShoppingBag,
  Music,
  ChevronUp,
  ChevronDown,
  Edit2,
  Share2,
  Mail,
  MessageCircle,
  Copy,
  ExternalLink
} from "lucide-react";

import { toast } from "sonner";

import TripMap from "@/components/TripMap";
import TripExpenses from "@/components/trip/TripExpenses";
import TripDocuments from "@/components/trip/TripDocuments";
import TripPacking from "@/components/trip/TripPacking";
import TripReminders from "@/components/trip/TripReminders";
import TripReviews from "@/components/trip/TripReviews";

const activityIcons = {
  flight: Plane,
  hotel: Hotel,
  activity: Camera,
  transport: MapPin,
  dining: Utensils,
  shopping: ShoppingBag,
  nightlife: Music,
};

const ItineraryDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const itineraryRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(null);

  const [tab, setTab] = useState("itinerary");
  const [showAdd, setShowAdd] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [offline, setOffline] = useState(!navigator.onLine);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationResults, setLocationResults] = useState([]);

  const [form, setForm] = useState({
    type: "activity",
    title: "",
    time: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  /* ONLINE OFFLINE DETECTION */
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  /* LOAD TRIP */
  useEffect(() => {
    const loadTrip = async () => {
      try {
        const res = await API.get(`/trips/${id}`);
        setTrip(res.data);
        localStorage.setItem(`trip-${id}`, JSON.stringify(res.data));
      } catch {
        const cached = localStorage.getItem(`trip-${id}`);
        if (cached) {
          setTrip(JSON.parse(cached));
          toast.info("Offline mode: showing cached trip");
        }
      }
    };

    const loadActivities = async () => {
      try {
        const res = await API.get(`/activities/${id}`);
        setActivities(res.data || []);
        localStorage.setItem(`activities-${id}`, JSON.stringify(res.data));
      } catch {
        const cached = localStorage.getItem(`activities-${id}`);
        if (cached) {
          setActivities(JSON.parse(cached));
        }
      }
    };

    if (user && id && id !== "undefined") {
      loadTrip();
      loadActivities();
    }
  }, [id, user]);

  /* WEATHER + HERO IMAGE */
  useEffect(() => {
    if (!trip) return;

    const loadWeather = async () => {
      setWeatherLoading(true);
      const [current, future] = await Promise.all([
        getWeather(trip.destination),
        getWeatherForecast(trip.destination)
      ]);
      setWeather(current);
      setForecast(future || []);
      setWeatherLoading(false);
    };

    const loadImage = async () => {
      const img = await getDestinationImage(trip.destination);
      setHeroImage(img);
    };

    loadWeather();
    loadImage();
  }, [trip]);

  if (!trip) return null;

  /* DATE CALCULATIONS */
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const statusEnd = new Date(end);
  statusEnd.setHours(23, 59, 59, 999);
  
  const tripStatus = start > now ? "Upcoming Trip" : statusEnd < now ? "Completed Trip" : "Active Trip";
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) + 1;
  const dayList = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayActivities = activities
    .filter((a) => a.day === selectedDay)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  /* ADD ACTIVITY */
  const addActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        trip_id: trip.id,
        day: selectedDay,
        title: form.title,
        time: form.time || null,
        location: form.location || null,
        type: form.type || "activity",
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      };

      if (editingActivity) {
        const res = await API.put(`/activities/${editingActivity.id}`, payload);
        setActivities(activities.map(a => a.id === editingActivity.id ? res.data : a));
        setEditingActivity(null);
        toast.success("Activity updated");
      } else {
        const res = await API.post("/activities", payload);
        setActivities([...activities, res.data]);
        toast.success("Activity added");
      }
      
      setShowAdd(false);
      setForm({
        type: "activity",
        title: "",
        time: "",
        location: "",
        latitude: "",
        longitude: "",
      });
    } catch {
      toast.error(editingActivity ? "Update failed" : "Failed to add activity");
    }
  };

  /* DELETE ACTIVITY */
  const deleteActivity = async (actId) => {
    try {
      await API.delete(`/activities/${actId}`);
      setActivities(activities.filter((a) => a.id !== actId));
      toast.success("Activity removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* EDIT ACTIVITY */
  const startEdit = (act) => {
    setEditingActivity(act);
    setForm({
      type: act.type || "activity",
      title: act.title,
      time: act.time || "",
      location: act.location || "",
      latitude: act.latitude || "",
      longitude: act.longitude || "",
    });
    setShowAdd(true);
  };

  /* MOVE ACTIVITY */
  const moveActivity = async (idx, direction) => {
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= dayActivities.length) return;

    const list = [...activities];
    const currentAct = dayActivities[idx];
    const targetAct = dayActivities[newIdx];

    // Find their indices in the main activities list
    const realIdx1 = list.findIndex(a => a.id === currentAct.id);
    const realIdx2 = list.findIndex(a => a.id === targetAct.id);

    // Swap times
    const tempTime = list[realIdx1].time;
    list[realIdx1].time = list[realIdx2].time;
    list[realIdx2].time = tempTime;

    setActivities([...list]);
    
    // Persist to backend
    try {
      await Promise.all([
        API.put(`/activities/${list[realIdx1].id}`, list[realIdx1]),
        API.put(`/activities/${list[realIdx2].id}`, list[realIdx2])
      ]);
      toast.success("Order saved");
    } catch {
      toast.error("Failed to save new order");
      loadActivities(); // Reload to sync back
    }
  };

  const handleLocationSearch = async (val) => {
    setForm({ ...form, location: val });
    if (val.length < 3) {
      setLocationResults([]);
      return;
    }
    setLocationSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`);
      const data = await res.json();
      setLocationResults(data);
    } catch {
      setLocationResults([]);
    } finally {
      setLocationSearching(false);
    }
  };

  const selectLocation = (loc) => {
    setForm({
      ...form,
      location: loc.display_name.split(',')[0],
      latitude: parseFloat(loc.lat),
      longitude: parseFloat(loc.lon)
    });
    setLocationResults([]);
  };

  /* MAP MARKERS */
  const mapMarkers = activities
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      lat: a.latitude,
      lng: a.longitude,
      title: a.title,
    }));

  const shareVia = async (platform) => {
    try {
      let token = trip.share_token;
      
      // If no token, generate one
      if (!token) {
        const res = await API.post(`/share/${trip.id}`);
        token = res.data.token;
        // Update local trip state with the new token
        setTrip(prev => ({ ...prev, share_token: token }));
      }

      const shareUrl = `${window.location.origin}/shared/${token}`;
      const text = `Check out my trip to ${trip.destination}: ${trip.name}`;
      
      if (platform === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank");
      } else if (platform === "email") {
        window.location.href = `mailto:?subject=${encodeURIComponent(trip.name)}&body=${encodeURIComponent(text + "\n" + shareUrl)}`;
      } else if (platform === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Public link copied to clipboard");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      toast.error("Could not generate share link");
    }
  };

  const generatePDF = async () => {
    const element = itineraryRef.current;
    if (!element) return;

    toast.loading("Generating PDF...", { id: "pdf-gen" });
    try {
      // Temporarily hide elements that shouldn't be in PDF
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#F8FAFC"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${trip.name.replace(/\s+/g, "_")}_Itinerary.pdf`);
      toast.success("PDF Downloaded!", { id: "pdf-gen" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf-gen" });
    }
  };

  const downloadOffline = async () => {
    toast.loading("Syncing for offline access...", { id: "offline-sync" });
    try {
      const [packRes, expRes, docRes, remRes, revRes] = await Promise.all([
        fetchPackingLists(trip.id),
        fetchExpenses(trip.id),
        fetchDocuments(trip.id),
        fetchReminders(trip.id),
        fetchReviews(trip.id)
      ]);

      localStorage.setItem(`trip-${id}`, JSON.stringify(trip));
      localStorage.setItem(`activities-${id}`, JSON.stringify(activities));
      localStorage.setItem(`packing-${id}`, JSON.stringify(packRes.data || []));
      localStorage.setItem(`expenses-${id}`, JSON.stringify(expRes.data || []));
      localStorage.setItem(`documents-${id}`, JSON.stringify(docRes.data || []));
      localStorage.setItem(`reminders-${id}`, JSON.stringify(remRes.data || []));
      localStorage.setItem(`reviews-${id}`, JSON.stringify(revRes.data || []));
      
      await generatePDF();
      toast.success("Offline access ready!", { id: "offline-sync" });
    } catch {
      toast.error("Sync failed", { id: "offline-sync" });
    }
  };


  return (
    <div ref={itineraryRef} className="min-h-screen bg-background">
      {/* HERO HEADER */}
      <div className="relative h-[300px] sm:h-[420px] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            className="absolute inset-0 w-full h-full object-cover scale-105"
            alt={trip.destination}
          />
        ) : (
          <div className="absolute inset-0 gradient-primary" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-black/20 to-black/40" />

        <div className="relative h-full container mx-auto px-6 flex flex-col justify-end pb-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute top-4 sm:top-8 left-4 sm:left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium bg-black/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl group text-sm sm:text-base border border-white/10"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="max-w-3xl animate-slide-up">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="bg-primary/20 backdrop-blur-md border border-white/20 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-xl">
                {tripStatus}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
              {trip.name}
            </h1>

            <div className="flex flex-wrap gap-4 sm:gap-8 text-white/90">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <MapPin size={16} className="sm:size-[20px] text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">Destination</p>
                  <p className="font-bold text-sm sm:text-base md:text-lg">{trip.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <Clock size={16} className="sm:size-[20px] text-primary-foreground" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">Duration</p>
                  <p className="font-bold text-sm sm:text-base md:text-lg">{trip.start_date} — {trip.end_date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-10 pb-20">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* NAVIGATION & BUTTONS */}
              <div className="glass-card p-2 sm:p-4 rounded-2xl sm:rounded-[2rem] border border-white/40 shadow-travel">
                <div className="grid grid-cols-4 lg:grid-cols-1 gap-1 sm:gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                  {[
                    { id: "itinerary", icon: Clock, label: "Itinerary" },
                    { id: "map", icon: MapPin, label: "Map" },
                    { id: "expenses", icon: FileText, label: "Expenses" },
                    { id: "packing", icon: Package, label: "Packing" },
                    { id: "docs", icon: FileText, label: "Documents" },
                    { id: "reminders", icon: Bell, label: "Alerts" },
                    { id: "reviews", icon: MessageSquare, label: "Reviews" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`flex flex-col lg:flex-row items-center gap-1 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group ${
                        tab === item.id 
                          ? "gradient-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 opacity-80" />
                      <span className="font-bold text-[9px] sm:text-[10px] lg:text-sm whitespace-nowrap">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border/50 px-2">
                  <div className="flex flex-col gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <div className="relative">
                      <button 
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className={`w-full btn-saas-secondary py-3 px-4 rounded-xl flex items-center justify-between gap-2 transition-all duration-300 ${
                          showShareMenu ? "bg-primary/10 border-primary text-primary shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Share2 size={16} />
                          <span className="font-bold text-xs sm:text-sm">Trip Share</span>
                        </div>
                        {showShareMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {showShareMenu && (
                        <div className="absolute top-full left-0 mt-3 w-48 sm:w-56 bg-card glass-card rounded-xl p-1.5 border border-white/60 shadow-2xl z-[100] animate-scale-in origin-top-left">
                          <button 
                            onClick={() => { shareVia("whatsapp"); setShowShareMenu(false); }}
                            className="w-full p-3 text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all flex items-center gap-3 group/share"
                          >
                            <MessageCircle size={16} className="text-primary/70 group-hover/share:text-primary" />
                            <span className="text-xs sm:text-sm font-bold">WhatsApp</span>
                          </button>
                          <button 
                            onClick={() => { shareVia("email"); setShowShareMenu(false); }}
                            className="w-full p-3 text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all flex items-center gap-3 group/share"
                          >
                            <Mail size={16} className="text-primary/70 group-hover/share:text-primary" />
                            <span className="text-xs sm:text-sm font-bold">Email</span>
                          </button>
                          <button 
                            onClick={() => { shareVia("copy"); setShowShareMenu(false); }}
                            className="w-full p-3 text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-all flex items-center gap-3 group/share border-t border-border/50 mt-1"
                          >
                            <Copy size={16} className="text-primary/70 group-hover/share:text-primary" />
                            <span className="text-xs sm:text-sm font-bold">Copy Link</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={downloadOffline}
                      className="w-full btn-saas-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* WEATHER WIDGET */}
              <div className="glass-card p-6 rounded-[2rem] border border-white/40 overflow-hidden relative group">
                <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                  <CloudSun size={14} className="text-primary" /> Weather Forecast
                </h3>
                
                {weatherLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-muted rounded-xl w-1/2" />
                    <div className="h-4 bg-muted rounded-xl w-3/4" />
                  </div>
                ) : weather ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-display font-extrabold text-foreground">{weather.temp}°</span>
                        <span className="text-sm font-bold text-muted-foreground mb-1">CELSIUS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/40 p-3 rounded-2xl border border-white/60">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Humidity</p>
                          <p className="font-bold text-foreground">{weather.humidity}%</p>
                        </div>
                        <div className="bg-white/40 p-3 rounded-2xl border border-white/60">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Wind</p>
                          <p className="font-bold text-foreground">{weather.windSpeed} km/h</p>
                        </div>
                      </div>
                    </div>

                    {/* 5-DAY FORECAST (Skipping today to avoid redundancy) */}
                    {forecast && forecast.length > 1 && (
                      <div className="pt-6 border-t border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Upcoming Forecast</h4>
                        <div className="space-y-2">
                          {forecast.slice(1, 5).map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white/30 rounded-xl border border-white/40 hover:bg-white/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{f.iconEmoji || "☀️"}</span>
                                <div>
                                  <p className="text-[10px] font-bold text-foreground uppercase">
                                    {new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{f.condition}</p>
                                </div>
                              </div>
                              <span className="font-bold text-foreground text-sm">{f.temp}°</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Weather info unavailable</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN CONTENT */}
          <div className="lg:col-span-9">
            {tab === "itinerary" && (
              <div className="animate-fade-in space-y-8">
                {/* DAY SELECTOR */}
                <div className="bg-white/50 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/40 shadow-sm flex gap-2 overflow-x-auto scrollbar-hide">
                  {dayList.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(i)}
                      className={`flex-shrink-0 min-w-[100px] px-6 py-4 rounded-[2rem] transition-all duration-300 ${
                        selectedDay === i 
                          ? "bg-white shadow-xl text-primary border border-primary/10" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Day</p>
                      <p className="text-xl font-display font-extrabold">{i + 1}</p>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">
                    Day {selectedDay + 1} Plan
                  </h2>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="btn-saas-primary py-3.5 sm:py-4 self-start sm:self-auto"
                  >
                    <Plus size={18} /> Plan Activity
                  </button>
                </div>

                {/* ACTIVITIES LIST */}
                <div className="relative pl-8 border-l-2 border-dashed border-primary/20 space-y-6">
                  {dayActivities.length === 0 ? (
                    <div className="bg-white/40 border-2 border-dashed border-border rounded-[2.5rem] py-16 text-center">
                      <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Camera className="h-8 w-8 text-primary/40" />
                      </div>
                      <p className="text-muted-foreground font-bold italic">No activities planned yet. What's the plan for today?</p>
                    </div>
                  ) : (
                    dayActivities.map((a, idx) => {
                      const Icon = activityIcons[a.type] || Camera;
                      return (
                        <div key={a.id} className="relative animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="absolute -left-[41px] top-6 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-lg z-10" />
                          <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group hover:shadow-2xl hover:bg-white transition-all duration-500">
                            <div className="flex gap-4 sm:gap-6 items-center">
                              <div className="h-10 w-10 sm:h-14 sm:w-14 gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform flex-shrink-0">
                                <Icon size={20} className="sm:size-[24px]" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded">
                                    {a.time || "OPEN TIME"}
                                  </span>
                                </div>
                                <h4 className="text-lg sm:text-2xl font-display font-bold text-foreground truncate">{a.title}</h4>
                                {a.location && (
                                  <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                                    <MapPin size={12} className="sm:size-[14px] text-primary" /> {a.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1 items-center justify-end sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 border-border/50 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                              <div className="flex items-center gap-1 mr-2 sm:border-r sm:pr-2 border-border/50">
                                <button 
                                  onClick={() => moveActivity(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 sm:p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <button 
                                  onClick={() => moveActivity(idx, 'down')}
                                  disabled={idx === dayActivities.length - 1}
                                  className="p-1 sm:p-1.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>

                              <button
                                onClick={() => startEdit(a)}
                                className="p-2 sm:p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl sm:rounded-2xl transition-all"
                              >
                                <Edit2 size={16} className="sm:size-[20px]" />
                              </button>

                              <button
                                onClick={() => deleteActivity(a.id)}
                                className="p-2 sm:p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl sm:rounded-2xl transition-all"
                              >
                                <Trash2 size={16} className="sm:size-[20px]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {tab === "expenses" && <TripExpenses tripId={trip.id} trip={trip} />}
            {tab === "packing" && <TripPacking tripId={trip.id} />}
            {tab === "docs" && <TripDocuments tripId={trip.id} />}
            {tab === "reminders" && <TripReminders tripId={trip.id} />}
            {tab === "reviews" && <TripReviews tripId={trip.id} />}
            {tab === "map" && (
              <div className="glass-card rounded-[3rem] overflow-hidden border border-white/60 shadow-2xl h-[700px]">
                <TripMap markers={mapMarkers} destination={trip.destination} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD ACTIVITY MODAL */}
      {showAdd && (
        <div 
          className="fixed inset-0 bg-foreground/10 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
          onClick={() => setShowAdd(false)}
        >
          <div 
            className="bg-card rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 max-w-xl w-full shadow-[0_32px_128px_rgba(0,0,0,0.15)] border border-white/40 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 sm:mb-10 text-center">
              <h2 className="text-2xl sm:text-4xl font-display font-extrabold mb-2 sm:mb-3">
                {editingActivity ? "Edit Activity" : "Add Activity"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {editingActivity ? "Update the details of this activity." : `Plan Day ${selectedDay + 1}.`}
              </p>
            </div>

            <form onSubmit={addActivity} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Activity Name</label>
                  <input
                    autoFocus
                    placeholder="e.g. Early Morning Hike at Table Mountain"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="input-saas text-lg py-4"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3 ml-2">Category / Type</label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {Object.keys(activityIcons).map(type => {
                      const Icon = activityIcons[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, type })}
                          className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all ${
                            form.type === type 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          <Icon size={16} className="sm:size-[20px]" />
                          <span className="text-[8px] sm:text-[10px] font-bold uppercase">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Estimated Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="input-saas"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Venue / Location</label>
                  <input
                    placeholder="Search location..."
                    value={form.location}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    className="input-saas"
                  />
                  {locationSearching && <div className="absolute right-3 top-[42px] animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
                  
                  {locationResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                      {locationResults.map((loc, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectLocation(loc)}
                          className="w-full text-left px-4 py-3 text-xs hover:bg-primary/5 transition-all border-b border-border/50 flex items-start gap-2 group"
                        >
                          <MapPin size={14} className="text-primary opacity-50 group-hover:opacity-100 mt-0.5" />
                          <div className="flex-1 truncate">
                            <span className="font-bold block text-foreground uppercase">{loc.display_name.split(',')[0]}</span>
                            <span className="text-[10px] text-muted-foreground block truncate">{loc.display_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-8">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn-saas-secondary flex-1 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl order-2 sm:order-1"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="btn-saas-primary flex-1 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl order-1 sm:order-2"
                >
                  {editingActivity ? "Update Activity" : "Add to Itinerary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetail;
