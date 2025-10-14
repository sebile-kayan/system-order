/**
 * EMPLOYEES SCREEN - Çalışanlar Ekranı
 * 
 * Çalışan yönetimi: listeleme, ekleme, düzenleme, silme ve filtreleme.
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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const EmployeesScreen = ({ navigation }) => {
  const { user, currentRole, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      role: 'chef',
      status: 'active',
      joinDate: '15-01-2023',
      exitDate: null,
      email: 'ahmet@restaurant.com',
      phone: '0555 123 4567',
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      role: 'waiter',
      status: 'active',
      joinDate: '20-02-2023',
      exitDate: null,
      email: 'ayse@restaurant.com',
      phone: '0555 234 5678',
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      role: 'cashier',
      status: 'inactive',
      joinDate: '10-03-2023',
      exitDate: '15-01-2024',
      email: 'mehmet@restaurant.com',
      phone: '0555 345 6789',
    },
    {
      id: 4,
      name: 'Fatma Özkan',
      role: 'waiter',
      status: 'inactive',
      joinDate: '05-04-2023',
      exitDate: '01-02-2024',
      email: 'fatma@restaurant.com',
      phone: '0555 456 7890',
    },
  ]);

  // Mevcut kullanıcıyı admin olarak ekle (eğer admin ise)
  useEffect(() => {
    // Sadece user ve currentRole varsa çalış
    if (!user || !currentRole || !user.id) {
      return;
    }
    
    if (user.roles && user.roles.includes('admin')) {
      const currentUserAdmin = {
        id: 'current-user',
        name: user.full_name || 'Mevcut Kullanıcı',
        role: 'admin',
        status: 'active',
        joinDate: getTodayFormatted(),
        exitDate: null,
        email: user.email || 'admin@restaurant.com',
        phone: user.phone || '0555 000 0000',
      };
      
      setEmployees(prev => {
        const exists = prev.some(emp => emp.id === 'current-user');
        return exists 
          ? prev.map(emp => emp.id === 'current-user' ? currentUserAdmin : emp)
          : [currentUserAdmin, ...prev];
      });
    }
  }, [user, currentRole]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'waiter',
    status: 'active',
    email: '',
    phone: '',
    joinDate: '',
    exitDate: '',
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
    return status === 'active' ? 'Aktif' : 'Pasif (İşten Ayrılma)';
  };

  // Tarih formatı dönüştürme (DD-MM-YYYY → YYYY-MM-DD)
  const convertToDatabaseFormat = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateString;
  };

  const getTodayFormatted = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleAddEmployee = () => {
    setFormData({
      name: '',
      role: 'waiter',
      status: 'active',
      email: '',
      phone: '',
      joinDate: getTodayFormatted(),
      exitDate: '',
    });
    setEditingEmployee(null);
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      name: employee.name,
      role: employee.role,
      status: employee.status,
      email: employee.email,
      phone: employee.phone,
      joinDate: employee.joinDate,
      exitDate: employee.exitDate || '',
    });
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employee) => {
    Alert.alert(
      'Çalışanı Sil',
      `${employee.name} adlı çalışanı silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
          }
        }
      ]
    );
  };

  const handleSaveEmployee = () => {
    // Zorunlu alan kontrolleri
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Çalışan adı gereklidir');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Hata', 'Telefon numarası gereklidir');
      return;
    }

    if (!formData.joinDate.trim()) {
      Alert.alert('Hata', 'İşe başlama tarihi gereklidir');
      return;
    }

    // Pasif durumda çıkış tarihi zorunlu
    if (formData.status === 'inactive' && !formData.exitDate.trim()) {
      Alert.alert('Hata', 'Pasif çalışanlar için işten çıkış tarihi gereklidir');
      return;
    }

    // Tarih formatı kontrolü (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(formData.joinDate)) {
      Alert.alert('Hata', 'İşe başlama tarihi DD-MM-YYYY formatında olmalıdır (örn: 15-01-2024)');
      return;
    }

    if (formData.status === 'inactive' && formData.exitDate && !dateRegex.test(formData.exitDate)) {
      Alert.alert('Hata', 'İşten çıkış tarihi DD-MM-YYYY formatında olmalıdır (örn: 31-12-2024)');
      return;
    }

    // Tarih mantığı kontrolü (işe başlama ≤ işten çıkış)
    if (formData.status === 'inactive' && formData.exitDate) {
      const joinDate = new Date(formData.joinDate.split('-').reverse().join('-'));
      const exitDate = new Date(formData.exitDate.split('-').reverse().join('-'));
      
      if (joinDate > exitDate) {
        Alert.alert('Hata', 'İşe başlama tarihi, işten çıkış tarihinden sonra olamaz');
        return;
      }
    }

    if (editingEmployee) {
      // Düzenleme
      const updatedEmployee = {
        ...editingEmployee,
        ...formData,
        exitDate: formData.status === 'inactive' ? formData.exitDate : null,
      };
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === editingEmployee.id ? updatedEmployee : emp
        )
      );
      setShowEditModal(false);
    } else {
      // Yeni ekleme
      const newEmployee = {
        id: Date.now(),
        ...formData,
        exitDate: formData.status === 'inactive' ? formData.exitDate : null,
      };
      setEmployees(prev => [...prev, newEmployee]);
      setShowAddModal(false);
    }
    
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'waiter',
      status: 'active',
      email: '',
      phone: '',
      joinDate: '',
      exitDate: '',
    });
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'waiter',
      status: 'active',
      email: '',
      phone: '',
      joinDate: getTodayFormatted(),
      exitDate: '',
    });
  };

  // Filtreleme ve arama
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const statusFilters = [
    { key: 'all', label: 'Tümü', count: employees.length },
    { key: 'active', label: 'Aktif', count: employees.filter(emp => emp.status === 'active').length },
    { key: 'inactive', label: 'Pasif', count: employees.filter(emp => emp.status === 'inactive').length },
  ];

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
        contentContainerStyle={styles.scrollContent}
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
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'waiter' && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Garson</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'chef' && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Şef</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'cashier' && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Kasiyer</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => e.role === 'admin' && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Yönetici</Text>
            </View>
          </View>
        </View>

        {/* Arama ve Filtreleme */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Arama ve Filtreleme</Text>
          
          {/* Arama Kutusu */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Çalışan adı ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Filtre Butonları */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  statusFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setStatusFilter(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  statusFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Çalışan Listesi */}
        <View style={styles.employeesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Çalışan Listesi ({filteredEmployees.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEmployee}>
              <Text style={styles.addButtonText}>+ Yeni Çalışan</Text>
            </TouchableOpacity>
          </View>

          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>Çalışan Bulunamadı</Text>
              <Text style={styles.emptyStateText}>
                Henüz kayıtlı çalışan bulunmuyor.
              </Text>
            </View>
          ) : (
            filteredEmployees.map((employee) => (
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
                    <View style={styles.actionButtons}>
                      {employee.id !== 'current-user' && (
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditEmployee(employee)}
                    >
                      <Text style={styles.editButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                      )}
                      {employee.id !== 'current-user' && (
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteEmployee(employee)}
                        >
                          <Text style={styles.deleteButtonText}>Sil</Text>
                        </TouchableOpacity>
                      )}
                      {employee.id === 'current-user' && (
                        <View style={styles.currentUserBadge}>
                          <Text style={styles.currentUserText}>Mevcut Kullanıcı</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.employeeDetails}>
                  <Text style={styles.detailItem}>📧 {employee.email}</Text>
                  <Text style={styles.detailItem}>📱 {employee.phone}</Text>
                  <Text style={styles.detailItem}>📅 İşe Başlama: {employee.joinDate}</Text>
                  {employee.exitDate && (
                    <Text style={styles.detailItem}>🚪 İşten Çıkış: {employee.exitDate}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Çalışan Düzenle</Text>
              <EmployeeForm 
                formData={formData}
                setFormData={setFormData}
                isEdit={true}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmployee}>
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Yeni Ekleme Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Yeni Çalışan Ekle</Text>
              <EmployeeForm 
                formData={formData}
                setFormData={setFormData}
                isEdit={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmployee}>
                  <Text style={styles.saveButtonText}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// Çalışan Form Bileşeni
const EmployeeForm = ({ formData, setFormData, isEdit }) => {
  const roles = [
    { key: 'admin', label: 'Yönetici' },
    { key: 'chef', label: 'Şef' },
    { key: 'waiter', label: 'Garson' },
    { key: 'cashier', label: 'Kasiyer' },
  ];

  const statuses = [
    { key: 'active', label: 'Aktif' },
    { key: 'inactive', label: 'Pasif (İşten Ayrılma)' },
  ];

  //YENİ ÇALIŞAN EKLEME FORMU ARAYÜZÜ
  return (
    <ScrollView style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Ad Soyad *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Çalışan adı ve soyadı"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Rol</Text>
        <View style={styles.radioGroup}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.radioButton,
                formData.role === role.key && styles.radioButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, role: role.key }))}
            >
              <Text style={[
                styles.radioButtonText,
                formData.role === role.key && styles.radioButtonTextActive
              ]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Durum</Text>
        <View style={styles.radioGroup}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.radioButton,
                formData.status === status.key && styles.radioButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, status: status.key }))}
            >
              <Text style={[
                styles.radioButtonText,
                formData.status === status.key && styles.radioButtonTextActive
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>E-posta</Text>
        <TextInput
          style={styles.formInput}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="ornek@email.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Telefon *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          placeholder="0555 123 4567"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>İşe Başlama Tarihi *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.joinDate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, joinDate: text }))}
          placeholder="15-01-2024"
        />
        <Text style={styles.formHelpText}>Örn: 15-01-2024</Text>
      </View>

      {formData.status === 'inactive' && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>İşten Çıkış Tarihi *</Text>
          <TextInput
            style={styles.formInput}
            value={formData.exitDate}
            onChangeText={(text) => setFormData(prev => ({ ...prev, exitDate: text }))}
            placeholder="31-12-2024"
          />
          <Text style={styles.formHelpText}>Örn: 31-12-2024</Text>
        </View>
      )}
    </ScrollView>
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
  // Arama ve Filtreleme Stilleri
  searchSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  filtersContainer: {
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  // Çalışan Kartı Güncellemeleri
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Form Stilleri
  formContainer: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  formHelpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radioButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  radioButtonTextActive: {
    color: '#ffffff',
  },
  // Mevcut kullanıcı badge'i
  currentUserBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  currentUserText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
});

export default EmployeesScreen;
