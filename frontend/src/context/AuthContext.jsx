import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is logged in on startup
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Verify token against backend and sync user data
          const response = await authService.getProfile();
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          console.warn('Session expired or token invalid. Clearing auth.');
          logout();
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login handler
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login({ email, password });
      const { token, ...userData } = response.data;

      // Save token and user details
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Check details.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (username, email, password, profileImage = '') => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authService.register({ username, email, password, profileImage });
      const { token, ...userData } = response.data;

      // Save token and user details
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Registration failed. Check parameters.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthError(null);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await authService.updateProfile(profileData);
      const { token, ...userData } = response.data;

      // Update storage
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Failed to update profile details.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout, updateProfile, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
