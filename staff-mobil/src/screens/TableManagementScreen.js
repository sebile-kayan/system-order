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
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';

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

  // Sadece admin erişebilir
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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    const colors = {
      empty: Colors.success,
      occupied: Colors.warning,
      reserved: Colors.info,
      maintenance: Colors.error,
    };
    return colors[status] || Colors.gray200;
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

  const handleAddTable = () => {
    Alert.alert('Yeni Masa', 'Yeni masa ekleme özelliği yakında eklenecek.');
  };

  const handleRemoveTable = (tableId) => {
    Alert.alert(
      'Masa Sil',
      'Bu masayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setTables(tables.filter(t => t.id !== tableId));
          }
        }
      ]
    );
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
        <Card style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Masa Durumları</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{emptyTables}</Text>
              <Text style={styles.statLabel}>Boş</Text>
              <Text style={styles.statIcon}>🟢</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{occupiedTables}</Text>
              <Text style={styles.statLabel}>Dolu</Text>
              <Text style={styles.statIcon}>🟡</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{reservedTables}</Text>
              <Text style={styles.statLabel}>Rezerve</Text>
              <Text style={styles.statIcon}>🟣</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{maintenanceTables}</Text>
              <Text style={styles.statLabel}>Bakım</Text>
              <Text style={styles.statIcon}>🔴</Text>
            </Card>
          </View>
        </Card>

        {/* Masa Listesi */}
        <Card style={styles.tablesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Masa Listesi</Text>
            <Button
              title="+ Yeni Masa"
              variant="primary"
              size="small"
              onPress={handleAddTable}
              style={styles.addButton}
            />
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
              <Card key={table.id} style={styles.tableCard}>
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
                  <Button
                    title="Sil"
                    variant="danger"
                    size="small"
                    onPress={() => handleRemoveTable(table.id)}
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))
          )}
        </Card>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  accessDeniedTitle: {
    ...Typography.styles.h3,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  accessDeniedText: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    padding: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.gray50,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statNumber: {
    ...Typography.styles.h3,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statIcon: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  tablesSection: {
    padding: Spacing.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.sm,
  },
  addButtonText: {
    color: Colors.white,
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
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
  tableCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    ...Typography.styles.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tableCapacity: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    alignSelf: 'flex-start',
  },
  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
  },
  statusText: {
    ...Typography.styles.caption,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  occupancyInfo: {
    backgroundColor: Colors.warningLight,
    padding: Spacing.sm,
    borderRadius: Spacing.radius.sm,
    marginBottom: Spacing.md,
  },
  occupancyText: {
    ...Typography.styles.bodySmall,
    color: Colors.warning,
    textAlign: 'center',
  },
  tableActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  editButton: {
    backgroundColor: Colors.gray500,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    marginBottom: Spacing.sm,
  },
  editButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default TableManagementScreen;
