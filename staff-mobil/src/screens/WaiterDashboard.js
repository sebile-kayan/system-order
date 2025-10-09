import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Dimensions, TouchableOpacity } from 'react-native';
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
  Divider,
  IconButton,
  Appbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  SERVICE_NEEDED: 'service_needed',
  PAYMENT_WAITING: 'payment_waiting',
  RESERVED: 'reserved'
};

const ORDER_STATUS = {
  READY: 'ready',
  SERVED: 'served'
};

const STATUS_COLORS = {
  [TABLE_STATUS.AVAILABLE]: '#4caf50', // Yeşil - Boş
  [TABLE_STATUS.OCCUPIED]: '#2196f3', // Mavi - Dolu
  [TABLE_STATUS.CLEANING]: '#9e9e9e', // Gri - Temizlenmeli
  [TABLE_STATUS.SERVICE_NEEDED]: '#ff9800', // Turuncu - Servis Gerekli
  [TABLE_STATUS.PAYMENT_WAITING]: '#f44336', // Kırmızı - Ödeme Bekliyor
  [TABLE_STATUS.RESERVED]: '#9c27b0' // Mor - Rezerve
};

const STATUS_LABELS = {
  [TABLE_STATUS.AVAILABLE]: 'Boş',
  [TABLE_STATUS.OCCUPIED]: 'Dolu',
  [TABLE_STATUS.CLEANING]: 'Temizlenmeli',
  [TABLE_STATUS.SERVICE_NEEDED]: 'Servis Gerekli',
  [TABLE_STATUS.PAYMENT_WAITING]: 'Ödeme Bekliyor',
  [TABLE_STATUS.RESERVED]: 'Rezerve'
};

const STATUS_ICONS = {
  [TABLE_STATUS.AVAILABLE]: 'check-circle',
  [TABLE_STATUS.OCCUPIED]: 'account-group',
  [TABLE_STATUS.CLEANING]: 'broom',
  [TABLE_STATUS.SERVICE_NEEDED]: 'bell',
  [TABLE_STATUS.PAYMENT_WAITING]: 'credit-card',
  [TABLE_STATUS.RESERVED]: 'calendar-clock'
};

// Mock data
const mockTables = [
  { id: 1, number: 1, status: TABLE_STATUS.OCCUPIED, lastUpdate: '3 dk önce', customerCount: 2 },
  { id: 2, number: 2, status: TABLE_STATUS.AVAILABLE, lastUpdate: '15 dk önce', customerCount: 0 },
  { id: 3, number: 3, status: TABLE_STATUS.SERVICE_NEEDED, lastUpdate: '5 dk önce', customerCount: 4 },
  { id: 4, number: 4, status: TABLE_STATUS.CLEANING, lastUpdate: '2 dk önce', customerCount: 0 },
  { id: 5, number: 5, status: TABLE_STATUS.PAYMENT_WAITING, lastUpdate: '1 dk önce', customerCount: 3 },
  { id: 6, number: 6, status: TABLE_STATUS.OCCUPIED, lastUpdate: '8 dk önce', customerCount: 2 },
  { id: 7, number: 7, status: TABLE_STATUS.AVAILABLE, lastUpdate: '20 dk önce', customerCount: 0 },
  { id: 8, number: 8, status: TABLE_STATUS.RESERVED, lastUpdate: '30 dk önce', customerCount: 0 },
  { id: 9, number: 9, status: TABLE_STATUS.SERVICE_NEEDED, lastUpdate: '12 dk önce', customerCount: 6 },
  { id: 10, number: 10, status: TABLE_STATUS.AVAILABLE, lastUpdate: '25 dk önce', customerCount: 0 },
  { id: 11, number: 11, status: TABLE_STATUS.OCCUPIED, lastUpdate: '7 dk önce', customerCount: 4 },
  { id: 12, number: 12, status: TABLE_STATUS.CLEANING, lastUpdate: '4 dk önce', customerCount: 0 }
];

const FILTERS = [
  { id: 'all', label: 'Hepsi', count: mockTables.length },
  { id: TABLE_STATUS.SERVICE_NEEDED, label: 'Servis Gerekli', count: mockTables.filter(t => t.status === TABLE_STATUS.SERVICE_NEEDED).length },
  { id: TABLE_STATUS.CLEANING, label: 'Temizlenmeli', count: mockTables.filter(t => t.status === TABLE_STATUS.CLEANING).length },
  { id: TABLE_STATUS.PAYMENT_WAITING, label: 'Ödeme Bekliyor', count: mockTables.filter(t => t.status === TABLE_STATUS.PAYMENT_WAITING).length },
  { id: TABLE_STATUS.OCCUPIED, label: 'Dolu', count: mockTables.filter(t => t.status === TABLE_STATUS.OCCUPIED).length },
  { id: TABLE_STATUS.AVAILABLE, label: 'Boş', count: mockTables.filter(t => t.status === TABLE_STATUS.AVAILABLE).length }
];

export default function WaiterDashboard() {
  const { user, availableRoles, switchRole, logout, currentRole } = useAuth();
  const [tables, setTables] = useState(mockTables);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tables');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getFilteredTables = () => {
    if (selectedFilter === 'all') {
      return tables;
    }
    return tables.filter(table => table.status === selectedFilter);
  };

  const renderHeader = () => (
    <Appbar.Header style={styles.header}>
      <View style={styles.headerLeft}>
        <Avatar.Text 
          size={50} 
          label={user?.full_name?.charAt(0) || 'G'} 
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Title style={styles.userName}>{user?.full_name || 'Garson'}</Title>
          <Paragraph style={styles.userRole}>Garson</Paragraph>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <IconButton 
          icon="bell" 
          size={24} 
          iconColor="white"
          style={styles.notificationIcon}
        />
        <IconButton 
          icon="account-switch" 
          size={24} 
          iconColor="white"
          onPress={() => {
            if (availableRoles.length > 1) {
              Alert.alert('Rol Değiştir', 'Rol değiştirme özelliği yakında eklenecek');
            }
          }}
        />
      </View>
    </Appbar.Header>
  );

  const renderPageHeader = () => (
    <View style={styles.pageHeader}>
      <Title style={styles.pageTitle}>Masalar</Title>
      <Paragraph style={styles.pageSubtitle}>
        Restoranınızdaki masaların anlık durumunu takip edin
      </Paragraph>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setSelectedFilter(filter.id)}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.activeFilterButton
            ]}
          >
            <Paragraph style={[
              styles.filterButtonText,
              selectedFilter === filter.id && styles.activeFilterButtonText
            ]}>
              {filter.label} ({filter.count})
            </Paragraph>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTables = () => {
    const filteredTables = getFilteredTables();
    
    return (
      <View style={styles.tablesGrid}>
        {filteredTables.map((table) => (
          <Card key={table.id} style={styles.tableCard}>
            <Card.Content style={styles.tableCardContent}>
              <View style={styles.tableHeader}>
                <Title style={styles.tableNumber}>Masa {table.number}</Title>
                <IconButton 
                  icon={STATUS_ICONS[table.status]}
                  size={20}
                  iconColor={STATUS_COLORS[table.status]}
                  style={styles.statusIcon}
                />
              </View>
              
              <View style={styles.tableStatusContainer}>
                <Paragraph style={[
                  styles.tableStatus,
                  { color: STATUS_COLORS[table.status] }
                ]}>
                  {STATUS_LABELS[table.status]}
                </Paragraph>
                {table.customerCount > 0 && (
                  <Paragraph style={styles.customerCount}>
                    {table.customerCount} kişi
                  </Paragraph>
                )}
              </View>
              
              <Paragraph style={styles.tableTime}>
                {table.lastUpdate}
              </Paragraph>
              
              {table.status === TABLE_STATUS.OCCUPIED && (
                <Button
                  mode="contained"
                  onPress={() => updateTableStatus(table.id, TABLE_STATUS.AVAILABLE)}
                  style={styles.actionButton}
                >
                  Masa Boşalt
                </Button>
              )}
              {table.status === TABLE_STATUS.CLEANING && (
                <Button
                  mode="contained"
                  onPress={() => markTableClean(table.id)}
                  style={styles.actionButton}
                >
                  Temizle
                </Button>
              )}
              {table.status === TABLE_STATUS.SERVICE_NEEDED && (
                <Button
                  mode="contained"
                  onPress={() => updateTableStatus(table.id, TABLE_STATUS.OCCUPIED)}
                  style={styles.actionButton}
                >
                  Servis Verildi
                </Button>
              )}
              {table.status === TABLE_STATUS.PAYMENT_WAITING && (
                <Button
                  mode="contained"
                  onPress={() => updateTableStatus(table.id, TABLE_STATUS.CLEANING)}
                  style={styles.actionButton}
                >
                  Ödeme Alındı
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      // Mock update
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId ? { ...table, status } : table
        )
      );
      Alert.alert('Başarılı', 'Masa durumu güncellendi');
    } catch (error) {
      console.error('Update table error:', error);
      Alert.alert('Hata', 'Masa durumu güncellenirken bir hata oluştu');
    }
  };

  const markTableClean = async (tableId) => {
    try {
      // Mock update
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId ? { ...table, status: TABLE_STATUS.AVAILABLE } : table
        )
      );
      Alert.alert('Başarılı', 'Masa temiz olarak işaretlendi');
    } catch (error) {
      console.error('Mark table clean error:', error);
      Alert.alert('Hata', 'Masa temizleme işaretlenirken bir hata oluştu');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderPageHeader()}
        {renderFilters()}
        {renderTables()}
      </ScrollView>

      {/* Floating Action Buttons */}
      <FAB
        icon="refresh"
        style={styles.refreshFab}
        onPress={onRefresh}
        loading={refreshing}
      />
      <FAB
        icon="logout"
        style={styles.logoutFab}
        onPress={logout}
        label="Çıkış"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 8,
  },
  pageHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filtersScrollContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tableCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
  },
  tableCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusIcon: {
    margin: 0,
  },
  tableStatusContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tableStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  tableTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  actionButton: {
    width: '100%',
    borderRadius: 8,
  },
  refreshFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#1e3a8a',
  },
  logoutFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
  },
});