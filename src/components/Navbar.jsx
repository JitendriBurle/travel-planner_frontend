import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Globe, LogOut, Menu, X, Sun, Moon, User, Compass, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { profile, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Trip Planner', icon: Compass },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Globe className="h-5 w-5" />
          </div>
          <span className={`text-2xl font-display font-black tracking-tighter transition-colors ${
            scrolled ? 'text-foreground' : (location.pathname === '/' ? 'text-white' : 'text-foreground')
          }`}>Voyager</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <div className="flex items-center gap-1">
              {navLinks.map(l => (
                <Link 
                  key={l.to} 
                  to={l.to} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    isActive(l.to)
                      ? 'text-primary bg-primary/5'
                      : (scrolled ? 'text-muted-foreground hover:text-primary' : (location.pathname === '/' ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-primary'))
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-xl transition-all ${
                scrolled ? 'hover:bg-muted' : (location.pathname === '/' ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-muted')
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className={`h-5 w-5 ${scrolled || location.pathname !== '/' ? 'text-muted-foreground' : 'text-white'}`} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-4 border-l border-border/50">
                <Link to="/profile" className="flex items-center gap-3 group">
                   <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-black shadow-lg border-2 border-transparent group-hover:border-white transition-all">
                     {(profile?.name || 'U')[0].toUpperCase()}
                   </div>
                   <span className={`text-sm font-bold transition-colors ${
                      scrolled ? 'text-foreground' : (location.pathname === '/' ? 'text-white' : 'text-foreground')
                   }`}>Hi, {profile?.name?.split(' ')[0] || 'Traveler'}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="p-2.5 text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={`text-sm font-black uppercase tracking-widest px-4 py-2 hover:opacity-70 transition-opacity ${
                   scrolled ? 'text-foreground' : (location.pathname === '/' ? 'text-white' : 'text-foreground')
                }`}>Login</Link>
                <Link to="/signup" className="btn-saas-primary px-6 py-2.5 rounded-xl text-xs shadow-xl">Join Now</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Control */}
        <div className="flex md:hidden items-center gap-2">
           <button 
              onClick={toggleTheme} 
              className={`p-2.5 rounded-xl transition-all ${
                scrolled ? 'hover:bg-muted' : (location.pathname === '/' ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-muted')
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className={`h-5 w-5 ${scrolled || location.pathname !== '/' ? 'text-muted-foreground' : 'text-white'}`} />}
            </button>
            <button 
              onClick={() => setOpen(!open)} 
              className={`p-2.5 rounded-xl transition-all ${
                scrolled ? 'hover:bg-muted' : (location.pathname === '/' ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-muted')
              }`}
            >
              {open ? <X className={`h-6 w-6 ${scrolled || location.pathname !== '/' ? 'text-foreground' : 'text-white'}`} /> : <Menu className={`h-6 w-6 ${scrolled || location.pathname !== '/' ? 'text-foreground' : 'text-white'}`} />}
            </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[90] bg-background/95 backdrop-blur-2xl animate-fade-in pt-24 px-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 p-4 mb-6 rounded-3xl bg-primary/5 border border-primary/10">
                   <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-black shadow-xl">
                     {(profile?.name || 'U')[0].toUpperCase()}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Welcome back</p>
                     <p className="text-xl font-display font-black text-foreground">{profile?.name || 'Traveler'}</p>
                   </div>
                </div>

                {navLinks.map(l => (
                  <Link 
                    key={l.to} 
                    to={l.to} 
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${
                      isActive(l.to) ? 'bg-white shadow-xl text-primary border border-primary/10' : 'text-muted-foreground hover:bg-white/50'
                    }`}
                  >
                    <l.icon className="h-5 w-5" />
                    <span className="font-bold tracking-tight uppercase text-xs">{l.label}</span>
                  </Link>
                ))}
                
                <Link 
                  to="/profile" 
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl text-muted-foreground hover:bg-white/50 transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="font-bold tracking-tight uppercase text-xs">My Profile</span>
                </Link>

                <div className="mt-8 pt-8 border-t border-border">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-destructive/5 text-destructive font-black uppercase tracking-widest text-xs border border-destructive/10"
                  >
                    <LogOut className="h-5 w-5" /> Logout Session
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center mt-12">
                 <h2 className="text-3xl font-display font-black text-foreground mb-2">Ready to explore?</h2>
                 <p className="text-muted-foreground mb-10">Sign in to sync your travel plans.</p>
                 <Link to="/login" onClick={() => setOpen(false)} className="block w-full py-5 rounded-2xl bg-muted font-black uppercase tracking-widest text-xs border border-border">Sign In</Link>
                 <Link to="/signup" onClick={() => setOpen(false)} className="block w-full py-5 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Join Voyager</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
