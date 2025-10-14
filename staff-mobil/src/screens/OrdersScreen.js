/**
 * ORDERS SCREEN - Siparişler Ekranı
 * 
 * Bu ekran tüm roller için ortak sipariş görüntüleme ekranıdır. Tüm aktif siparişleri,
 * sipariş durumlarını ve detaylarını gösterir. Rol bazlı filtreleme ve işlem seçenekleri sunar.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const OrdersScreen = () => {
  const { user, currentRole, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const [orders, setOrders] = useState([
    {
      id: 1,
      tableNumber: 'Masa 1',
      customerCount: 2,
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 45.00, status: 'served' },
        { name: 'Salata', quantity: 1, price: 25.00, status: 'served' },
      ],
      total: 70.00,
      status: 'served',
      orderTime: '13:45',
      estimatedTime: '15 dk',
      paymentStatus: 'completed',
    },
    {
      id: 2,
      tableNumber: 'Masa 3',
      customerCount: 4,
      items: [
        { name: 'Adana Kebab', quantity: 2, price: 55.00, status: 'ready' },
        { name: 'Ayran', quantity: 2, price: 15.00, status: 'ready' },
        { name: 'Salata', quantity: 1, price: 25.00, status: 'preparing' },
      ],
      total: 165.00,
      status: 'preparing',
      orderTime: '13:30',
      estimatedTime: '10 dk',
      paymentStatus: 'pending',
    },
    {
      id: 3,
      tableNumber: 'Masa 5',
      customerCount: 1,
      items: [
        { name: 'Cheeseburger', quantity: 1, price: 35.00, status: 'preparing' },
        { name: 'Patates Kızartması', quantity: 1, price: 20.00, status: 'pending' },
        { name: 'Cola', quantity: 1, price: 15.00, status: 'ready' },
      ],
      total: 70.00,
      status: 'preparing',
      orderTime: '13:20',
      estimatedTime: '12 dk',
      paymentStatus: 'pending',
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
      case 'served': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'served': return 'Teslim Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ödeme Bekliyor';
      case 'completed': return 'Ödeme Alındı';
      default: return 'Bilinmiyor';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'pending') return matchesSearch && order.status === 'pending';
    if (selectedFilter === 'preparing') return matchesSearch && order.status === 'preparing';
    if (selectedFilter === 'ready') return matchesSearch && order.status === 'ready';
    if (selectedFilter === 'served') return matchesSearch && order.status === 'served';
    
    return matchesSearch;
  });

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'pending', label: 'Bekliyor' },
    { key: 'preparing', label: 'Hazırlanıyor' },
    { key: 'ready', label: 'Hazır' },
    { key: 'served', label: 'Teslim Edildi' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Siparişler</Text>
          <Text style={styles.headerSubtitle}>
            {currentRole === 'admin' ? 'Yönetici' :
             currentRole === 'chef' ? 'Şef' :
             currentRole === 'waiter' ? 'Garson' :
             currentRole === 'cashier' ? 'Kasiyer' : 'Çalışan'} Görünümü
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Arama ve Filtre */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Masa numarası veya ürün ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
            accessibilityLabel="Sipariş arama"
            testID="orders-search-input"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sipariş Listesi */}
        <View style={styles.ordersSection}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>Sipariş Bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Arama kriterlerinize uygun sipariş bulunmuyor
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.tableNumber}>{order.tableNumber}</Text>
                    <Text style={styles.orderInfo}>
                      {order.customerCount} kişi • {order.orderTime} • {order.estimatedTime}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                    </View>
                    <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(order.paymentStatus) }]}>
                      <Text style={styles.paymentText}>{getPaymentStatusText(order.paymentStatus)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.itemsSection}>
                  <Text style={styles.itemsTitle}>Sipariş İçeriği:</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={styles.itemPrice}>₺{item.price.toFixed(2)}</Text>
                        <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                          <Text style={styles.itemStatusText}>{getStatusText(item.status)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.totalAmount}>Toplam: ₺{order.total.toFixed(2)}</Text>
                  
                  {(hasRole('chef') || hasRole('admin')) && order.status === 'preparing' && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Hazır İşaretle</Text>
                    </TouchableOpacity>
                  )}
                  
                  {(hasRole('waiter') || hasRole('admin')) && order.status === 'ready' && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Teslim Et</Text>
                    </TouchableOpacity>
                  )}
                  
                  {(hasRole('cashier') || hasRole('admin')) && order.paymentStatus === 'pending' && (
                    <TouchableOpacity style={styles.paymentButton}>
                      <Text style={styles.paymentButtonText}>Ödeme Al</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
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
  safeArea: {
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  ordersSection: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  paymentButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrdersScreen;
