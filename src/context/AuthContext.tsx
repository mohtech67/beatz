import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Member } from '../types';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  member: Member | null;
  token: string | null;
  loading: boolean;
  toasts: ToastState[];
  loginAdmin: (token: string, user: User) => void;
  loginMember: (token: string, user: User, member: Member) => void;
  logout: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bidii_sda_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          setUser(data.user);
          setMember(data.member);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginAdmin = (newToken: string, newUser: User) => {
    localStorage.setItem('bidii_sda_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setMember(null);
    showToast(`Welcome back, ${newUser.username}!`, 'success');
  };

  const loginMember = (newToken: string, newUser: User, newMember: Member) => {
    localStorage.setItem('bidii_sda_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setMember(newMember);
    showToast(`Welcome, ${newMember.fullName}!`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('bidii_sda_token');
    setToken(null);
    setUser(null);
    setMember(null);
    showToast('You have been logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        token,
        loading,
        toasts,
        loginAdmin,
        loginMember,
        logout,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
