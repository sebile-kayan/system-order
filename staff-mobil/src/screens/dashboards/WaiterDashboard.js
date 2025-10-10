/**
 * WAITER DASHBOARD - Garson Ana Ekranı
 * 
 * Bu ekran garson rolündeki kullanıcılar için tasarlanmıştır. Masa durumu takibi,
 * sipariş teslimi, müşteri hizmetleri ve masa yönetimi araçlarına erişim sağlar.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const WaiterDashboard = () => {
  const { user, business, currentRole, hasRole, switchRole, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [tables, setTables] = useState([
    {
      id: 1,
      tableNumber: 'Masa 1',
      isOccupied: true,
      customerCount: 2,
      orderStatus: 'served',
      lastActivity: '5 dk önce',
      orderItems: ['Margherita Pizza x1', 'Salata x1'],
    },
    {
      id: 2,
      tableNumber: 'Masa 2',
      isOccupied: false,
      customerCount: 0,
      orderStatus: null,
      paymentStatus: null,
      lastActivity: '15 dk önce',
      orderItems: [],
    },
    {
      id: 3,
      tableNumber: 'Masa 3',
      isOccupied: true,
      customerCount: 4,
      orderStatus: 'ready',
      lastActivity: '2 dk önce',
      orderItems: ['Adana Kebab x2', 'Ayran x2', 'Salata x1'],
    },
    {
      id: 4,
      tableNumber: 'Masa 4',
      isOccupied: false,
      customerCount: 0,
      orderStatus: null,
      lastActivity: '15 dk önce',
      orderItems: [],
    },
    {
      id: 5,
      tableNumber: 'Masa 5',
      isOccupied: true,
      customerCount: 3,
      orderStatus: 'cleaning_needed',
      lastActivity: '3 dk önce',
      orderItems: ['Lahmacun x3', 'Ayran x3'],
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: API'den güncel masa durumlarını çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getTableStatusColor = (table) => {
    if (!table.isOccupied) return '#6b7280';
    if (table.orderStatus === 'ready') return '#10b981';
    if (table.orderStatus === 'served') return '#3b82f6';
    if (table.orderStatus === 'cleaning_needed') return '#059669';
    return '#dc2626';
  };

  const getTableStatusText = (table) => {
    if (!table.isOccupied) return 'Boş';
    if (table.orderStatus === 'ready') return 'Sipariş Hazır';
    if (table.orderStatus === 'served') return 'Teslim Edildi';
    if (table.orderStatus === 'cleaning_needed') return 'Temizlik Gerekli';
    return 'Bekliyor';
  };

  const getTableActionText = (table) => {
    if (!table.isOccupied) return 'Masa Boş';
    if (table.orderStatus === 'ready') return 'Siparişi Teslim Et';
    if (table.orderStatus === 'served') return 'Teslim Edildi';
    if (table.orderStatus === 'cleaning_needed') return 'Masayı Temizle';
    return 'Bekliyor';
  };

  const handleTableAction = (table) => {
    if (table.orderStatus === 'ready') {
      Alert.alert(
        'Sipariş Teslimi',
        `${table.tableNumber} siparişini teslim ettiniz mi?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Teslim Et',
            onPress: () => {
              setTables(prevTables =>
                prevTables.map(t =>
                  t.id === table.id
                    ? { ...t, orderStatus: 'served', lastActivity: 'Şimdi' }
                    : t
                )
              );
            }
          }
        ]
      );
    } else if (table.orderStatus === 'cleaning_needed') {
      Alert.alert(
        'Masa Temizleme',
        `${table.tableNumber} temizlenip boş olarak işaretlenecek mi?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Temizle',
            onPress: () => {
              setTables(prevTables =>
                prevTables.map(t =>
                  t.id === table.id
                    ? { 
                        ...t, 
                        isOccupied: false, 
                        customerCount: 0, 
                        orderStatus: null, 
                        orderItems: [],
                        lastActivity: 'Şimdi'
                      }
                    : t
                )
              );
            }
          }
        ]
      );
    }
  };

  const roleButtons = [
    { id: 'admin', name: 'Yönetici', icon: '👑', color: '#dc2626' },
    { id: 'chef', name: 'Şef', icon: '👨‍🍳', color: '#ea580c' },
    { id: 'cashier', name: 'Kasiyer', icon: '💰', color: '#7c3aed' },
  ];

  const getAvailableRoles = () => {
    return roleButtons.filter(role => hasRole(role.id));
  };

  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  const occupiedTables = tables.filter(table => table.isOccupied);
  const emptyTables = tables.filter(table => !table.isOccupied);
  const readyOrders = tables.filter(table => table.orderStatus === 'ready');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Merhaba, {user?.full_name}</Text>
            <Text style={styles.businessName}>{business?.name} - Servis</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.waiterBadge}>
              <Text style={styles.waiterBadgeText}>👨‍💼 GARSON</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>⏻</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hızlı Rol Değiştirme */}
        {getAvailableRoles().length > 0 && (
          <View style={styles.roleSwitchSection}>
            <Text style={styles.roleSwitchTitle}>Hızlı Rol Değiştirme</Text>
            <View style={styles.roleSwitchButtons}>
              {getAvailableRoles().map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleSwitchButton,
                    { backgroundColor: role.color },
                    currentRole === role.id && styles.activeRoleButton
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

        {/* Servis Durumu */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Servis Durumu</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{occupiedTables.length}</Text>
              <Text style={styles.statLabel}>Dolu Masa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{readyOrders.length}</Text>
              <Text style={styles.statLabel}>Hazır Sipariş</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emptyTables.length}</Text>
              <Text style={styles.statLabel}>Boş Masa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tables.length}</Text>
              <Text style={styles.statLabel}>Toplam Masa</Text>
            </View>
          </View>
        </View>

        {/* Hazır Siparişler */}
        {readyOrders.length > 0 && (
          <View style={styles.urgentSection}>
            <Text style={styles.sectionTitle}>🚨 Hazır Siparişler - Teslim Edilmeyi Bekliyor</Text>
            {readyOrders.map((table) => (
              <View key={table.id} style={styles.urgentCard}>
                <View style={styles.urgentInfo}>
                  <Text style={styles.urgentTableNumber}>{table.tableNumber}</Text>
                  <Text style={styles.urgentTime}>{table.lastActivity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.urgentButton}
                  onPress={() => handleTableAction(table)}
                >
                  <Text style={styles.urgentButtonText}>Siparişi Teslim Et</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Masa Listesi */}
        <View style={styles.tablesSection}>
          <Text style={styles.sectionTitle}>Masa Durumları</Text>
          {tables.map((table) => (
            <View key={table.id} style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View>
                  <Text style={styles.tableNumber}>{table.tableNumber}</Text>
                  <Text style={styles.tableInfo}>
                    {table.isOccupied ? `${table.customerCount} kişi` : 'Boş'}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getTableStatusColor(table) }
                ]}>
                  <Text style={styles.statusText}>{getTableStatusText(table)}</Text>
                </View>
              </View>

              {table.isOccupied && (
                <View style={styles.tableDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Müşteri Sayısı:</Text>
                    <Text style={styles.detailValue}>{table.customerCount} kişi</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Son Aktivite:</Text>
                    <Text style={styles.detailValue}>{table.lastActivity}</Text>
                  </View>
                  {table.orderItems.length > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Siparişler:</Text>
                      <Text style={styles.detailValue}>{table.orderItems.join(', ')}</Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: getTableStatusColor(table) }
                ]}
                onPress={() => handleTableAction(table)}
              >
                <Text style={styles.actionButtonText}>
                  {getTableActionText(table)}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Garson Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#7c3aed' }]}>
                <Text style={styles.actionIconText}>📊</Text>
              </View>
              <Text style={styles.actionTitle}>Servis Raporu</Text>
              <Text style={styles.actionDescription}>Günlük servis durumu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  waiterBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  waiterBadgeText: {
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
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  urgentSection: {
    padding: 20,
    backgroundColor: '#fef2f2',
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  urgentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  urgentInfo: {
    flex: 1,
  },
  urgentTableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  urgentTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  urgentButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  urgentButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tablesSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  tableCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tableInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tableDetails: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
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
});

export default WaiterDashboard;
