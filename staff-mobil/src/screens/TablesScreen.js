/**
 * TABLES SCREEN - Masalar Ekranı
 * 
 * Bu ekran tüm masaların durumunu gösterir. Masa doluluk durumu, sipariş durumları,
 * ödeme durumları ve masa yönetimi işlemlerini içerir. Tüm roller için ortak kullanılır.
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
import { useAuth } from '../context/AuthContext';

const TablesScreen = () => {
  const { user, currentRole, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const [tables, setTables] = useState([
    {
      id: 1,
      tableNumber: 'Masa 1',
      isOccupied: true,
      customerCount: 2,
      orderStatus: 'served',
      paymentStatus: 'completed',
      lastActivity: '5 dk önce',
      totalAmount: 125.50,
      qrCode: 'QR001',
    },
    {
      id: 2,
      tableNumber: 'Masa 2',
      isOccupied: false,
      customerCount: 0,
      orderStatus: null,
      paymentStatus: null,
      lastActivity: '15 dk önce',
      totalAmount: 0,
      qrCode: 'QR002',
    },
    {
      id: 3,
      tableNumber: 'Masa 3',
      isOccupied: true,
      customerCount: 4,
      orderStatus: 'ready',
      paymentStatus: 'pending',
      lastActivity: '2 dk önce',
      totalAmount: 245.00,
      qrCode: 'QR003',
    },
    {
      id: 4,
      tableNumber: 'Masa 4',
      isOccupied: true,
      customerCount: 1,
      orderStatus: 'preparing',
      paymentStatus: 'pending',
      lastActivity: '8 dk önce',
      totalAmount: 85.00,
      qrCode: 'QR004',
    },
    {
      id: 5,
      tableNumber: 'Masa 5',
      isOccupied: true,
      customerCount: 3,
      orderStatus: 'served',
      paymentStatus: 'pending',
      lastActivity: '3 dk önce',
      totalAmount: 180.00,
      qrCode: 'QR005',
    },
    {
      id: 6,
      tableNumber: 'Masa 6',
      isOccupied: false,
      customerCount: 0,
      orderStatus: null,
      paymentStatus: null,
      lastActivity: '25 dk önce',
      totalAmount: 0,
      qrCode: 'QR006',
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
    if (!table.isOccupied) return '#6b7280'; // Boş
    if (table.orderStatus === 'ready') return '#10b981'; // Sipariş hazır
    if (table.orderStatus === 'preparing') return '#f59e0b'; // Hazırlanıyor
    if (table.orderStatus === 'served' && table.paymentStatus === 'completed') return '#3b82f6'; // Ödeme tamamlandı
    if (table.paymentStatus === 'pending') return '#dc2626'; // Ödeme bekliyor
    return '#6b7280';
  };

  const getTableStatusText = (table) => {
    if (!table.isOccupied) return 'Boş';
    if (table.orderStatus === 'ready') return 'Sipariş Hazır';
    if (table.orderStatus === 'preparing') return 'Hazırlanıyor';
    if (table.orderStatus === 'served') return 'Teslim Edildi';
    if (table.paymentStatus === 'completed') return 'Ödeme Tamamlandı';
    if (table.paymentStatus === 'pending') return 'Ödeme Bekliyor';
    return 'Bilinmiyor';
  };

  const getTableActionText = (table) => {
    if (!table.isOccupied) return 'Temizle';
    if (table.orderStatus === 'ready') return 'Siparişi Al';
    if (table.orderStatus === 'served' && table.paymentStatus === 'pending') return 'Ödeme İste';
    if (table.paymentStatus === 'completed') return 'Masa Boşalt';
    return 'Durum Güncelle';
  };

  const handleTableAction = (table) => {
    const actionText = getTableActionText(table);
    
    Alert.alert(
      `${table.tableNumber} - ${actionText}`,
      `Bu masa için "${actionText}" işlemini gerçekleştirmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: actionText,
          onPress: () => {
            // TODO: Masa işlemlerini gerçekleştir
            console.log(`${table.tableNumber} için ${actionText} işlemi gerçekleştirildi`);
          },
        },
      ]
    );
  };

  const handleQRCodeAction = (table) => {
    if (hasRole('admin')) {
      Alert.alert(
        'QR Kod Yönetimi',
        `${table.tableNumber} için QR kod işlemi seçin:`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'QR Kod Görüntüle', onPress: () => console.log('QR kod görüntülendi') },
          { text: 'QR Kod Güncelle', onPress: () => console.log('QR kod güncellendi') },
          { text: 'QR Kod Sil', onPress: () => console.log('QR kod silindi') },
        ]
      );
    } else {
      Alert.alert('QR Kod', `${table.tableNumber} QR Kodu: ${table.qrCode}`);
    }
  };

  const filteredTables = tables.filter(table => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'occupied') return table.isOccupied;
    if (selectedFilter === 'empty') return !table.isOccupied;
    if (selectedFilter === 'pending') return table.paymentStatus === 'pending';
    if (selectedFilter === 'ready') return table.orderStatus === 'ready';
    return true;
  });

  const filters = [
    { key: 'all', label: 'Tümü' },
    { key: 'occupied', label: 'Dolu' },
    { key: 'empty', label: 'Boş' },
    { key: 'pending', label: 'Ödeme Bekliyor' },
    { key: 'ready', label: 'Hazır' },
  ];

  const occupiedCount = tables.filter(t => t.isOccupied).length;
  const emptyCount = tables.filter(t => !t.isOccupied).length;
  const pendingCount = tables.filter(t => t.paymentStatus === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Masa Yönetimi</Text>
        <Text style={styles.headerSubtitle}>
          {occupiedCount} dolu • {emptyCount} boş • {pendingCount} ödeme bekliyor
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{tables.length}</Text>
              <Text style={styles.statLabel}>Toplam Masa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{occupiedCount}</Text>
              <Text style={styles.statLabel}>Dolu Masa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emptyCount}</Text>
              <Text style={styles.statLabel}>Boş Masa</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Ödeme Bekliyor</Text>
            </View>
          </View>
        </View>

        {/* Filtreler */}
        <View style={styles.filterSection}>
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

        {/* Masa Listesi */}
        <View style={styles.tablesSection}>
          {filteredTables.map((table) => (
            <View key={table.id} style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <View>
                  <Text style={styles.tableNumber}>{table.tableNumber}</Text>
                  <Text style={styles.tableInfo}>
                    {table.isOccupied ? `${table.customerCount} kişi` : 'Boş'} • {table.lastActivity}
                  </Text>
                </View>
                <View style={styles.tableActions}>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => handleQRCodeAction(table)}
                  >
                    <Text style={styles.qrButtonText}>QR</Text>
                  </TouchableOpacity>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getTableStatusColor(table) }
                  ]}>
                    <Text style={styles.statusText}>{getTableStatusText(table)}</Text>
                  </View>
                </View>
              </View>

              {table.isOccupied && (
                <View style={styles.tableDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tutar:</Text>
                    <Text style={styles.detailValue}>₺{table.totalAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sipariş Durumu:</Text>
                    <Text style={styles.detailValue}>
                      {table.orderStatus ? getTableStatusText(table) : 'Sipariş Yok'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ödeme Durumu:</Text>
                    <Text style={styles.detailValue}>
                      {table.paymentStatus ? 
                        (table.paymentStatus === 'pending' ? 'Ödeme Bekliyor' : 'Ödeme Alındı') : 
                        'Ödeme Yok'}
                    </Text>
                  </View>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  filterSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
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
  tablesSection: {
    padding: 20,
    paddingBottom: 40,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tableInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tableActions: {
    alignItems: 'flex-end',
  },
  qrButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  qrButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
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
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
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
});

export default TablesScreen;
