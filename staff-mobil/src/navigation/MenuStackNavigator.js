/**
 * MENU STACK NAVIGATOR - Menü Navigasyon Yapısı
 * 
 * Menü yönetimi ile ilgili tüm ekranları içeren stack navigator.
 * MenuScreen'den MenuSettings ve MenuReports'a geçiş sağlar.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Menü ekranları
import MenuScreen from '../screens/MenuScreen';
import MenuSettingsScreen from '../screens/MenuSettingsScreen';
import MenuReportsScreen from '../screens/MenuReportsScreen';

const Stack = createStackNavigator();

const MenuStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { 
          backgroundColor: '#f8fafc',
          height: '100vh',
          flex: 1,
        },
      }}
    >
      <Stack.Screen 
        name="MenuMain" 
        component={MenuScreen} 
      />
      <Stack.Screen 
        name="MenuSettings" 
        component={MenuSettingsScreen} 
      />
      <Stack.Screen 
        name="MenuReports" 
        component={MenuReportsScreen} 
      />
    </Stack.Navigator>
  );
};

export default MenuStackNavigator;
