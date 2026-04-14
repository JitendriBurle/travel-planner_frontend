import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Globe, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background h-screen overflow-hidden">
      {/* LEFT: DESIGN HERO */}
      <div className="hidden lg:flex w-1/2 p-20 flex-col justify-center relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80')] bg-cover bg-center">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-transparent" />
        </div>
        
        <div className="relative z-10 animate-slide-up">
           <div className="flex items-center gap-2 mb-8">
              <div className="h-12 w-12 gradient-primary rounded-2xl flex items-center justify-center text-white shadow-2xl">
                <Globe className="h-6 w-6 animate-pulse-subtle" />
              </div>
              <span className="font-display font-black text-3xl tracking-tighter text-white">Voyager</span>
           </div>

           <h1 className="text-7xl font-display font-black text-white mb-8 tracking-tighter leading-tight">
              Adventure <br />
              <span className="text-white/40 italic font-serif">Awaits.</span>
           </h1>
           <p className="text-xl text-white/70 max-w-md font-medium leading-relaxed italic border-l-4 border-white/20 pl-6">
              "The gladdest moment in human life is a departure into unknown lands."
           </p>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background relative overflow-hidden h-full overflow-y-auto">
         <div className="absolute lg:hidden inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
         
         <div className="w-full max-w-md space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Mobile/Tablet Logo & Header */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
               <div className="lg:hidden h-16 w-16 gradient-primary rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3 mb-6">
                 <Globe className="h-8 w-8" />
               </div>
               <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tighter text-foreground">Welcome Back</h2>
               <p className="text-muted-foreground font-medium mt-1">Ready for your next journey?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-saas pl-12 py-4"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-saas pl-12 py-4"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-saas-primary w-full py-4 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-muted-foreground font-medium">
                New to Voyager?{" "}
                <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4">
                  Register Now
                </Link>
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;