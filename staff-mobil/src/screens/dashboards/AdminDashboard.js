/**
 * ADMIN DASHBOARD - Yönetici Ana Ekranı
 * 
 * Admin rolündeki kullanıcılar için tasarlanmış ana ekran. Ortak bileşenler kullanarak
 * günlük istatistikler, hızlı işlemler ve sistem yönetimi araçlarına erişim sağlar.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth, ROLE_BUTTONS, getAvailableRoles, getRoleConfig } from '../../context/AuthRolesContext';
import Header from '../../components/Header';
import DailySummaryCard from '../../components/DailySummaryCard';
import FastActionCard from '../../components/FastActionCard';

const AdminDashboard = ({ navigation }) => {
  const { user, business, hasRole, switchRole, logout, currentRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 45,
    todayRevenue: 2850.50,
    activeTables: 12,
    pendingOrders: 8,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel verileri çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Kullanıcının sahip olduğu rolleri al (admin hariç) - useMemo ile optimize edildi
  const availableRoles = useMemo(() => {
    if (!user?.roles) return [];
    return getAvailableRoles(user.roles).filter(role => role.id !== 'admin');
  }, [user?.roles]);

  const quickActions = [
    {
      id: 'employees',
      title: 'Çalışanlar',
      description: 'Çalışan ekleme/düzenleme',
      icon: '👥',
      color: '#dc2626',
    },
    {
      id: 'menu',
      title: 'Menü Yönetimi',
      description: 'Ürün ekleme/düzenleme',
      icon: '🍽️',
      color: '#ea580c',
    },
    {
      id: 'tables',
      title: 'Masa Yönetimi',
      description: 'QR kod oluşturma',
      icon: '🪑',
      color: '#059669',
    },
    {
      id: 'reports',
      title: 'Raporlar',
      description: 'Satış analizleri',
      icon: '📊',
      color: '#7c3aed',
    },
  ];


  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  return (
    <View style={styles.container}>
      {/* İçerik - Kaydırılabilir */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - Kaydırıldıkça kaybolacak */}
        <Header
          user={user}
          business={business}
          currentRole={currentRole}
          onLogout={handleLogout}
          badgeText={getRoleConfig(currentRole)?.badgeText}
          badgeColor={getRoleConfig(currentRole)?.color}
          sticky={false}  // Header kaydırıldıkça kaybolacak
        />

        {/* Hızlı Rol Değiştirme */}
        {availableRoles.length > 1 && (
          <View style={styles.roleSwitchSection}>
            <Text style={styles.roleSwitchTitle}>Hızlı Rol Değiştirme</Text>
            <View style={styles.roleSwitchButtons}>
              {availableRoles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleSwitchButton,
                    { backgroundColor: role.color },
                    currentRole === role.id && styles.activeRoleButton,
                  ]}
                  onPress={() => switchRole(role.id)}
                >
                  <Text style={styles.roleSwitchIcon}>{role.icon}</Text>
                  <Text style={styles.roleSwitchText}>{role.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Günlük İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Günlük Özet</Text>
          <View style={styles.statsGrid}>
            <DailySummaryCard number={stats.todayOrders} label="Sipariş" />
            <DailySummaryCard number={`₺${stats.todayRevenue.toFixed(0)}`} label="Ciro" />
            <DailySummaryCard number={stats.activeTables} label="Aktif Masa" />
            <DailySummaryCard number={stats.pendingOrders} label="Bekleyen" />
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <FastActionCard
                key={action.id}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onPress={() => {
                  switch(action.id) {
                    case 'tables':
                      navigation.navigate('TableManagement');
                      break;
                    case 'employees':
                      navigation.navigate('Employees');
                      break;
                    case 'menu':
                      navigation.navigate('Menu');
                      break;
                    case 'reports':
                      navigation.navigate('Reports');
                      break;
                    default:
                      console.log(`${action.title} tıklandı`);
                  }
                }}
              />
            ))}
          </View>
        </View>

        {/* Son Aktiviteler */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📋</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Yeni sipariş alındı</Text>
                <Text style={styles.activityTime}>Masa 5 - 2 dk önce</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>💰</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Ödeme tamamlandı</Text>
                <Text style={styles.activityTime}>Masa 3 - 5 dk önce</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>✅</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Sipariş hazır</Text>
                <Text style={styles.activityTime}>Masa 7 - 8 dk önce</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 70,
  },
  headerLeft: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flexShrink: 1,
  },
  businessName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    flexShrink: 1,
  },
  adminBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleSwitchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleSwitchButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.8,
  },
  activeRoleButton: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  roleSwitchIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleSwitchText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleSwitchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleSwitchButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.8,
  },
  activeRoleButton: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  roleSwitchIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleSwitchText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activitySection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleSwitchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleSwitchButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.8,
  },
  activeRoleButton: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  roleSwitchIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleSwitchText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AdminDashboard;
