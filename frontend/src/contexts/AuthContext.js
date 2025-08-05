import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  // Set up axios interceptors
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token expired or invalid
          logout();
          toast.error('Your session has expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/auth/verify');
      setUser(response.data.user);
      setSessionId(storedSessionId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      
      const { token, sessionId: newSessionId, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('sessionId', newSessionId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setSessionId(newSessionId);
      
      toast.success(`Welcome back, ${userData.firstName || userData.name}!`);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      
      const { token, sessionId: newSessionId, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('sessionId', newSessionId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      setSessionId(newSessionId);
      
      toast.success(`Welcome to MindCare, ${newUser.firstName || newUser.name}!`);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.status === 400 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/guest');
      
      const { token, sessionId: newSessionId, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('sessionId', newSessionId);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setSessionId(newSessionId);
      
      toast.success('Welcome! You\'re using MindCare as a guest.');
      return { success: true };
    } catch (error) {
      console.error('Guest login error:', error);
      const errorMessage = error.response?.data?.message || 'Guest login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (sessionId) {
        await axios.post('/auth/logout', { sessionId });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setSessionId(null);
      toast.success('You have been logged out successfully.');
    }
  }, [sessionId]);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/auth/profile', profileData);
      
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/forgot-password', { email });
      
      toast.success('Password reset instructions sent to your email');
      return { 
        success: true, 
        message: response.data.message,
        // In development, also return the reset link for testing
        ...(response.data.resetLink && { resetLink: response.data.resetLink })
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset instructions. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/reset-password', { token, newPassword });
      
      toast.success('Password reset successfully! You can now log in with your new password.');
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    sessionId,
    login,
    register,
    loginAsGuest,
    logout,
    checkAuth,
    updateProfile,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 