import { Link } from 'react-router-dom';
import { Plane, Map, Calendar, DollarSign, CheckSquare, Star, ArrowRight } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Itinerary Builder', desc: 'Create day-by-day plans with flights, hotels, and activities.' },
  { icon: Map, title: 'Interactive Maps', desc: 'View all destinations on a real interactive map with markers.' },
  { icon: DollarSign, title: 'Expense Tracker', desc: 'Monitor your budget with categorized spending logs.' },
  { icon: CheckSquare, title: 'Packing Lists', desc: 'Auto-generated lists based on destination and activities.' },
  { icon: Star, title: 'Recommendations', desc: 'Discover activities and attractions tailored to your interests.' },
  { icon: Plane, title: 'Offline Access', desc: 'Download your itinerary for areas with no internet.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80" 
            alt="Beautiful tropical travel destination" 
            className="w-full h-full object-cover scale-105 animate-subtle-zoom" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#F8FAFC]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8 animate-fade-in shadow-2xl">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white text-[10px] uppercase font-black tracking-[0.3em]">Version 2.0 Now Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[1.1] sm:leading-tight drop-shadow-2xl animate-slide-up">
            Script Your <br />
            <span className="text-gradient">Epic Story.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 sm:mb-12 font-medium leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Elevate your travel experience with Voyager. The ultimate companion for the modern traveler—organize, track, and share your adventures with precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup" className="btn-saas-primary text-base sm:text-lg md:text-xl py-4 sm:py-5 px-8 sm:px-12 rounded-2xl sm:rounded-[2rem] shadow-[0_24px_48px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2">
              Get Started <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
            <Link to="/login" className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] hover:bg-white/20 transition-all flex items-center justify-center">
              Member Access
            </Link>
          </div>
        </div>

        {/* FLOATING DECOR */}
        <div className="absolute bottom-10 left-10 animate-float opacity-20 hidden lg:block">
           <div className="h-32 w-32 rounded-3xl border-2 border-white/50 rotate-12" />
        </div>
        <div className="absolute top-20 right-20 animate-float opacity-10 hidden lg:block" style={{ animationDelay: '1s' }}>
           <div className="h-48 w-48 rounded-full border-4 border-white" />
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 sm:py-32 container mx-auto px-6">
        <div className="text-center mb-16 sm:mb-24">
          <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs mb-4">The Voyager Toolkit</p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-foreground mb-6">Built for You.</h2>
          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">Precision tools designed for the world's most passionate travelers.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card group p-8 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-white/40 shadow-travel hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] gradient-primary flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                <f.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black mb-4 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto glass-card rounded-3xl sm:rounded-[4rem] p-8 sm:p-20 text-center relative overflow-hidden border border-white">
           <div className="absolute inset-0 gradient-primary opacity-[0.03] animate-pulse-subtle" />
           <div className="relative z-10">
             <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-foreground mb-6 sm:mb-8">Ready to Exit the Ordinary?</h2>
             <p className="text-muted-foreground text-base sm:text-xl mb-10 sm:mb-12 max-w-2xl mx-auto italic font-serif">
                "The world is a book and those who do not travel read only one page."
             </p>
             <Link to="/signup" className="btn-saas-primary py-4 sm:py-6 px-10 sm:px-16 rounded-2xl sm:rounded-[2.5rem] text-lg sm:text-2xl shadow-2xl flex items-center justify-center gap-2 max-w-sm sm:max-w-none mx-auto">
                Get Voyager Access — <span className="opacity-60 hidden sm:inline">It's Free</span> <ArrowRight className="h-5 w-5 sm:h-7 sm:w-7" />
             </Link>
           </div>
        </div>
      </section>

      <footer className="py-20 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Plane className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-black uppercase tracking-tighter">Voyager</span>
          </div>
          <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
            © 2026 Voyager Global. Built for Excellence.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">Network Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
