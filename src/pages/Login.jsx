import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
      const message =
        err.response?.data?.error ||
        err.message ||
        "Invalid email or password";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-travel overflow-hidden flex max-w-4xl w-full">

        {/* Left image panel */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
            alt="Travel"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 gradient-primary opacity-40" />

          <div className="absolute bottom-8 left-8 right-8">
            <h2 className="text-3xl font-display font-bold text-primary-foreground mb-2">
              Voyager
            </h2>

            <p className="text-primary-foreground/80 text-sm">
              Your journey starts here
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Welcome Back
          </h1>

          <p className="text-muted-foreground mb-8">
            Login to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity text-lg disabled:opacity-50"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

          </form>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;