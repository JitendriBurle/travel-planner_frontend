import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api/api";
import { MapPin, Calendar, Plane, Compass, Sparkles } from "lucide-react";

const SharedTrip = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const res = await API.get(`/share/${token}`);
        setTrip(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Plane className="h-12 w-12 text-primary animate-float mx-auto mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading shared journey...</p>
      </div>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card p-10 rounded-3xl border border-border text-center max-w-sm w-full">
        <h2 className="text-2xl font-display font-bold mb-2">Trip Not Found</h2>
        <p className="text-muted-foreground mb-6">This share link might have expired or doesn't exist.</p>
        <Link to="/" className="inline-block gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="h-[50vh] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80" 
            alt={trip.destination} 
            className="w-full h-full object-cover scale-105 animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-12 left-12 right-12 container mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-2xl">
            <Compass className="h-4 w-4 animate-float" /> Shared Trip
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter drop-shadow-2xl animate-slide-up">{trip.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="glass-card rounded-[3.5rem] border border-white/60 p-12 shadow-travel transition-all duration-500 animate-slide-up">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/40">
                <h2 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" /> Trip Overview
                </h2>
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                   <Plane className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Destination</p>
                  <p className="text-2xl font-display font-extrabold text-foreground">{trip.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Travel Dates</p>
                  <p className="text-2xl font-display font-extrabold text-foreground flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary/40" /> 
                    <span className="bg-muted px-3 py-1 rounded-xl text-lg font-bold">{trip.start_date}</span>
                    <span className="text-muted-foreground text-sm">→</span>
                    <span className="bg-muted px-3 py-1 rounded-xl text-lg font-bold">{trip.end_date}</span>
                  </p>
                </div>
              </div>

              {trip.notes && (
                <div className="mt-12 pt-10 border-t border-dashed border-border/60">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Trip Notes</p>
                  <div className="bg-muted/30 p-8 rounded-[2.5rem] border border-border/40 italic text-muted-foreground leading-relaxed font-medium">
                    "{trip.notes}"
                  </div>
                </div>
              )}
            </section>
          </div>
          
          <div className="space-y-8">
            <div className="glass-card rounded-[3.5rem] p-10 border border-white/60 shadow-travel relative overflow-hidden group">
              <div className="absolute inset-0 gradient-primary opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                   <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-black mb-4">Plan Your Next Trip</h3>
                <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                  Inspired by this journey? Voyager is the world's most advanced travel planner. Plan your own story for free.
                </p>
                <Link to="/signup" className="btn-saas-primary w-full py-4 rounded-2xl text-center shadow-2xl">
                  Get Started for Free
                </Link>
                <Link to="/login" className="block text-center mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  Existing Member Login
                </Link>
              </div>
            </div>
            
            <div className="px-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
               <span>Secure Payload</span>
               <div className="h-px flex-1 mx-4 bg-muted/20" />
               <span>v4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;