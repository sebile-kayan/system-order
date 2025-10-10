/**
 * MAIN TAB NAVIGATOR - Ana Tab Navigasyonu
 * 
 * Bu navigator rol tabanlı tab yapısını yönetir. Her rol için farklı tab'lar gösterir.
 * Rol değiştirme butonları ve hızlı erişim sağlar.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Dashboard'lar
import AdminDashboard from '../screens/dashboards/AdminDashboard';
import ChefDashboard from '../screens/dashboards/ChefDashboard';
import WaiterDashboard from '../screens/dashboards/WaiterDashboard';
import CashierDashboard from '../screens/dashboards/CashierDashboard';

// Diğer ekranlar
import OrdersScreen from '../screens/OrdersScreen';
import TablesScreen from '../screens/TablesScreen';
import MenuScreen from '../screens/MenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { currentRole, user, hasRole, switchRole, logout } = useAuth();

  const getTabScreens = () => {
    const screens = [];

    // Sadece aktif rolün dashboard'unu göster
    if (currentRole === 'admin') {
      screens.push(
        <Tab.Screen
          key="AdminDashboard"
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👑</Text>
            ),
          }}
        />
      );
    } else if (currentRole === 'chef') {
      screens.push(
        <Tab.Screen
          key="ChefDashboard"
          name="ChefDashboard"
          component={ChefDashboard}
          options={{
            title: 'Mutfak',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👨‍🍳</Text>
            ),
          }}
        />
      );
    } else if (currentRole === 'waiter') {
      screens.push(
        <Tab.Screen
          key="WaiterDashboard"
          name="WaiterDashboard"
          component={WaiterDashboard}
          options={{
            title: 'Servis',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>👨‍💼</Text>
            ),
          }}
        />
      );
    } else if (currentRole === 'cashier') {
      screens.push(
        <Tab.Screen
          key="CashierDashboard"
          name="CashierDashboard"
          component={CashierDashboard}
          options={{
            title: 'Kasa',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>💰</Text>
            ),
          }}
        />
      );
    }

    // Sadece admin için özel ekranlar (diğer roller dashboard'larında her şey var)
    if (currentRole === 'admin') {
      screens.push(
        <Tab.Screen
          key="Orders"
          name="Orders"
          component={OrdersScreen}
          options={{
            title: 'Siparişler',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📋</Text>
            ),
          }}
        />
      );

      screens.push(
        <Tab.Screen
          key="Tables"
          name="Tables"
          component={TablesScreen}
          options={{
            title: 'Masalar',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🪑</Text>
            ),
          }}
        />
      );

      // Menu ve Reports - footer'da görünür
      screens.push(
        <Tab.Screen
          key="Menu"
          name="Menu"
          component={MenuScreen}
          options={{
            title: 'Menü',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🍽️</Text>
            ),
          }}
        />
      );

      screens.push(
        <Tab.Screen
          key="Reports"
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Raporlar',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📊</Text>
            ),
          }}
        />
      );

    }

    // Ayarlar herkes için
    screens.push(
      <Tab.Screen
        key="Settings"
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    );

    return screens;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
          textAlign: 'center',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: true,
      }}
    >
      {getTabScreens()}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
