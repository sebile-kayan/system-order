/**
 * CASHIER DASHBOARD - Kasiyer Ana Ekranı
 * 
 * Bu ekran kasiyer rolündeki kullanıcılar için tasarlanmıştır. Ödeme işlemleri,
 * masa ödeme durumu güncelleme, günlük kasa raporu ve ödeme takibi araçlarına erişim sağlar.
 */
import React, { useState } from 'react';
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

const CashierDashboard = () => {
  const { user, business, currentRole, hasRole, switchRole, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  const [tables, setTables] = useState([
    {
      id: 1,
      tableNumber: 'Masa 1',
      status: 'payment_requested', // Garson ödeme istedi
      customerCount: 2,
      amount: 125.50,
      orderItems: [
        { name: 'Margherita Pizza x1', price: 85.00 },
        { name: 'Salata x1', price: 40.50 }
      ],
      orderTime: '25 dk önce',
      paymentTime: null,
    },
    {
      id: 2,
      tableNumber: 'Masa 3',
      status: 'payment_completed', // Ödeme alındı, müşteriler hala masada
      customerCount: 4,
      amount: 245.00,
      orderItems: [
        { name: 'Adana Kebab x2', price: 180.00 },
        { name: 'Ayran x2', price: 20.00 },
        { name: 'Salata x1', price: 45.00 }
      ],
      orderTime: '30 dk önce',
      paymentTime: '10 dk önce',
    },
    {
      id: 3,
      tableNumber: 'Masa 5',
      status: 'empty',
      customerCount: 0,
      amount: 0,
      orderItems: [],
      orderTime: null,
      paymentTime: null,
    },
  ]);

  const [dailyStats, setDailyStats] = useState({
    totalRevenue: 1250.50,
    completedPayments: 8,
    pendingPayments: 2,
    averageAmount: 156.31,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handlePaymentComplete = (tableId) => {
    Alert.alert(
      'Ödeme Onayı',
      'Bu masanın ödemesini tamamladığınızı onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ödemeyi Al',
          onPress: () => {
            setTables(prevTables =>
              prevTables.map(table =>
                table.id === tableId
                  ? { ...table, status: 'payment_completed', paymentTime: 'Şimdi' }
                  : table
              )
            );
          }
        }
      ]
    );
  };


  const getAvailableRoles = () => {
    const roleButtons = [
      { id: 'admin', name: 'Yönetici', icon: '👑', color: '#dc2626' },
      { id: 'chef', name: 'Şef', icon: '👨‍🍳', color: '#ea580c' },
      { id: 'waiter', name: 'Garson', icon: '👨‍💼', color: '#059669' },
    ];
    return roleButtons.filter(role => hasRole(role.id));
  };

  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  const paymentRequestedTables = tables.filter(table => table.status === 'payment_requested');
  const paymentCompletedTables = tables.filter(table => table.status === 'payment_completed');
  const emptyTables = tables.filter(table => table.status === 'empty');

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
            <Text style={styles.businessName}>{business?.name} - Kasa</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.cashierBadge}>
              <Text style={styles.cashierBadgeText}>💰 KASİYER</Text>
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

        {/* Günlük İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Günlük Kasa Durumu</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₺{dailyStats.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Toplam Ciro</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dailyStats.completedPayments}</Text>
              <Text style={styles.statLabel}>Tamamlanan Ödeme</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{dailyStats.pendingPayments}</Text>
              <Text style={styles.statLabel}>Bekleyen Ödeme</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₺{dailyStats.averageAmount.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Ortalama Tutar</Text>
            </View>
          </View>
        </View>

        {/* Masa Durumları */}
        <View style={styles.tablesSection}>
          <Text style={styles.sectionTitle}>🪑 Masa Durumları</Text>
          
          {/* Ödeme İstenen Masalar */}
          {paymentRequestedTables.length > 0 && (
            <View style={styles.tableGroup}>
              <Text style={styles.groupTitle}>🚨 Ödeme İstenen Masalar</Text>
              {paymentRequestedTables.map((table) => (
                <View key={table.id} style={styles.paymentCard}>
                  <View style={styles.tableHeader}>
                    <View>
                      <Text style={styles.tableNumber}>{table.tableNumber}</Text>
                      <Text style={styles.tableInfo}>
                        {table.customerCount} kişi • {table.orderTime}
                      </Text>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={styles.amount}>₺{table.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemsContainer}>
                    <Text style={styles.itemsTitle}>Sipariş Detayları:</Text>
                    {table.orderItems.map((item, index) => (
                      <View key={index} style={styles.orderItemRow}>
                        <Text style={styles.orderItem}>• {item.name}</Text>
                        <Text style={styles.orderPrice}>₺{item.price.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => handlePaymentComplete(table.id)}
                  >
                    <Text style={styles.paymentButtonText}>💳 Ödemeyi Al</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Ödeme Tamamlanan Masalar */}
          {paymentCompletedTables.length > 0 && (
            <View style={styles.tableGroup}>
              <Text style={styles.groupTitle}>✅ Ödeme Alındı</Text>
              {paymentCompletedTables.map((table) => (
                <View key={table.id} style={styles.completedCard}>
                  <View style={styles.tableHeader}>
                    <View>
                      <Text style={styles.completedTableNumber}>{table.tableNumber}</Text>
                      <Text style={styles.completedInfo}>
                        {table.customerCount} kişi • Ödeme: {table.paymentTime}
                      </Text>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={styles.completedAmount}>₺{table.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Boş Masalar */}
          <View style={styles.tableGroup}>
            <Text style={styles.groupTitle}>🆓 Boş Masalar ({emptyTables.length} adet)</Text>
            <View style={styles.emptyTablesGrid}>
              {emptyTables.map((table) => (
                <View key={table.id} style={styles.emptyTableCard}>
                  <Text style={styles.emptyTableNumber}>{table.tableNumber}</Text>
                  <Text style={styles.emptyTableText}>Boş</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Kasiyer Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#7c3aed' }]}>
                <Text style={styles.actionIconText}>📊</Text>
              </View>
              <Text style={styles.actionTitle}>Günlük Kasa Raporu</Text>
              <Text style={styles.actionDescription}>Kasa raporu görüntüle</Text>
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
  cashierBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cashierBadgeText: {
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tablesSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
  },
  tableGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  paymentCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  emptyTablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyTableCard: {
    width: '30%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTableNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyTableText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  tableInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  completedTableNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  completedInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  completedAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  itemsContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderItem: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  orderPrice: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginTop: 12,
  },
  statusInfoText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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

export default CashierDashboard;
