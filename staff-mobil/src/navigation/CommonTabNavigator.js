/**
 * COMMON TAB NAVIGATOR - Ortak Tab Navigasyonu
 * 
 * Rol tabanlı tab yapısını yönetir. Her rol için farklı dashboard'ları tab olarak gösterir.
 * Ortak rol tanımları kullanarak tutarlı icon'lar ve isimler sağlar.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, getRoleConfig } from '../context/AuthRolesContext';

// Dashboard'lar
import AdminDashboard from '../screens/dashboards/AdminDashboard';
import ChefDashboard from '../screens/dashboards/ChefDashboard';
import WaiterDashboard from '../screens/dashboards/WaiterDashboard';
import CashierDashboard from '../screens/dashboards/CashierDashboard';

// Diğer ekranlar
import OrdersScreen from '../screens/OrdersScreen';
import MenuScreen from '../screens/MenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import TableManagementScreen from '../screens/TableManagementScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { currentRole, user, hasRole, switchRole, logout } = useAuth();
  const insets = useSafeAreaInsets();

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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getRoleConfig('admin').icon}</Text>
              </View>
            ),
          }}
        />
      );
      
      // Admin için ek tab'lar
      screens.push(
        <Tab.Screen
          key="Employees"
          name="Employees"
          component={EmployeesScreen}
          options={{
            title: 'Çalışanlar',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>👥</Text>
              </View>
            ),
          }}
        />
      );
      
      screens.push(
        <Tab.Screen
          key="TableManagement"
          name="TableManagement"
          component={TableManagementScreen}
          options={{
            title: 'Masa Yönetimi',
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>🪑</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getRoleConfig('chef').icon}</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getRoleConfig('waiter').icon}</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getRoleConfig('cashier').icon}</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>📋</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>🍽️</Text>
              </View>
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
              <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
                <Text style={{ fontSize: size, color, textAlign: 'center' }}>📊</Text>
              </View>
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
            <View style={{ alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0 }}>
              <Text style={{ fontSize: size, color, textAlign: 'center' }}>⚙️</Text>
            </View>
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
          height: 70 + insets.bottom, // Height daha da artırıldı
          paddingBottom: insets.bottom + 12, // Safe area padding + daha fazla ekstra
          paddingTop: 12, // Top padding daha da artırıldı
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1, // Margin azaltıldı
          marginBottom: 2, // Alt margin eklendi
          textAlign: 'center',
          lineHeight: 12,
        },
        tabBarIconStyle: {
          marginTop: 2, // Icon'u yukarı taşı
          marginBottom: 2, // Alt margin eklendi
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
