import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Surface, 
  Avatar,
  Badge,
  FAB,
  Divider
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served'
};

const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#ff9800',
  [ORDER_STATUS.CONFIRMED]: '#2196f3',
  [ORDER_STATUS.PREPARING]: '#9c27b0',
  [ORDER_STATUS.READY]: '#4caf50',
  [ORDER_STATUS.SERVED]: '#607d8b'
};

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Bekliyor',
  [ORDER_STATUS.CONFIRMED]: 'Onaylandı',
  [ORDER_STATUS.PREPARING]: 'Hazırlanıyor',
  [ORDER_STATUS.READY]: 'Hazır',
  [ORDER_STATUS.SERVED]: 'Teslim Edildi'
};

export default function ChefDashboard() {
  const { user, availableRoles, switchRole, logout, currentRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ORDER_STATUS.PENDING);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders({ 
        status: selectedStatus,
        role: 'chef' 
      });
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Orders load error:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Listeyi yenile
      Alert.alert('Başarılı', 'Sipariş durumu güncellendi');
    } catch (error) {
      console.error('Update order error:', error);
      Alert.alert('Hata', 'Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PENDING:
        return ORDER_STATUS.CONFIRMED;
      case ORDER_STATUS.CONFIRMED:
        return ORDER_STATUS.PREPARING;
      case ORDER_STATUS.PREPARING:
        return ORDER_STATUS.READY;
      default:
        return null;
    }
  };

  const getStatusButtonText = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PENDING:
        return 'Onayla';
      case ORDER_STATUS.CONFIRMED:
        return 'Hazırlamaya Başla';
      case ORDER_STATUS.PREPARING:
        return 'Hazır İşaretle';
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalItems = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

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
            label={user?.full_name?.charAt(0) || 'Ş'} 
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Title style={styles.userName}>{user?.full_name}</Title>
            <Paragraph style={styles.userRole}>👨‍🍳 Şef</Paragraph>
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
        {/* Status Filter */}
        <View style={styles.statusFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.values(ORDER_STATUS).map((status) => (
              <Chip
                key={status}
                selected={selectedStatus === status}
                onPress={() => setSelectedStatus(status)}
                style={[
                  styles.statusChip,
                  selectedStatus === status && { backgroundColor: STATUS_COLORS[status] }
                ]}
                textStyle={[
                  styles.statusChipText,
                  selectedStatus === status && { color: 'white' }
                ]}
              >
                {STATUS_LABELS[status]}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <ScrollView 
          style={styles.ordersList}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders.length === 0 ? (
            <Surface style={styles.emptyState} elevation={2}>
              <Title style={styles.emptyTitle}>Sipariş Yok</Title>
              <Paragraph style={styles.emptyText}>
                {STATUS_LABELS[selectedStatus]} durumunda sipariş bulunmuyor.
              </Paragraph>
            </Surface>
          ) : (
            orders.map((order) => (
              <Card key={order.id} style={styles.orderCard} elevation={3}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Title style={styles.orderNumber}>#{order.order_number}</Title>
                      <Paragraph style={styles.tableInfo}>
                        Masa {order.table?.table_number} • {formatTime(order.created_at)}
                      </Paragraph>
                    </View>
                    <Badge 
                      size={24} 
                      style={{ backgroundColor: STATUS_COLORS[order.status] }}
                    >
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.orderItems}>
                    {order.items?.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <Paragraph style={styles.itemName}>
                          {item.quantity}x {item.menu_item?.name}
                        </Paragraph>
                        {item.special_instructions && (
                          <Paragraph style={styles.specialInstructions}>
                            Not: {item.special_instructions}
                          </Paragraph>
                        )}
                      </View>
                    ))}
                  </View>

                  <View style={styles.orderFooter}>
                    <Paragraph style={styles.totalItems}>
                      Toplam {getTotalItems(order.items || [])} ürün
                    </Paragraph>
                    <Paragraph style={styles.totalAmount}>
                      ₺{order.total_amount}
                    </Paragraph>
                  </View>

                  {getNextStatus(order.status) && (
                    <Button
                      mode="contained"
                      onPress={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                      style={[
                        styles.statusButton,
                        { backgroundColor: STATUS_COLORS[getNextStatus(order.status)] }
                      ]}
                    >
                      {getStatusButtonText(order.status)}
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      {/* Floating Action Buttons */}
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        loading={refreshing}
      />
      <FAB
        icon="logout"
        style={styles.logoutFab}
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
  statusFilter: {
    padding: 16,
    paddingBottom: 8,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: 'white',
  },
  statusChipText: {
    fontSize: 12,
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // FAB butonları için boşluk
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  tableInfo: {
    fontSize: 12,
    color: '#718096',
  },
  divider: {
    marginVertical: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
  },
  specialInstructions: {
    fontSize: 12,
    color: '#e53e3e',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalItems: {
    fontSize: 12,
    color: '#718096',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statusButton: {
    borderRadius: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  logoutFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#e53e3e',
  },
});
