/**
 * APP NAVIGATOR - Ana Navigasyon Yapısı
 * 
 * Bu dosya tüm uygulama navigasyon yapısını yönetir. Rol tabanlı navigasyon sağlar ve
 * kullanıcının rollerine göre farklı ekranlara erişim kontrolü yapar.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthRolesContext';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RoleSelectorScreen from '../screens/RoleSelectorScreen';
import CommonTabNavigator from './CommonTabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user, currentRole } = useAuth();

  // Yükleme durumu
  if (isLoading) {
    return null; // LoadingScreen burada olabilir
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {!isAuthenticated ? (
          // Giriş yapılmamışsa
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.roles.length > 1 && !currentRole ? (
          // Birden fazla rol varsa ve rol seçilmemişse
          <Stack.Screen name="RoleSelector" component={RoleSelectorScreen} />
        ) : (
          // Ana uygulama
          <Stack.Screen name="Main" component={CommonTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
