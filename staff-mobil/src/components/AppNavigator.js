import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectorScreen from '../screens/RoleSelectorScreen';
import AdminDashboard from '../screens/AdminDashboard';
import ChefDashboard from '../screens/ChefDashboard';
import WaiterDashboard from '../screens/WaiterDashboard';
import CashierDashboard from '../screens/CashierDashboard';
import TableManagementScreen from '../screens/TableManagementScreen';
import EmployeeManagementScreen from '../screens/EmployeeManagementScreen';
import MenuManagementScreen from '../screens/MenuManagementScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, currentRole, availableRoles } = useAuth();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (!currentRole && availableRoles.length > 1) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelector" component={RoleSelectorScreen} />
      </Stack.Navigator>
    );
  }

  // Rol bazlı ekranları render et
  switch (currentRole) {
    case 'admin':
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
          />
          <Stack.Screen 
            name="TableManagement" 
            component={TableManagementScreen}
          />
          <Stack.Screen 
            name="EmployeeManagement" 
            component={EmployeeManagementScreen}
          />
          <Stack.Screen 
            name="MenuManagement" 
            component={MenuManagementScreen}
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen}
          />
        </Stack.Navigator>
      );
    case 'chef':
      return (
        <Stack.Navigator>
          <Stack.Screen 
            name="ChefDashboard" 
            component={ChefDashboard}
            options={{ title: 'Şef Paneli' }}
          />
        </Stack.Navigator>
      );
    case 'waiter':
      return (
        <Stack.Navigator>
          <Stack.Screen 
            name="WaiterDashboard" 
            component={WaiterDashboard}
            options={{ title: 'Garson Paneli' }}
          />
        </Stack.Navigator>
      );
    case 'cashier':
      return (
        <Stack.Navigator>
          <Stack.Screen 
            name="CashierDashboard" 
            component={CashierDashboard}
            options={{ title: 'Kasiyer Paneli' }}
          />
        </Stack.Navigator>
      );
    default:
      return (
        <Stack.Navigator>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
            options={{ title: 'Yönetici Paneli' }}
          />
        </Stack.Navigator>
      );
  }
}
