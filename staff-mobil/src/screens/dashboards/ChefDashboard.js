/**
 * CHEF DASHBOARD - Şef Ana Ekranı
 * 
 * Bu ekran şef rolündeki kullanıcılar için tasarlanmıştır. Yemek siparişlerini görüntüleme,
 * sipariş durumu güncelleme, stok takibi ve mutfak yönetimi araçlarına erişim sağlar.
 */
import React, { useState, useEffect, useMemo } from 'react';
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
import Header from '../../components/Header';
import DailySummaryCard from '../../components/DailySummaryCard';
import FastActionCard from '../../components/FastActionCard';

const ChefDashboard = () => {
  const { user, business, currentRole, hasRole, switchRole, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: 1,
      tableNumber: 'Masa 5',
      items: [
        { name: 'Adana Kebab', quantity: 2, status: 'preparing' },
        { name: 'Ayran', quantity: 1, status: 'ready' },
      ],
      total: 165.00,
      time: '12:45',
      status: 'preparing',
    },
    {
      id: 2,
      tableNumber: 'Masa 3',
      items: [
        { name: 'Margherita Pizza', quantity: 1, status: 'ready' },
        { name: 'Cola', quantity: 2, status: 'ready' },
      ],
      total: 135.00,
      time: '12:30',
      status: 'ready',
    },
    {
      id: 3,
      tableNumber: 'Masa 7',
      items: [
        { name: 'Cheeseburger', quantity: 1, status: 'preparing' },
        { name: 'Patates Kızartması', quantity: 1, status: 'pending' },
      ],
      total: 95.00,
      time: '12:15',
      status: 'preparing',
    },
    {
      id: 4,
      tableNumber: 'Masa 2',
      items: [
        { name: 'Lahmacun', quantity: 3, status: 'pending' },
        { name: 'Ayran', quantity: 3, status: 'pending' },
      ],
      total: 120.00,
      time: '12:50',
      status: 'pending',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel siparişleri çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'preparing': return '#3b82f6';
      case 'ready': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      default: return 'Bilinmiyor';
    }
  };

  const updateItemStatus = (orderId, itemIndex, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item, index) =>
                index === itemIndex ? { ...item, status: newStatus } : item
              ),
            }
          : order
      )
    );
  };

  const roleButtons = [
    { id: 'admin', name: 'Yönetici', icon: '👑', color: '#dc2626' },
    { id: 'waiter', name: 'Garson', icon: '👨‍💼', color: '#059669' },
    { id: 'cashier', name: 'Kasiyer', icon: '💰', color: '#7c3aed' },
  ];

  const availableRoles = useMemo(() => {
    if (!user?.roles) return [];
    return roleButtons.filter(role => user.roles.includes(role.id));
  }, [user?.roles]);

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

        {/* Mutfak Durumu */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Mutfak Durumu</Text>
          <View style={styles.statsGrid}>
            <DailySummaryCard 
              number={orders.filter(o => o.status === 'preparing').length} 
              label="Hazırlanıyor" 
              color="#ea580c"
            />
            <DailySummaryCard 
              number={orders.filter(o => o.status === 'ready').length} 
              label="Hazır" 
              color="#10b981"
            />
            <DailySummaryCard 
              number={orders.filter(o => o.status === 'pending').length} 
              label="Bekliyor" 
              color="#f59e0b"
            />
            <DailySummaryCard 
              number={orders.length} 
              label="Toplam" 
              color="#6b7280"
            />
          </View>
        </View>

        {/* Siparişler */}
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Aktif Siparişler</Text>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.tableNumber}>{order.tableNumber}</Text>
                  <Text style={styles.orderTime}>{order.time} - ₺{order.total.toFixed(2)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.status === 'pending' && styles.actionButtonPending,
                          item.status === 'preparing' && styles.actionButtonPreparing,
                          item.status === 'ready' && styles.actionButtonReady,
                        ]}
                        onPress={() => {
                          let newStatus = 'pending';
                          if (item.status === 'pending') newStatus = 'preparing';
                          else if (item.status === 'preparing') newStatus = 'ready';
                          updateItemStatus(order.id, index, newStatus);
                        }}
                      >
                        <Text style={styles.actionButtonText}>
                          {item.status === 'pending' ? 'Başla' : 
                           item.status === 'preparing' ? 'Hazır' : '✓'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Şef Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <FastActionCard
              title="Zaman Takibi"
              description="Hazırlama sürelerini ayarla"
              icon="⏰"
              color="#ea580c"
              onPress={() => console.log('Zaman takibi tıklandı')}
            />
            <FastActionCard
              title="Stok Durumu"
              description="Mutfak envanteri"
              icon="📊"
              color="#7c3aed"
              onPress={() => console.log('Stok durumu tıklandı')}
            />
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
    paddingBottom: 120, // Bottom navigation için boşluk artırıldı
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
  ordersSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  orderCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
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
  orderTime: {
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
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  actionButtonPending: {
    backgroundColor: '#f59e0b',
  },
  actionButtonPreparing: {
    backgroundColor: '#3b82f6',
  },
  actionButtonReady: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
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
});

export default ChefDashboard;
