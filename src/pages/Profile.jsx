import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Save, ArrowLeft, Info, MapPin, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { updateProfile } from '@/api/authApi';

const Profile = () => {
  const { user, profile, updateProfile: updateLocalProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    travel_style: profile?.travel_style || 'Explorer',
    location: profile?.location || ''
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(formData);
      
      // Update local context
      updateLocalProfile(res.data.profile);
      
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-black uppercase tracking-widest text-xs mb-10 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="glass-card rounded-[3.5rem] border border-white/60 p-12 shadow-travel transition-all duration-500 animate-slide-up">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-[2.5rem] gradient-primary flex items-center justify-center text-white text-4xl font-display font-black shadow-2xl rotate-3">
              {(profile?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Account Details</p>
              <h1 className="text-4xl font-display font-black text-foreground tracking-tight">My Profile</h1>
              <p className="text-muted-foreground font-medium italic mt-1">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required
                    className="input-saas pl-12 py-4" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2 block">Current Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <input 
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                    className="input-saas pl-12 py-4" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2 block">Travel Style</label>
              <div className="relative">
                <Compass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                <select 
                  value={formData.travel_style} 
                  onChange={e => setFormData({ ...formData, travel_style: e.target.value })} 
                  className="input-saas pl-12 py-4 appearance-none"
                >
                  <option value="Explorer">Explorer (All-around)</option>
                  <option value="Luxury">Luxury (Premium & Comfort)</option>
                  <option value="Budget">Backpacker (Budget-friendly)</option>
                  <option value="Adventurer">Adventurer (Off-the-beaten-path)</option>
                  <option value="Foodie">Foodie (Culinary focused)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 ml-2 block">Bio / Notes</label>
              <div className="relative">
                <Info className="absolute left-4 top-5 h-4 w-4 text-primary/40" />
                <textarea 
                  placeholder="Tell us about your travel dreams..."
                  value={formData.bio} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                  rows={4}
                  className="input-saas pl-12 py-4 resize-none" 
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-saas-primary w-full py-5 rounded-3xl text-lg flex items-center justify-center gap-3 shadow-2xl"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
