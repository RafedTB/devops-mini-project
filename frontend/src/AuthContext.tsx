import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, setToken, removeToken } from './api';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  updateProfile: (data: { username?: string; password?: string }) => Promise<User>;
  uploadProfileImage: (file: File) => Promise<User>;
  removeProfileImage: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const u = await apiFetch<User>('/users/current-user');
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const data = await apiFetch<{ accessToken?: string; message?: string }>(
      '/users/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    if (data.accessToken) {
      setToken(data.accessToken);
      await fetchUser();
      return null;
    }
    return data.message || 'Login failed';
  };

  const register = async (username: string, email: string, password: string): Promise<string> => {
    const data = await apiFetch<{ message: string }>(
      '/users/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, username }) }
    );
    return data.message;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const u = await apiFetch<User>('/users/current-user');
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  };

  const updateProfile = async (data: { username?: string; password?: string }): Promise<User> => {
    const updated = await apiFetch<User>('/users', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setUser(updated);
    return updated;
  };

  const uploadProfileImage = async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('user-image', file);
    const updated = await apiFetch<User>('/users/upload-profile-image', {
      method: 'POST',
      body: formData,
    });
    setUser(updated);
    return updated;
  };

  const removeProfileImage = async (): Promise<User> => {
    const updated = await apiFetch<User>('/users/images/remove-profile-image', {
      method: 'DELETE',
    });
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        uploadProfileImage,
        removeProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

