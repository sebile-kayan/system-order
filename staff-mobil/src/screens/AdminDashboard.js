import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Title, Paragraph, Button, Surface, Avatar, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const adminFeatures = [
  {
    title: 'Çalışan Yönetimi',
    icon: '👥',
    color: '#667eea',
    description: 'Çalışan ekleme, düzenleme ve silme'
  },
  {
    title: 'Menü Yönetimi',
    icon: '📋',
    color: '#4caf50',
    description: 'Ürün ekleme, fiyat güncelleme'
  },
  {
    title: 'Masa Yönetimi',
    icon: '🪑',
    color: '#ff9800',
    description: 'Masa düzenleme ve QR kod yönetimi'
  },
  {
    title: 'Raporlar',
    icon: '📊',
    color: '#9c27b0',
    description: 'Satış raporları ve analizler'
  },
  {
    title: 'İşletme Ayarları',
    icon: '⚙️',
    color: '#607d8b',
    description: 'Genel işletme ayarları'
  },
  {
    title: 'Bildirimler',
    icon: '🔔',
    color: '#e91e63',
    description: 'Sistem bildirimleri'
  }
];

export default function AdminDashboard() {
  const { user, availableRoles, switchRole, logout, currentRole } = useAuth();

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text 
            size={50} 
            label={user?.full_name?.charAt(0) || 'A'} 
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Title style={styles.userName}>{user?.full_name}</Title>
            <Paragraph style={styles.userRole}>👑 Yönetici</Paragraph>
          </View>
        </View>
        
        {/* Rol Değiştirme */}
        {availableRoles.length > 1 && (
          <View style={styles.roleSwitcher}>
            {availableRoles.map((role) => (
              <Button
                key={role}
                mode={currentRole === role ? "contained" : "outlined"}
                onPress={() => switchRole(role)}
                style={[
                  styles.roleButton,
                  currentRole === role && styles.activeRoleButton
                ]}
                labelStyle={styles.roleButtonLabel}
                compact
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Title style={styles.statNumber}>12</Title>
              <Paragraph style={styles.statLabel}>Aktif Çalışan</Paragraph>
            </View>
            <View style={styles.statCard}>
              <Title style={styles.statNumber}>8</Title>
              <Paragraph style={styles.statLabel}>Aktif Masa</Paragraph>
            </View>
            <View style={styles.statCard}>
              <Title style={styles.statNumber}>₺2,450</Title>
              <Paragraph style={styles.statLabel}>Günlük Satış</Paragraph>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            <Title style={styles.sectionTitle}>İşletme Yönetimi</Title>
            <View style={styles.featuresGrid}>
              {adminFeatures.map((feature, index) => (
                <Surface key={index} style={styles.featureCard} elevation={3}>
                  <LinearGradient
                    colors={[feature.color + '20', feature.color + '10']}
                    style={styles.featureGradient}
                  >
                    <View style={styles.featureContent}>
                      <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                        <Title style={styles.featureIconText}>{feature.icon}</Title>
                      </View>
                      <Title style={styles.featureTitle}>{feature.title}</Title>
                      <Paragraph style={styles.featureDescription}>
                        {feature.description}
                      </Paragraph>
                      <Button
                        mode="contained"
                        style={[styles.featureButton, { backgroundColor: feature.color }]}
                        contentStyle={styles.featureButtonContent}
                        labelStyle={styles.featureButtonLabel}
                      >
                        Aç
                      </Button>
                    </View>
                  </LinearGradient>
                </Surface>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Title style={styles.sectionTitle}>Hızlı İşlemler</Title>
            <Surface style={styles.quickActionsCard} elevation={2}>
              <Button
                mode="outlined"
                icon="account-plus"
                style={styles.quickActionButton}
              >
                Yeni Çalışan Ekle
              </Button>
              <Button
                mode="outlined"
                icon="food"
                style={styles.quickActionButton}
              >
                Menüye Ürün Ekle
              </Button>
              <Button
                mode="outlined"
                icon="qrcode"
                style={styles.quickActionButton}
              >
                QR Kod Oluştur
              </Button>
            </Surface>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="logout"
        style={styles.fab}
        onPress={logout}
        label="Çıkış"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  roleSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeRoleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: 16,
  },
  featureContent: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  featureButton: {
    borderRadius: 12,
    minWidth: 80,
  },
  featureButtonContent: {
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  featureButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  quickActionButton: {
    marginVertical: 4,
    borderRadius: 12,
    borderColor: '#e2e8f0',
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#e53e3e',
  },
});
