/**
 * Masa Yönetimi Ekranı
 * 
 * Restorandaki masaları yönetmek için kullanılır.
 * - Masa durumlarını görüntüleme
 * - Masa kapasitelerini ayarlama
 * - Masa yerleşimini düzenleme
 * - Masa rezervasyonları yönetimi
 * - Masa durumu güncellemeleri
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const TableManagementScreen = ({ navigation }) => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [tables, setTables] = useState([
    { id: 1, number: '1', capacity: 4, status: 'occupied', currentGuests: 2, duration: '25 dk' },
    { id: 2, number: '2', capacity: 2, status: 'empty', currentGuests: 0, duration: null },
    { id: 3, number: '3', capacity: 6, status: 'reserved', currentGuests: 0, duration: null },
    { id: 4, number: '4', capacity: 4, status: 'occupied', currentGuests: 4, duration: '45 dk' },
    { id: 5, number: '5', capacity: 2, status: 'maintenance', currentGuests: 0, duration: null },
    { id: 6, number: '6', capacity: 8, status: 'empty', currentGuests: 0, duration: null },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    const colors = {
      empty: '#10b981',
      occupied: '#f59e0b',
      reserved: '#8b5cf6',
      maintenance: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      empty: 'Boş',
      occupied: 'Dolu',
      reserved: 'Rezerve',
      maintenance: 'Bakım',
    };
    return texts[status] || 'Bilinmiyor';
  };

  const getStatusIcon = (status) => {
    const icons = {
      empty: '🟢',
      occupied: '🟡',
      reserved: '🟣',
      maintenance: '🔴',
    };
    return icons[status] || '⚪';
  };

  const handleTableAction = (table, action) => {
    Alert.alert(
      `Masa ${table.number}`,
      `${action} işlemi yakında eklenecek.`
    );
  };

  const handleAddTable = () => {
    Alert.alert('Yeni Masa', 'Yeni masa ekleme özelliği yakında eklenecek.');
  };

  // Admin yetkisi kontrolü
  if (!hasRole('admin')) {
    return (
      <View style={styles.container}>
        <View style={styles.safeArea}>
          <View style={[styles.accessDenied, { paddingTop: 50 }]}>
            <Text style={styles.accessDeniedIcon}>🚫</Text>
            <Text style={styles.accessDeniedTitle}>Erişim Reddedildi</Text>
            <Text style={styles.accessDeniedText}>
              Bu sayfaya erişim için yönetici yetkisi gereklidir.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const emptyTables = tables.filter(t => t.status === 'empty').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;
  const maintenanceTables = tables.filter(t => t.status === 'maintenance').length;

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Masa Yönetimi</Text>
          <Text style={styles.headerSubtitle}>Masa durumları ve yerleşim yönetimi</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Masa Durumları</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emptyTables}</Text>
              <Text style={styles.statLabel}>Boş</Text>
              <Text style={styles.statIcon}>🟢</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{occupiedTables}</Text>
              <Text style={styles.statLabel}>Dolu</Text>
              <Text style={styles.statIcon}>🟡</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{reservedTables}</Text>
              <Text style={styles.statLabel}>Rezerve</Text>
              <Text style={styles.statIcon}>🟣</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{maintenanceTables}</Text>
              <Text style={styles.statLabel}>Bakım</Text>
              <Text style={styles.statIcon}>🔴</Text>
            </View>
          </View>
        </View>

        {/* Masa Listesi */}
        <View style={styles.tablesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Masa Listesi</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTable}>
              <Text style={styles.addButtonText}>+ Yeni Masa</Text>
            </TouchableOpacity>
          </View>

          {tables.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🪑</Text>
              <Text style={styles.emptyStateTitle}>Masa Bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Henüz kayıtlı masa bulunmuyor.
              </Text>
            </View>
          ) : (
            tables.map((table) => (
              <View key={table.id} style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <View style={styles.tableInfo}>
                    <Text style={styles.tableNumber}>Masa {table.number}</Text>
                    <Text style={styles.tableCapacity}>{table.capacity} kişilik</Text>
                  </View>
                  <View style={styles.tableStatus}>
                    <Text style={styles.statusIcon}>{getStatusIcon(table.status)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(table.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(table.status)}</Text>
                    </View>
                  </View>
                </View>

                {table.status === 'occupied' && (
                  <View style={styles.occupancyInfo}>
                    <Text style={styles.occupancyText}>
                      {table.currentGuests} kişi • {table.duration}
                    </Text>
                  </View>
                )}

                <View style={styles.tableActions}>
                  {table.status === 'empty' && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Rezerve Et')}
                      >
                        <Text style={styles.actionButtonText}>Rezerve Et</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Bakıma Al')}
                      >
                        <Text style={styles.actionButtonText}>Bakıma Al</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {table.status === 'occupied' && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Hesap İste')}
                      >
                        <Text style={styles.actionButtonText}>Hesap İste</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Masa Boşalt')}
                      >
                        <Text style={styles.actionButtonText}>Masa Boşalt</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {table.status === 'reserved' && (
                    <>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Rezervasyonu İptal Et')}
                      >
                        <Text style={styles.actionButtonText}>İptal Et</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleTableAction(table, 'Müşteri Geldi')}
                      >
                        <Text style={styles.actionButtonText}>Müşteri Geldi</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {table.status === 'maintenance' && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleTableAction(table, 'Bakımı Tamamla')}
                    >
                      <Text style={styles.actionButtonText}>Bakımı Tamamla</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleTableAction(table, 'Düzenle')}
                  >
                    <Text style={styles.editButtonText}>Düzenle</Text>
                  </TouchableOpacity>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
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
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statIcon: {
    fontSize: 16,
    marginTop: 4,
  },
  tablesSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  tableCapacity: {
    fontSize: 14,
    color: '#6b7280',
  },
  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  occupancyInfo: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  occupancyText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  tableActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TableManagementScreen;
