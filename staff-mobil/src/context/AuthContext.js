import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Uygulama başlangıcında token kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Geçici olarak otomatik girişi devre dışı bırak
      // const authData = await AsyncStorage.getItem('auth');
      
      // if (authData) {
      //   const { user: savedUser, roles } = JSON.parse(authData);
      //   
      //   // Mock sistem - direkt kullanıcıyı yükle
      //   setUser(savedUser);
      //   setAvailableRoles(roles);
      //   setCurrentRole(roles[0]);
      // }
      
      // Login ekranını göster
      setUser(null);
      setAvailableRoles([]);
      setCurrentRole(null);
      
      // Gerçek API kodu (backend hazır olduğunda açılacak)
      /*
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Token geçerliliğini kontrol et
        try {
          const profile = await api.getProfile();
          setUser(profile);
          setAvailableRoles(roles);
          setCurrentRole(roles[0]);
        } catch (error) {
          // Token geçersiz, temizle
          await logout();
        }
      }
      */
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      // Geçici mock login - backend hazır olana kadar
      const mockUser = {
        id: 1,
        username: username,
        full_name: username === 'admin' ? 'Admin Kullanıcı' : 
                   username === 'chef' ? 'Şef Kullanıcı' :
                   username === 'waiter' ? 'Garson Kullanıcı' :
                   username === 'cashier' ? 'Kasiyer Kullanıcı' : 'Test Kullanıcı',
        business_id: 1
      };
      
      // Kullanıcı adına göre roller belirle (gerçek sistemde veritabanından gelecek)
      let mockRoles = ['waiter']; // varsayılan
      if (username === 'admin') {
        mockRoles = ['admin', 'chef', 'waiter', 'cashier']; // Admin tüm rollere sahip
      } else if (username === 'chef') {
        mockRoles = ['chef']; // Sadece şef
      } else if (username === 'waiter') {
        mockRoles = ['waiter']; // Sadece garson
      } else if (username === 'cashier') {
        mockRoles = ['cashier']; // Sadece kasiyer
      } else if (username === 'ahmet') {
        mockRoles = ['waiter', 'cashier']; // Ahmet hem garson hem kasiyer
      } else if (username === 'mehmet') {
        mockRoles = ['chef', 'waiter']; // Mehmet hem şef hem garson
      } else if (username === 'ayse') {
        mockRoles = ['waiter', 'cashier', 'chef']; // Ayşe üç role sahip
      } else if (username === 'fatma') {
        mockRoles = ['cashier', 'waiter']; // Fatma hem kasiyer hem garson
      } else {
        mockRoles = ['waiter', 'chef']; // Diğer kullanıcılar için varsayılan
      }
      
      setUser(mockUser);
      setAvailableRoles(mockRoles);
      setCurrentRole(mockRoles[0]);
      
      // Local storage'a kaydet
      await AsyncStorage.setItem('auth', JSON.stringify({
        user: mockUser,
        roles: mockRoles
      }));
      
      return { success: true, user: mockUser };
      
      // Gerçek API kodu (backend hazır olduğunda açılacak)
      /*
      const response = await api.login(username, password);
      
      if (response.success && response.user) {
        const { user: userData, roles } = response;
        
        setUser(userData);
        setAvailableRoles(roles);
        setCurrentRole(roles[0]);
        
        // Local storage'a kaydet
        await AsyncStorage.setItem('auth', JSON.stringify({
          user: userData,
          roles: roles
        }));
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message || 'Giriş başarısız' };
      }
      */
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Bağlantı hatası. Lütfen tekrar deneyin.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (role) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      // Local storage'ı güncelle
      AsyncStorage.getItem('auth').then(authData => {
        if (authData) {
          const auth = JSON.parse(authData);
          auth.currentRole = role;
          AsyncStorage.setItem('auth', JSON.stringify(auth));
        }
      });
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      await AsyncStorage.removeItem('auth');
      await AsyncStorage.removeItem('authToken');
    }
  };

  const hasRole = (role) => {
    return availableRoles.includes(role);
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => availableRoles.includes(role));
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      
      // Local storage'ı güncelle
      const authData = await AsyncStorage.getItem('auth');
      if (authData) {
        const auth = JSON.parse(authData);
        auth.user = profile;
        await AsyncStorage.setItem('auth', JSON.stringify(auth));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    currentRole,
    availableRoles,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    hasRole,
    hasAnyRole,
    refreshUser,
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
