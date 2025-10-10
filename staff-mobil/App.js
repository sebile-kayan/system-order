/**
 * MAIN APP COMPONENT - Ana Uygulama Bileşeni
 * 
 * Bu bileşen tüm uygulamanın ana yapısını oluşturur. AuthProvider ile kimlik doğrulama
 * yönetimini sağlar ve AppNavigator ile navigasyon yapısını yönetir.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Suppress the pointerEvents deprecation warning from react-native-paper
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('props.pointerEvents is deprecated')) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

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
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </PaperProvider>
  );
}