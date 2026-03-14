import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, getProfile } from "@/api/authApi";

const AuthContext = createContext({
  user: null,
  profile: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOAD USER FROM TOKEN
  const loadUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await getProfile();

      setUser(res.data.user);
      setProfile(res.data.profile);
    } catch (err) {
      localStorage.removeItem("access_token");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // SIGNUP
  const signup = async (name, email, password) => {
    const res = await signupUser(name, email, password);

    localStorage.setItem("access_token", res.data.token);

    setUser(res.data.user);
    setProfile(res.data.profile);

    return res.data;
  };

  // LOGIN
  const login = async (email, password) => {
    const res = await loginUser(email, password);

    localStorage.setItem("access_token", res.data.token);

    setUser(res.data.user);
    setProfile(res.data.profile);

    return res.data;
  };

  // LOGOUT
  const logout = async () => {
    localStorage.removeItem("access_token");

    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
    profile,
    updateProfile: (newProfile) => setProfile(prev => ({ ...prev, ...newProfile })),
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};