import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDestinationImage } from "@/lib/unsplash";
import { fetchTrips, createTrip, removeTrip } from "@/api/tripApi";

import { Plus, MapPin, Calendar, Trash2, Eye, Plane, Search } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, upcoming, past
  const [previewImage, setPreviewImage] = useState(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [tripImages, setTripImages] = useState({});

  // LOAD TRIPS
  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await fetchTrips();
      setTrips(res.data || []);
    } catch (err) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTrips();
  }, [user]);

  // FETCH PREVIEW IMAGE FOR MODAL
  useEffect(() => {
    if (!form.destination || form.destination.length < 3) {
      setPreviewImage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingPreview(true);
      try {
        const img = await getDestinationImage(form.destination);
        setPreviewImage(img);
      } catch (err) {
        setPreviewImage(null);
      } finally {
        setIsFetchingPreview(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [form.destination]);

  // LOAD UNSPLASH IMAGES
  useEffect(() => {
    const loadImages = async () => {
      const images = {};

      for (const trip of trips) {
        if (!tripImages[trip.id]) {
          images[trip.id] = await getDestinationImage(trip.destination);
        }
      }

      if (Object.keys(images).length > 0) {
        setTripImages((prev) => ({ ...prev, ...images }));
      }
    };

    if (trips.length > 0) loadImages();
  }, [trips]);

  // CREATE TRIP
  const addTrip = async (e) => {
    e.preventDefault();

    try {
      await createTrip({
        name: form.name,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes,
      });

      toast.success("Trip created!");

      await loadTrips();

      setForm({
        name: "",
        destination: "",
        startDate: "",
        endDate: "",
        notes: "",
      });

      setPreviewImage(null);
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to create trip");
    }
  };

  // DELETE TRIP
  const deleteTrip = async (id) => {
    try {
      await removeTrip(id);

      setTrips((prev) => prev.filter((trip) => trip.id !== id));

      toast.success("Trip deleted");
    } catch (err) {
      toast.error("Failed to delete trip");
    }
  };

  const now = new Date();
  
  const filteredTrips = trips.filter(trip => {
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    
    // Search filter
    const title = trip.title || "";
    const destination = trip.destination || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === "upcoming") return tripStart > now;
    if (statusFilter === "past") return tripEnd < now;
    if (statusFilter === "active") return tripStart <= now && tripEnd >= now;
    
    return true;
  });

  const upcomingCount = trips.filter((t) => new Date(t.start_date) > now).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        
        {/* ANALYTICS PREVIEW */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-16 animate-fade-in">
            <div className="glass-card p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/60 shadow-travel group hover:shadow-2xl transition-all duration-500">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Total Trips</p>
               <div className="flex items-end gap-2">
                 <h4 className="text-4xl lg:text-5xl font-display font-black text-foreground">{trips.length}</h4>
                 <span className="text-xs font-bold text-primary mb-1.5 lg:mb-2 italic">Trips</span>
               </div>
            </div>
            <div className="glass-card p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/60 shadow-travel group hover:shadow-2xl transition-all duration-500">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Upcoming</p>
               <div className="flex items-end gap-2">
                 <h4 className="text-4xl lg:text-5xl font-display font-black text-foreground">{upcomingCount}</h4>
                 <span className="text-xs font-bold text-primary mb-1.5 lg:mb-2 italic">Trips</span>
               </div>
            </div>
            <div className="glass-card p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/60 shadow-travel group hover:shadow-2xl transition-all duration-500">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Destinations</p>
               <div className="flex items-end gap-2">
                 <h4 className="text-4xl lg:text-5xl font-display font-black text-foreground">
                   {new Set(trips.map(t => t.destination)).size}
                 </h4>
                 <span className="text-xs font-bold text-primary mb-1.5 lg:mb-2 italic">Cities</span>
               </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-border/50 pb-12">
          <div className="animate-slide-up">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary mb-4 opacity-80">My Dashboard</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-foreground tracking-tight leading-tight">
              Welcome, <span className="text-gradient inline-block">{profile?.name?.split(' ')[0] || "Explorer"}</span>
            </h1>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-saas-primary py-4 sm:py-5 px-8 sm:px-10 rounded-2xl sm:rounded-[2rem] animate-slide-up shadow-xl shadow-primary/20 hover:scale-105 transition-transform text-sm sm:text-base"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" /> Plan New Trip
          </button>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search trips by name or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-saas py-3.5 lg:py-4 !pl-12 rounded-2xl lg:rounded-[2rem]"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex overflow-x-auto bg-white/40 backdrop-blur-md p-1.5 rounded-2xl lg:rounded-[2rem] border border-white/60 shadow-sm scrollbar-hide">
            {["all", "active", "upcoming", "past"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex-shrink-0 lg:flex-1 px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl lg:rounded-[1.5rem] text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all
                  ${statusFilter === f ? "gradient-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}
                `}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-[3rem] border border-white/60 overflow-hidden animate-pulse-subtle h-[420px]">
                <div className="h-56 bg-muted/40" />
                <div className="p-8 space-y-4">
                  <div className="h-8 bg-muted/40 rounded-2xl w-3/4" />
                  <div className="h-4 bg-muted/40 rounded-2xl w-1/2" />
                  <div className="h-12 bg-muted/40 rounded-2xl mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[4rem] border border-white/60 shadow-inner max-w-4xl mx-auto animate-fade-in">
            <div className="w-32 h-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto mb-8 animate-float">
              <Plane className="h-16 w-16 text-primary/40" />
            </div>

            <h3 className="text-4xl font-display font-black mb-4">No trips found</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">
              You haven't planned any trips yet. Start by creating your first trip and explore the world.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="btn-saas-primary py-5 px-12 rounded-3xl text-lg"
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredTrips.map((trip, idx) => (
              <div
                key={trip.id}
                className="glass-card rounded-[3rem] border border-white/60 overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      tripImages[trip.id] ||
                      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                    }
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {new Date(trip.start_date) > now ? "Upcoming" : new Date(trip.end_date) < now ? "Archived" : "Active"}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-8 right-8">
                    <h3 className="text-3xl font-display font-extrabold text-white leading-tight mb-2">
                      {trip.title}
                    </h3>

                    <div className="flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {trip.destination}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 text-muted-foreground text-sm font-bold mb-6">
                    <Calendar className="h-5 w-5 text-primary/40" />
                    <span className="bg-muted/30 px-3 py-1 rounded-xl text-xs">{trip.start_date} — {trip.end_date}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/trip/${trip.id}`)}
                      className="flex-[2] btn-saas-primary py-3.5 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" /> View Trip
                    </button>

                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="flex-1 p-3.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-transparent hover:border-destructive/10 rounded-2xl transition-all"
                    >
                      <Trash2 className="h-5 w-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TRIP MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card glass-card rounded-[3.5rem] p-12 max-w-xl w-full shadow-[0_40px_120px_rgba(0,0,0,0.15)] border border-white/60 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-display font-extrabold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground font-medium">Plan your next trip or manage your existing ones.</p>
            </div>

            {form.destination && form.destination.length >= 3 && (
              <div className="mb-8 relative h-48 w-full rounded-[2.5rem] overflow-hidden bg-muted/30 border border-white/40 shadow-inner animate-fade-in group">
                {previewImage && !isFetchingPreview ? (
                  <img src={previewImage} alt="Destination Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-8 flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-xl font-display font-bold tracking-wide">{form.destination}</span>
                </div>
              </div>
            )}

            <form onSubmit={addTrip} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Trip Name</label>
                  <input
                    placeholder="e.g. Summer in the Swiss Alps"
                    value={form.name}
                    autoFocus
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-saas py-4 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Destination</label>
                  <input
                    placeholder="Search for a city..."
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    required
                    className="input-saas py-4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      required
                      className="input-saas py-4"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      required
                      className="input-saas py-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2">Notes</label>
                  <textarea
                    placeholder="Optional details about this trip..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="input-saas py-4 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPreviewImage(null);
                  }}
                  className="btn-saas-secondary flex-1 py-4 rounded-3xl"
                >
                  Discard
                </button>

                <button
                  type="submit"
                  className="btn-saas-primary flex-1 py-4 rounded-3xl"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;