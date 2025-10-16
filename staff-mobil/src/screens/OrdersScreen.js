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
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

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
      case 'pending': return Colors.warning;
      case 'preparing': return Colors.info;
      case 'ready': return Colors.success;
      case 'served': return Colors.gray500;
      default: return Colors.gray500;
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
      case 'pending': return Colors.warning;
      case 'completed': return Colors.success;
      default: return Colors.gray500;
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
        <Card style={styles.searchSection}>
          <Input
            label="Sipariş Ara"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Masa numarası veya ürün ara..."
            accessibilityLabel="Sipariş arama"
            testID="orders-search-input"
            style={styles.searchInput}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map((filter) => (
              <Button
                key={filter.key}
                title={filter.label}
                variant={selectedFilter === filter.key ? 'primary' : 'outline'}
                size="small"
                onPress={() => setSelectedFilter(filter.key)}
                style={styles.filterButton}
              />
            ))}
          </ScrollView>
        </Card>

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
              <Card key={order.id} style={styles.orderCard}>
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
                </View>
              </Card>
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
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.styles.h2,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
  },
  searchSection: {
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  searchInput: {
    marginBottom: Spacing.lg,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
  },
  filterButton: {
    marginRight: Spacing.sm,
  },
  ordersSection: {
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  orderCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  tableNumber: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
  },
  orderInfo: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.xs,
  },
  statusText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
  },
  paymentText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
  },
  itemsSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemsTitle: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  itemQuantity: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  itemStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.sm,
  },
  itemStatusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalAmount: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  actionButton: {
    marginLeft: Spacing.sm,
  },
  paymentButton: {
    marginLeft: Spacing.sm,
  },
});

export default OrdersScreen;
