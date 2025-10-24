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
  StyleSheet,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, getRoleConfig } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Modal from '../components/Modal';
import useModal from '../hooks/useModal';
import useForm from '../hooks/useForm';

const EmployeesScreen = ({ navigation }) => {
  const { user, currentRole, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      roles: ['chef', 'admin'], // Çoklu rol desteği
      status: 'active',
      joinDate: '15-01-2023',
      exitDate: null,
      email: 'ahmet@restaurant.com',
      phone: '0555 123 4567',
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      roles: ['waiter', 'cashier'], // Çoklu rol desteği
      status: 'active',
      joinDate: '20-02-2023',
      exitDate: null,
      email: 'ayse@restaurant.com',
      phone: '0555 234 5678',
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      roles: ['cashier'],
      status: 'inactive',
      joinDate: '10-03-2023',
      exitDate: '15-01-2024',
      email: 'mehmet@restaurant.com',
      phone: '0555 345 6789',
    },
    {
      id: 4,
      name: 'Fatma Özkan',
      roles: ['waiter'],
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
        roles: user.roles || ['admin'], // Çoklu rol desteği
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
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Modal hooks
  const editModal = useModal();
  const addModal = useModal();
  
  // Form hooks
  const employeeForm = useForm({
    name: '',
    roles: ['waiter'], // Çoklu rol desteği
    status: 'active',
    email: '',
    phone: '',
    joinDate: '',
    exitDate: '',
  }, {
    name: { required: true, requiredMessage: 'Ad soyad zorunludur' },
    roles: {
      required: true,
      requiredMessage: 'En az bir rol seçmelisiniz',
      custom: (value) => {
        if (!value || value.length === 0) {
          return 'En az bir rol seçmelisiniz';
        }
        return null;
      }
    },
    email: {
      required: false, // İsteğe bağlı
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Geçerli bir e-posta adresi giriniz'
    },
    phone: {
      required: true,
      requiredMessage: 'Telefon zorunludur',
      pattern: /^[0-9\s\-\(\)]+$/,
      patternMessage: 'Geçerli bir telefon numarası giriniz'
    },
    joinDate: {
      required: true,
      requiredMessage: 'İşe başlama tarihi zorunludur',
      pattern: /^\d{2}-\d{2}-\d{4}$/,
      patternMessage: 'Tarih DD-MM-YYYY formatında olmalıdır (örn: 15-01-2024)'
    },
    exitDate: {
      required: false, // Conditional validation yapacağız
      pattern: /^\d{2}-\d{2}-\d{4}$/,
      patternMessage: 'Tarih DD-MM-YYYY formatında olmalıdır (örn: 31-12-2024)',
      custom: (value, allValues) => {
        // Eğer çalışan pasifse ve exitDate boşsa hata ver
        if (allValues.status === 'inactive' && (!value || value.trim() === '')) {
          return 'Pasif çalışanlar için işten çıkış tarihi zorunludur';
        }
        return null;
      }
    },
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

  const getRolesText = (roles) => {
    return roles.map(role => getRoleText(role)).join(', ');
  };

  const getStatusColor = (status) => {
    return status === 'active' ? Colors.success : Colors.error;
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
    employeeForm.resetForm();
    employeeForm.setValue('joinDate', getTodayFormatted());
    setEditingEmployee(null);
    addModal.openModal();
  };

  const handleEditEmployee = (employee) => {
    // Form değerlerini tek tek set et
    employeeForm.setValue('name', employee.name);
    employeeForm.setValue('roles', employee.roles || [employee.role] || ['waiter']); // Çoklu rol desteği
    employeeForm.setValue('status', employee.status);
    employeeForm.setValue('email', employee.email);
    employeeForm.setValue('phone', employee.phone);
    employeeForm.setValue('joinDate', employee.joinDate);
    employeeForm.setValue('exitDate', employee.exitDate || '');
    setEditingEmployee(employee);
    editModal.openModal();
  };

  const handleDeleteEmployee = (employee) => {
    if (Platform.OS === 'web') {
      // Web'de window.confirm kullan
      if (window.confirm(`${employee.name} adlı çalışanı silmek istediğinizden emin misiniz?`)) {
        setEmployees(prev => prev.filter(emp => emp.id !== employee.id));
        window.alert('Başarılı: Çalışan silindi.');
      }
    } else {
      // Expo'da Alert kullan
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
              Alert.alert('Başarılı', 'Çalışan silindi.');
            }
          }
        ]
      );
    }
  };

  const handleSaveEmployee = () => {
    const formData = employeeForm.values;

    // Form validasyonu (genel validation - custom validation dahil)
    if (!employeeForm.validateForm()) {
      return;
    }

    // Tarih mantığı kontrolü (işe başlama ≤ işten çıkış)
    if (formData.status === 'inactive' && formData.exitDate) {
      const joinDate = new Date(formData.joinDate.split('-').reverse().join('-'));
      const exitDate = new Date(formData.exitDate.split('-').reverse().join('-'));
      
      if (joinDate > exitDate) {
        if (Platform.OS === 'web') {
          // Web'de window.alert kullan
          window.alert('Hata: İşe başlama tarihi, işten çıkış tarihinden sonra olamaz');
        } else {
          // Expo'da Alert kullan
          Alert.alert('Hata', 'İşe başlama tarihi, işten çıkış tarihinden sonra olamaz');
        }
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
      editModal.closeModal();
      
      // Başarılı mesajı
      if (Platform.OS === 'web') {
        window.alert('Başarılı: Çalışan güncellendi.');
      } else {
        Alert.alert('Başarılı', 'Çalışan güncellendi.');
      }
    } else {
      // Yeni ekleme
      const newEmployee = {
        id: Date.now(),
        ...formData,
        exitDate: formData.status === 'inactive' ? formData.exitDate : null,
      };
      setEmployees(prev => [...prev, newEmployee]);
      addModal.closeModal();
      
      // Başarılı mesajı
      if (Platform.OS === 'web') {
        window.alert('Başarılı: Çalışan eklendi.');
      } else {
        Alert.alert('Başarılı', 'Çalışan eklendi.');
      }
    }
    
    setEditingEmployee(null);
    employeeForm.resetForm();
  };

  const handleCancel = () => {
    editModal.closeModal();
    addModal.closeModal();
    setEditingEmployee(null);
    employeeForm.resetForm();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Web için geri düğmesi */}
        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Çalışanlar</Text>
        <Text style={styles.headerSubtitle}>Personel yönetimi ve bilgileri</Text>
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
              <Text style={styles.statNumber}>{employees.filter(e => (e.roles || [e.role] || []).includes('waiter') && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Garson</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => (e.roles || [e.role] || []).includes('chef') && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Şef</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => (e.roles || [e.role] || []).includes('cashier') && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Kasiyer</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{employees.filter(e => (e.roles || [e.role] || []).includes('admin') && e.status === 'active').length}</Text>
              <Text style={styles.statLabel}>Yönetici</Text>
            </View>
          </View>
        </View>

        {/* Arama ve Filtreleme */}
        <Card style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Arama ve Filtreleme</Text>
          
          {/* Arama Kutusu */}
          <Input
            label="Çalışan Ara"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Çalışan adı ara..."
            style={styles.searchInput}
          />

          {/* Filtre Butonları */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {statusFilters.map((filter) => (
              <Button
                key={filter.key}
                title={`${filter.label} (${filter.count})`}
                variant={statusFilter === filter.key ? 'primary' : 'outline'}
                size="small"
                onPress={() => setStatusFilter(filter.key)}
                style={styles.filterButton}
              />
            ))}
          </ScrollView>
        </Card>

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
              <Card key={employee.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <View style={styles.rolesContainer}>
                      {(employee.roles || [employee.role] || []).map((role, index) => {
                        const config = getRoleConfig(role);
                        return (
                          <View key={index} style={[styles.roleBadge, { backgroundColor: config.color }]}>
                            <Text style={styles.roleIcon}>{config.icon}</Text>
                            <Text style={styles.roleText}>{getRoleText(role)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <View style={styles.employeeActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(employee.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(employee.status)}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      {employee.id !== 'current-user' && (
                        <Button
                          title="Düzenle"
                          variant="outline"
                          size="small"
                          onPress={() => handleEditEmployee(employee)}
                          style={styles.editButton}
                        />
                      )}
                      {employee.id !== 'current-user' && (
                        <Button
                          title="Sil"
                          variant="danger"
                          size="small"
                          onPress={() => handleDeleteEmployee(employee)}
                          style={styles.deleteButton}
                        />
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
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Düzenleme Modal */}
      <Modal
        visible={editModal.isVisible}
        onClose={editModal.closeModal}
        title="Çalışan Düzenle"
        size="large"
        showCloseButton={false}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveEmployee}
        secondaryButtonText="İptal"
        onSecondaryPress={handleCancel}
        scrollable={true}
      >
        <EmployeeForm 
          form={employeeForm}
          onSave={handleSaveEmployee}
          onCancel={handleCancel}
          isEdit={true}
          getRoleConfig={getRoleConfig}
        />
      </Modal>

      {/* Yeni Ekleme Modal */}
      <Modal
        visible={addModal.isVisible}
        onClose={addModal.closeModal}
        title="Yeni Çalışan Ekle"
        size="large"
        showCloseButton={false}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveEmployee}
        secondaryButtonText="İptal"
        onSecondaryPress={handleCancel}
        scrollable={true}
      >
        <EmployeeForm 
          form={employeeForm}
          onSave={handleSaveEmployee}
          onCancel={handleCancel}
          isEdit={false}
          getRoleConfig={getRoleConfig}
        />
      </Modal>
    </SafeAreaView>
  );
};

// Çalışan Form Bileşeni
const EmployeeForm = ({ form, onSave, onCancel, isEdit, getRoleConfig }) => {
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
    <ScrollView 
      style={styles.formScrollView}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContainer}>
      <View style={styles.formGroup}>
        <Input
          label="Ad Soyad *"
          value={form.values.name}
          onChangeText={(text) => form.setValue('name', text)}
          placeholder="Çalışan adı ve soyadı"
          error={form.errors.name}
          onBlur={() => form.validateField('name')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Roller *</Text>
        <Text style={styles.formHelpText}>Birden fazla rol seçebilirsiniz</Text>
        <View style={styles.rolesGrid}>
          {roles.map((role) => {
            const isSelected = (form.values.roles || []).includes(role.key);
            const config = getRoleConfig(role.key);
            return (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleSelectCard,
                  isSelected && { backgroundColor: config.color + '20', borderColor: config.color }
                ]}
                onPress={() => {
                  const currentRoles = form.values.roles || [];
                  if (isSelected) {
                    // Rolü kaldır
                    form.setValue('roles', currentRoles.filter(r => r !== role.key));
                  } else {
                    // Rolü ekle
                    form.setValue('roles', [...currentRoles, role.key]);
                  }
                }}
              >
                <Text style={[
                  styles.roleSelectText,
                  isSelected && { color: config.color, fontWeight: 'bold' }
                ]}>
                  {role.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: config.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {form.errors.roles && (
          <Text style={styles.errorText}>{form.errors.roles}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Durum</Text>
        <View style={styles.radioGroup}>
          {statuses.map((status) => (
            <Button
              key={status.key}
              title={status.label}
              variant={form.values.status === status.key ? 'primary' : 'outline'}
              size="small"
              onPress={() => form.setValue('status', status.key)}
              style={styles.radioButton}
            />
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Input
          label="E-posta"
          value={form.values.email}
          onChangeText={(text) => form.setValue('email', text)}
          placeholder="ornek@email.com"
          keyboardType="email-address"
          error={form.errors.email}
          onBlur={() => form.validateField('email')}
        />
      </View>

      <View style={styles.formGroup}>
        <Input
          label="Telefon *"
          value={form.values.phone}
          onChangeText={(text) => form.setValue('phone', text)}
          placeholder="0555 123 4567"
          keyboardType="phone-pad"
          error={form.errors.phone}
          onBlur={() => form.validateField('phone')}
        />
      </View>

      <View style={styles.formGroup}>
        <Input
          label="İşe Başlama Tarihi *"
          value={form.values.joinDate}
          onChangeText={(text) => form.setValue('joinDate', text)}
          placeholder="15-01-2024"
          error={form.errors.joinDate}
          onBlur={() => form.validateField('joinDate')}
        />
        <Text style={styles.formHelpText}>Örn: 15-01-2024</Text>
      </View>

      {form.values.status === 'inactive' && (
        <View style={styles.formGroup}>
          <Input
            label="İşten Çıkış Tarihi *"
            value={form.values.exitDate}
            onChangeText={(text) => form.setValue('exitDate', text)}
            placeholder="31-12-2024"
            error={form.errors.exitDate}
            onBlur={() => form.validateField('exitDate')}
          />
          <Text style={styles.formHelpText}>Örn: 31-12-2024</Text>
        </View>
      )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100%', // Web için height ekle
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
    height: '100%', // Web için height ekle
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
    flexGrow: 1, // Web için flexGrow ekle
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
    color: Colors.secondary,
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  employeesSection: {
    padding: Spacing.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addButton: {
    // Button component handles styling
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
  employeeCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  employeeHeader: {
    flexDirection: 'column',
    marginBottom: Spacing.md,
  },
  employeeInfo: {
    marginBottom: Spacing.md,
  },
  employeeName: {
    ...Typography.styles.h4,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  employeeRole: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    alignSelf: 'flex-start',
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.styles.caption,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  editButton: {
    marginRight: Spacing.sm,
    minWidth: 80,
    height: 36,
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    minWidth: 80,
    height: 36,
  },
  employeeDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingTop: Spacing.md,
  },
  detailItem: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  // Arama ve Filtreleme Stilleri
  searchSection: {
    marginTop: Spacing.sm,
    padding: Spacing.screenPadding,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchInput: {
    marginBottom: Spacing.md,
  },
  filtersContainer: {
    marginTop: Spacing.sm,
  },
  filterButton: {
    marginRight: Spacing.sm,
  },
  // Çalışan Kartı Güncellemeleri
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    maxHeight: '95%',
  },
  modalTitle: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 500,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    ...Typography.styles.button,
    color: Colors.error,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    ...Typography.styles.button,
    color: Colors.white,
  },
  // Form Stilleri
  formScrollView: {
    maxHeight: 900,
  },
  formContainer: {
    padding: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  formHelpText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  radioButton: {
    flex: 1,
    minWidth: 100,
    marginHorizontal: Spacing.xs,
  },
  // Mevcut kullanıcı badge'i
  currentUserBadge: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentUserText: {
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  // Çoklu rol stilleri
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  roleIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  roleText: {
    ...Typography.styles.caption,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Rol seçim kartları
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  roleSelectCard: {
    width: '48%',
    backgroundColor: Colors.gray50,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
    minHeight: 50,
  },
  roleSelectText: {
    ...Typography.styles.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    ...Typography.styles.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  // Web için geri düğmesi stilleri
  backButton: {
    backgroundColor: Colors.gray200,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    ...Typography.styles.body,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default EmployeesScreen;
