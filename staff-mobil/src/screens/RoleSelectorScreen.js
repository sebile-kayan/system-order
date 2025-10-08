import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Button, Paragraph, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const roleInfo = {
  admin: { 
    title: 'Yönetici', 
    icon: '👑', 
    color: '#667eea',
    gradient: ['#667eea', '#764ba2'],
    description: 'İşletme yönetimi ve raporlar'
  },
  chef: { 
    title: 'Şef', 
    icon: '👨‍🍳', 
    color: '#ff9800',
    gradient: ['#ff9800', '#f57c00'],
    description: 'Sipariş yönetimi ve mutfak'
  },
  waiter: { 
    title: 'Garson', 
    icon: '🍽️', 
    color: '#4caf50',
    gradient: ['#4caf50', '#388e3c'],
    description: 'Masa servisi ve müşteri ilişkileri'
  },
  cashier: { 
    title: 'Kasiyer', 
    icon: '💰', 
    color: '#9c27b0',
    gradient: ['#9c27b0', '#7b1fa2'],
    description: 'Ödeme işlemleri ve kasa yönetimi'
  },
};

export default function RoleSelectorScreen() {
  const { availableRoles, switchRole, user } = useAuth();

  const handleRoleSelect = (role) => {
    switchRole(role);
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeCircle}>
            <Title style={styles.welcomeIcon}>👋</Title>
          </View>
          <Title style={styles.title}>Hoş Geldin!</Title>
          <Paragraph style={styles.subtitle}>
            {user?.full_name}, hangi rol ile devam etmek istiyorsun?
          </Paragraph>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {availableRoles.map((role) => {
            const info = roleInfo[role];
            return (
              <Surface key={role} style={styles.roleCard} elevation={4}>
                <LinearGradient
                  colors={info.gradient}
                  style={styles.roleGradient}
                >
                  <View style={styles.roleContent}>
                    <View style={styles.roleIconContainer}>
                      <Title style={styles.roleIcon}>{info.icon}</Title>
                    </View>
                    <Title style={styles.roleTitle}>{info.title}</Title>
                    <Paragraph style={styles.roleDescription}>
                      {info.description}
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={() => handleRoleSelect(role)}
                      style={styles.selectButton}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                    >
                      Seç
                    </Button>
                  </View>
                </LinearGradient>
              </Surface>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 40,
  },
  welcomeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeIcon: {
    fontSize: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  subtitle: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 16,
    lineHeight: 24,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  roleGradient: {
    padding: 24,
  },
  roleContent: {
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    fontSize: 28,
  },
  roleTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  roleDescription: {
    textAlign: 'center',
    marginBottom: 20,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    minWidth: 100,
  },
  buttonContent: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
