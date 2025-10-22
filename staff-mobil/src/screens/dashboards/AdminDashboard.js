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
  Modal,
  TextInput,
} from 'react-native';
import { useAuth, ROLE_BUTTONS, getAvailableRoles, getRoleConfig } from '../../context/AuthRolesContext';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import DailySummaryCard from '../../components/DailySummaryCard';
import FastActionCard from '../../components/FastActionCard';
import Button from '../../components/Button';

const AdminDashboard = ({ navigation }) => {
  const { user, business, hasRole, switchRole, logout, currentRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');
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

  // Masa ekleme fonksiyonu
  const handleAddTable = () => {
    if (!newTableNumber.trim() || !newTableCapacity.trim()) {
      Alert.alert('Hata', 'Lütfen masa numarası ve kapasite giriniz.');
      return;
    }

    // Burada API çağrısı yapılacak
    Alert.alert('Başarılı', 'Masa başarıyla eklendi.');
    setNewTableNumber('');
    setNewTableCapacity('');
    setShowAddTableModal(false);
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
      color: Colors.error,
    },
    {
      id: 'menu',
      title: 'Menü Yönetimi',
      description: 'Ürün ekleme/düzenleme',
      icon: '🍽️',
      color: Colors.warning,
    },
    {
      id: 'tables',
      title: 'Masa Yönetimi',
      description: 'QR kod oluşturma',
      icon: '🪑',
      color: Colors.success,
    },
    {
      id: 'reports',
      title: 'Raporlar',
      description: 'Satış analizleri',
      icon: '📊',
      color: Colors.secondary,
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
                      // Action handled
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

      {/* Masa Ekleme Modalı */}
      <Modal
        visible={showAddTableModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddTableModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Masa Ekle</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Masa Numarası</Text>
              <TextInput
                style={styles.textInput}
                value={newTableNumber}
                onChangeText={setNewTableNumber}
                placeholder="Masa numarasını giriniz"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kapasite</Text>
              <TextInput
                style={styles.textInput}
                value={newTableCapacity}
                onChangeText={setNewTableCapacity}
                placeholder="Kişi sayısını giriniz"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="İptal"
                onPress={() => setShowAddTableModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title="Ekle"
                onPress={handleAddTable}
                style={[styles.modalButton, styles.addButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
    height: '100%', // Web için height ekle
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
    flexGrow: 1, // Web için flexGrow ekle
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  businessName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  adminBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activitySection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.gray50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: Colors.gray200,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
});

export default AdminDashboard;
