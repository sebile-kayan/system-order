import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      // Mock login - gerçek API'yi buraya ekleyeceğiz
      const mockUser = {
        id: 1,
        username: username,
        full_name: 'Test Kullanıcı',
        business_id: 1
      };
      
      const mockRoles = ['admin', 'waiter']; // Kullanıcının rolleri
      
      setUser(mockUser);
      setAvailableRoles(mockRoles);
      setCurrentRole(mockRoles[0]);
      
      await AsyncStorage.setItem('auth', JSON.stringify({
        user: mockUser,
        roles: mockRoles
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (role) => {
    setCurrentRole(role);
  };

  const logout = async () => {
    setUser(null);
    setCurrentRole(null);
    setAvailableRoles([]);
    await AsyncStorage.removeItem('auth');
  };

  const hasRole = (role) => {
    return availableRoles.includes(role);
  };

  const value = {
    user,
    currentRole,
    availableRoles,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
