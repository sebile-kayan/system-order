/**
 * AUTH CONTEXT - Kimlik Doğrulama Yönetimi
 * 
 * Bu context kullanıcı giriş/çıkış işlemlerini, oturum yönetimini ve rol tabanlı erişim kontrolünü yönetir.
 * AsyncStorage ile oturum bilgilerini kalıcı hale getirir ve tüm uygulama boyunca kullanıcı durumunu takip eder.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const isAuthenticated = !!user && !!token;
  

  // Uygulama başlatıldığında oturum bilgilerini yükle
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const clearAllStorage = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setBusiness(null);
      setToken(null);
      setCurrentRole(null);
    } catch (error) {
      console.error('❌ AsyncStorage temizleme hatası:', error);
    }
  };

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedBusiness = await AsyncStorage.getItem('business');
      const storedToken = await AsyncStorage.getItem('token');
      const storedRole = await AsyncStorage.getItem('currentRole');

      if (storedUser && storedBusiness && storedToken) {
        setUser(JSON.parse(storedUser));
        setBusiness(JSON.parse(storedBusiness));
        setToken(storedToken);
        setCurrentRole(storedRole);
      }
    } catch (error) {
      console.error('❌ Oturum yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // TODO: API çağrısı yapılacak
      // Şimdilik mock veri kullanıyoruz - Farklı rol kombinasyonları
      const mockUsers = {
        'admin': {
          id: 1,
          business_id: 1,
          username: 'admin',
          full_name: 'Ahmet Yönetici',
          phone: '+90 555 123 4567',
          is_active: true,
          roles: ['admin'], // Sadece admin rolü
          created_at: new Date().toISOString(),
        },
        'chef': {
          id: 2,
          business_id: 1,
          username: 'chef',
          full_name: 'Mehmet Şef',
          phone: '+90 555 234 5678',
          is_active: true,
          roles: ['chef'], // Sadece şef rolü
          created_at: new Date().toISOString(),
        },
        'waiter': {
          id: 3,
          business_id: 1,
          username: 'waiter',
          full_name: 'Ayşe Garson',
          phone: '+90 555 345 6789',
          is_active: true,
          roles: ['waiter'], // Sadece garson rolü
          created_at: new Date().toISOString(),
        },
        'cashier': {
          id: 4,
          business_id: 1,
          username: 'cashier',
          full_name: 'Fatma Kasiyer',
          phone: '+90 555 456 7890',
          is_active: true,
          roles: ['cashier'], // Sadece kasiyer rolü
          created_at: new Date().toISOString(),
        },
        'chef_waiter': {
          id: 5,
          business_id: 1,
          username: 'chef_waiter',
          full_name: 'Ali Şef-Garson',
          phone: '+90 555 567 8901',
          is_active: true,
          roles: ['chef', 'waiter'], // Şef ve garson rolleri
          created_at: new Date().toISOString(),
        },
        'waiter_cashier': {
          id: 6,
          business_id: 1,
          username: 'waiter_cashier',
          full_name: 'Zeynep Garson-Kasiyer',
          phone: '+90 555 678 9012',
          is_active: true,
          roles: ['waiter', 'cashier'], // Garson ve kasiyer rolleri
          created_at: new Date().toISOString(),
        },
        'all_roles': {
          id: 7,
          business_id: 1,
          username: 'all_roles',
          full_name: 'Mustafa Tüm Roller',
          phone: '+90 555 789 0123',
          is_active: true,
          roles: ['admin', 'chef', 'waiter', 'cashier'], // Tüm roller
          created_at: new Date().toISOString(),
        }
      };

      // Şifre kontrolü
      if (credentials.password !== '123') {
        throw new Error('Şifre hatalı');
      }

      const selectedUser = mockUsers[credentials.username] || mockUsers['all_roles'];
      
      const mockResponse = {
        user: selectedUser,
        token: 'mock-jwt-token-' + Date.now(),
        business: {
          id: 1,
          name: 'Test Restoran',
          address: 'Test Adres',
          phone: '+90 212 555 0123',
          email: 'test@restoran.com',
          is_active: true,
        },
      };

      // Verileri state'e kaydet
      setUser(mockResponse.user);
      setBusiness(mockResponse.business);
      setToken(mockResponse.token);
      
      // İlk rolü seç (admin varsa admin, yoksa ilk rol)
      const firstRole = mockResponse.user.roles.includes('admin') 
        ? 'admin' 
        : mockResponse.user.roles[0];
      setCurrentRole(firstRole);

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('user', JSON.stringify(mockResponse.user));
      await AsyncStorage.setItem('business', JSON.stringify(mockResponse.business));
      await AsyncStorage.setItem('token', mockResponse.token);
      await AsyncStorage.setItem('currentRole', firstRole);

      return true;
    } catch (error) {
      console.error('Giriş hatası:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // State'i temizle
      setUser(null);
      setBusiness(null);
      setToken(null);
      setCurrentRole(null);
      
      // AsyncStorage'ı temizle
      await AsyncStorage.multiRemove(['user', 'business', 'token', 'currentRole']);
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
    }
  };

  const switchRole = (role) => {
    if (user?.roles.includes(role)) {
      setCurrentRole(role);
      AsyncStorage.setItem('currentRole', role);
    }
  };

  const hasRole = (role) => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.roles.includes(role)) || false;
  };

  const value = {
    user,
    business,
    token,
    isLoading,
    isAuthenticated,
    currentRole,
    login,
    logout,
    switchRole,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
