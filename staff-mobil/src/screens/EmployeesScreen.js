/**
 * Çalışanlar Ekranı
 * 
 * İşletmedeki çalışanları yönetmek için kullanılır.
 * - Çalışan listesi görüntüleme
 * - Yeni çalışan ekleme
 * - Çalışan bilgilerini düzenleme
 * - Çalışan durumunu değiştirme
 * - Rol atama ve yönetimi
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

const EmployeesScreen = ({ navigation }) => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      role: 'chef',
      status: 'active',
      joinDate: '2023-01-15',
      email: 'ahmet@restaurant.com',
      phone: '0555 123 4567',
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      role: 'waiter',
      status: 'active',
      joinDate: '2023-02-20',
      email: 'ayse@restaurant.com',
      phone: '0555 234 5678',
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      role: 'cashier',
      status: 'inactive',
      joinDate: '2023-03-10',
      email: 'mehmet@restaurant.com',
      phone: '0555 345 6789',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getRoleText = (role) => {
    const roles = {
      admin: 'Yönetici',
      chef: 'Şef',
      waiter: 'Garson',
      cashier: 'Kasiyer',
    };
    return roles[role] || 'Çalışan';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#10b981' : '#ef4444';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Aktif' : 'Pasif';
  };

  const handleAddEmployee = () => {
    Alert.alert('Yeni Çalışan', 'Yeni çalışan ekleme özelliği yakında eklenecek.');
  };

  const handleEditEmployee = (employee) => {
    Alert.alert('Çalışan Düzenle', `${employee.name} düzenleme özelliği yakında eklenecek.`);
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

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Çalışanlar</Text>
          <Text style={styles.headerSubtitle}>Personel yönetimi ve bilgileri</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Genel Durum</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Aktif Çalışan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.status === 'inactive').length}</Text>
              <Text style={styles.statLabel}>Pasif Çalışan</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'waiter').length}</Text>
              <Text style={styles.statLabel}>Garson</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'chef').length}</Text>
              <Text style={styles.statLabel}>Şef</Text>
            </View>
          </View>
        </View>

        {/* Çalışan Listesi */}
        <View style={styles.employeesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Çalışan Listesi</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEmployee}>
              <Text style={styles.addButtonText}>+ Yeni Çalışan</Text>
            </TouchableOpacity>
          </View>

          {employees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>Çalışan Bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Henüz kayıtlı çalışan bulunmuyor.
              </Text>
            </View>
          ) : (
            employees.map((employee) => (
              <View key={employee.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeRole}>{getRoleText(employee.role)}</Text>
                  </View>
                  <View style={styles.employeeActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(employee.status)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditEmployee(employee)}
                    >
                      <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.employeeDetails}>
                  <Text style={styles.detailItem}>📧 {employee.email}</Text>
                  <Text style={styles.detailItem}>📱 {employee.phone}</Text>
                  <Text style={styles.detailItem}>📅 İşe Başlama: {employee.joinDate}</Text>
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
  employeesSection: {
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
  employeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  employeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  employeeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  detailItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default EmployeesScreen;
