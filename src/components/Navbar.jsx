import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Plane, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { profile, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'My Trips' },
    { to: '/explore', label: 'Explore' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gradient font-display">Voyager</span>
        </Link>

        {isAuthenticated && (
          <>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle dark mode">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
              </button>
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Hi, {profile?.name || 'Traveler'}</Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
              </button>
              <button onClick={() => setOpen(!open)} className="p-2">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle dark mode">
              {theme === 'dark' ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Login</Link>
            <Link to="/signup" className="text-sm font-medium gradient-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Sign Up</Link>
          </div>
        )}
      </div>

      {open && isAuthenticated && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-1 glass-card">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
              {l.label}
            </Link>
          ))}
          <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
            Profile
          </Link>
          <div className="border-t border-border pt-2 mt-2">
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-2 text-sm text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
