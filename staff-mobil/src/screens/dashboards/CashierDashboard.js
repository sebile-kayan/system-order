/**
 * CASHIER DASHBOARD - Kasiyer Ana Ekranı
 * 
 * Bu ekran kasiyer rolündeki kullanıcılar için tasarlanmıştır. Ödeme işlemleri,
 * masa ödeme durumu güncelleme, günlük kasa raporu ve ödeme takibi araçlarına erişim sağlar.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth, getAvailableRoles, getRoleConfig } from '../../context/AuthRolesContext';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import DailySummaryCard from '../../components/DailySummaryCard';

const CashierDashboard = () => {
  const { user, business, currentRole, hasRole, switchRole, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  const [tables, setTables] = useState([
    {
      id: 1,
      tableNumber: 'Masa 3',
      status: 'payment_waiting', // Müşteri KASİYERİ çağırdı, ödeme bekliyor
      customerCount: 4,
      amount: 245.00,
      orderItems: [
        { name: 'Adana Kebab x2', price: 180.00 },
        { name: 'Ayran x2', price: 20.00 },
        { name: 'Salata x1', price: 45.00 }
      ],
      orderTime: '30 dk önce',
      paymentTime: null,
    },
    {
      id: 2,
      tableNumber: 'Masa 7',
      status: 'payment_waiting', // Müşteri KASİYERİ çağırdı, ödeme bekliyor
      customerCount: 2,
      amount: 125.50,
      orderItems: [
        { name: 'Margherita Pizza x1', price: 85.00 },
        { name: 'Salata x1', price: 40.50 }
      ],
      orderTime: '15 dk önce',
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
    // Mock verilerle çalışıyoruz, sadece loading simülasyonu
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handlePaymentComplete = (tableId) => {
    // KASİYER: ÖDEME BEKLENİYOR → "Ödeme alındı işaretle" → Garson ekranına geçer
    Alert.alert(
      'Ödeme Alındı İşaretle',
      'Bu masanın ödemesini tamamladığınızı onaylıyor musunuz? Ödeme alındıktan sonra masa garson ekranına düşecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'ÖDEME ALINDI İŞARETLE',
          onPress: () => {
            setTables(prevTables =>
              prevTables.map(table =>
                table.id === tableId
                  ? { ...table, status: 'payment_completed', paymentTime: 'Şimdi' }
                  : table
              )
            );
            // Masa artık kasiyer ekranından çıkar, garson ekranına düşer
            setTimeout(() => {
              setTables(prevTables =>
                prevTables.filter(table => table.id !== tableId)
              );
            }, 2000); // 2 saniye sonra kaldır
          }
        }
      ]
    );
  };


  const availableRoles = useMemo(() => {
    if (!user?.roles) return [];
    const roleButtons = [
      { id: 'admin', name: 'Yönetici', icon: '👑', color: Colors.error },
      { id: 'chef', name: 'Şef', icon: '👨‍🍳', color: Colors.warning },
      { id: 'waiter', name: 'Garson', icon: '👨‍💼', color: Colors.success },
    ];
    return roleButtons.filter(role => user.roles.includes(role.id));
  }, [user?.roles]);

  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  const paymentWaitingTables = tables.filter(table => table.status === 'payment_waiting');
  const completedPayments = tables.filter(table => table.status === 'payment_completed');

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
        {availableRoles.length > 0 && (
          <View style={styles.roleSwitchSection}>
            <Text style={styles.roleSwitchTitle}>Hızlı Rol Değiştirme</Text>
            <View style={styles.roleSwitchButtons}>
              {availableRoles.map((role) => (
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
            <DailySummaryCard 
              number={`₺${dailyStats.totalRevenue.toFixed(0)}`} 
              label="Toplam Ciro" 
              color={Colors.success}
            />
            <DailySummaryCard 
              number={dailyStats.completedPayments} 
              label="Tamamlanan Ödeme" 
              color={Colors.info}
            />
            <DailySummaryCard 
              number={paymentWaitingTables.length} 
              label="Ödeme Bekleniyor" 
              color={Colors.warning}
            />
            <DailySummaryCard 
              number={`₺${dailyStats.averageAmount.toFixed(0)}`} 
              label="Ortalama Tutar" 
              color={Colors.secondary}
            />
          </View>
        </View>

        {/* Ödeme Bekleniyor Masalar - Müşteri KASİYERİ çağırdı */}
        <View style={styles.tablesSection}>
   
          {paymentWaitingTables.length > 0 ? (
            <View style={styles.tableGroup}>
              <Text style={styles.groupTitle}>💰 ÖDEME BEKLENİYOR ({paymentWaitingTables.length} adet)</Text>
              {paymentWaitingTables.map((table) => (
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
                    <Text style={styles.paymentButtonText}>💳 ÖDEME ALINDI İŞARETLE</Text>
                  </TouchableOpacity>
                </View>

              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>🎉 Şu anda ödeme bekleyen masa yok!</Text>
            </View>
          )}
        </View>

      </ScrollView>
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
    backgroundColor: '#dc2626',
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
  cashierBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cashierBadgeText: {
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tablesSection: {
    padding: 20,
    backgroundColor: Colors.surface,
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
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.gray50,
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
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
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
    color: Colors.white,
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
    color: Colors.white,
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
  emptyState: {
    backgroundColor: '#f0f9ff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#0369a1',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CashierDashboard;
