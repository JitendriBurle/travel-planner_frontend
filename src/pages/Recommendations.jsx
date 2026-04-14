import { useState } from 'react';
import { Compass, MapPin, Star, Clock, DollarSign, Sparkles, Search, Loader2, Plus } from 'lucide-react';
import { getDestinationImage } from '@/lib/unsplash';
import { toast } from 'sonner';
import { fetchRecommendations } from '@/api/recommendationApi';
import { fetchTrips } from '@/api/tripApi';
import API from '@/api/api';

const categoryIcons = {
  Adventure: '🏔️', Culture: '🏛️', Food: '🍽️', Nature: '🌿',
  Nightlife: '🌙', Relaxation: '🧘', Shopping: '🛍️',
};

const Recommendations = () => {
  const [destination, setDestination] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [activities, setActivities] = useState([]);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trips, setTrips] = useState([]);
  const [savingToTrip, setSavingToTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');

  const interestOptions = ['Adventure', 'Culture', 'Food', 'Nature', 'Nightlife', 'Relaxation', 'Shopping'];
  const [selectedInterests, setSelectedInterests] = useState([]);

  useState(() => {
    fetchTrips().then(res => setTrips(res.data || [])).catch(() => {});
  }, []);

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const getRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetchRecommendations({
        destination: destination || null,
        interests: selectedInterests.length > 0 ? selectedInterests.join(', ') : interests || null,
        budget: budget || null,
        duration: duration || null,
      });

      const acts = res.data.activities || [];
      setActivities(acts);

      // Load images for each activity
      const imgs = {};
      for (const act of acts) {
        imgs[act.name] = await getDestinationImage(act.location + ' ' + act.category, 'small');
      }
      setImages(imgs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveActivity = async (rec) => {
    if (!selectedTripId) return;
    
    try {
      await API.post('/activities', {
        trip_id: selectedTripId,
        day: 0, // Default to day 1, Lucy can move it later
        title: rec.name,
        location: rec.location,
        type: 'activity',
        notes: rec.description
      });
      toast.success(`Saved to ${trips.find(t => t.id === selectedTripId)?.name}`);
      setSavingToTrip(null);
    } catch {
      toast.error('Failed to save activity');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero search section */}
      <div className="relative pt-8 sm:pt-12 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 animate-fade-in shadow-2xl">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <span className="text-white font-bold tracking-widest text-[9px] sm:text-xs uppercase">Intelligent Guidance</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-white mb-4 tracking-tighter shadow-sm">
            Trip <span className="italic font-serif text-white/90">Planner</span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-8 sm:mb-12 max-w-lg mx-auto font-medium leading-relaxed">
            Personalized activities for your next trip. Discover things to do.
          </p>

          <form onSubmit={getRecommendations} className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl p-5 sm:p-8 shadow-travel text-left space-y-4 sm:space-y-6">
              <div>
                <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3 ml-2 block">Where are you going?</label>
                <input
                  placeholder="e.g. Tokyo, Paris, Bali..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="input-saas py-3.5 sm:py-4"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3 ml-2 block">What interests you?</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all ${
                        selectedInterests.includes(interest)
                          ? 'gradient-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'
                      }`}
                    >
                      {categoryIcons[interest]} {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3 ml-2 block">Budget</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}
                    className="input-saas py-3.5 sm:py-4 appearance-none cursor-pointer">
                    <option value="">Any budget</option>
                    <option value="Budget-friendly ($)">Budget ($)</option>
                    <option value="Mid-range ($$)">Mid-range ($$)</option>
                    <option value="Luxury ($$$)">Luxury ($$$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3 ml-2 block">Trip duration</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)}
                    className="input-saas py-3.5 sm:py-4 appearance-none cursor-pointer">
                    <option value="">Any duration</option>
                    <option value="Weekend (2-3 days)">Weekend</option>
                    <option value="1 week">1 Week</option>
                    <option value="2 weeks">2 Weeks</option>
                    <option value="1 month+">1 Month+</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-saas-primary w-full py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl mt-4"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> Thinking...</>
                ) : (
                  <><Search className="h-5 w-5 sm:h-6 sm:w-6" /> Explore Activities</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-10">
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">AI is crafting your perfect itinerary...</p>
          </div>
        )}

        {!loading && activities.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-display font-black mb-6 sm:mb-8 text-foreground px-2">
              Recommended for You <span className="text-primary">✨</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {activities.map((rec, idx) => (
                <div key={idx} className="glass-card rounded-[2rem] sm:rounded-[2.5rem] border border-white/40 overflow-hidden hover:shadow-[0_32px_128px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 group">
                  <div className="h-56 sm:h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={images[rec.name] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md border border-white/40 px-3 py-1.5 rounded-xl text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-xl">
                       {rec.price}
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-primary/10 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/20">
                        {rec.category}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto text-xs sm:text-sm font-bold text-warning">
                        <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning" /> {rec.rating}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-black mb-2 sm:mb-3 text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">{rec.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[9px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest mb-6 border-b border-border/50 pb-6">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {rec.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {rec.duration}</span>
                    </div>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-8 h-12 sm:h-16 overflow-hidden line-clamp-2 sm:line-clamp-3 font-medium">{rec.description}</p>
                    <button 
                      onClick={() => setSavingToTrip(rec)}
                      className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3.5 sm:py-4 rounded-xl sm:rounded-[2.5rem] bg-muted/30 text-foreground text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:shadow-xl transition-all duration-500 border border-border group-hover:border-primary/50"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Save Activity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Save to Trip Modal */}
        {savingToTrip && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-3xl p-8 max-w-sm w-full animate-scale-in border border-border">
              <h3 className="text-xl font-display font-bold mb-2">Save Activity</h3>
              <p className="text-muted-foreground text-sm mb-6">Select a trip to add "{savingToTrip.name}" to its itinerary.</p>
              
              <select 
                value={selectedTripId}
                onChange={e => setSelectedTripId(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background text-foreground mb-6"
              >
                <option value="">Select a trip...</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.destination})</option>
                ))}
              </select>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSavingToTrip(null)}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium"
                >
                  Cancel
                </button>
                <button 
                  disabled={!selectedTripId}
                  onClick={() => saveActivity(savingToTrip)}
                  className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-bold disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && hasSearched && activities.length === 0 && (
          <div className="text-center py-20">
            <Compass className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground">Try different preferences or destination</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Ready to explore?</h3>
            <p className="text-muted-foreground/70">Fill in your preferences above and let AI find the perfect activities for you</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
