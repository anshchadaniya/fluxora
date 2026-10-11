import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on startup
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data?.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data?.success) {
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const res = await API.put('/auth/profile', formData);
    if (res.data?.success) {
      setUser((prev) => ({ ...prev, ...res.data.data }));
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isSeller: user?.role === 'seller',
        isBuyer: user?.role === 'buyer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
