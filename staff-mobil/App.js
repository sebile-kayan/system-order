/**
 * MAIN APP COMPONENT - Ana Uygulama Bileşeni
 * Ana stack yığın yapısı ana yönlendirme için kullanılır.  
 * Bu bileşen tüm uygulamanın ana yapısını oluşturur. AuthProvider ile kimlik doğrulama
 * yönetimini sağlar ve AppNavigator ile navigasyon yapısını yönetir.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthRolesContext';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1e3a8a',
    secondary: '#dc004e',
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    onSurface: '#1f2937',
    onSurfaceVariant: '#6b7280',
    outline: '#d1d5db',
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}