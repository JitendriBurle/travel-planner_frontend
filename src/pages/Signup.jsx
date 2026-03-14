import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-travel overflow-hidden flex max-w-4xl w-full">
        <div className="hidden md:block w-1/2 relative">
          <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80" alt="Travel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-primary opacity-40" />
          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl font-display font-bold text-primary-foreground mb-2">Voyager</h2>
            <p className="text-primary-foreground/80 text-sm">Travel is the only thing you buy that makes you richer</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-8">Sign up with Email</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
            <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
            <button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity text-lg disabled:opacity-50">
              {loading ? 'Creating...' : 'SIGN UP'}
            </button>
          </form>
          <p className="text-center mt-6 text-muted-foreground text-sm">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
