import { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 localStorage에서 사용자 ID 확인
  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const userData = await getUser(userId);
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          // 사용자 정보를 불러올 수 없으면 localStorage 초기화
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (userId) => {
    try {
      const userData = await getUser(userId);
      setUser(userData);
      localStorage.setItem('userId', userId);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  const register = (userData) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
