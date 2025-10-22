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
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';
import QRBarcode from '../components/QRBarcode';
import { generateQRCode, confirmQRCodeGeneration } from '../services/qrCodeService';

const TableManagementScreen = ({ navigation }) => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [tables, setTables] = useState([
    { id: 1, table_number: '1', capacity: 4, status: 'empty', qr_code: 'https://restoran.com/masa/REST001/1', is_occupied: false, current_session_id: null, current_session: null },
    { id: 2, table_number: '2', capacity: 2, status: 'occupied', qr_code: 'https://restoran.com/masa/REST001/2', is_occupied: true, current_session_id: 1, current_session: { id: 1, started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), guest_count: 2, is_active: true } },
    { id: 3, table_number: '3', capacity: 6, status: 'payment_waiting', qr_code: 'https://restoran.com/masa/REST001/3', is_occupied: true, current_session_id: 2, current_session: { id: 2, started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), guest_count: 4, is_active: true } },
    { id: 4, table_number: '4', capacity: 4, status: 'payment_completed', qr_code: 'https://restoran.com/masa/REST001/4', is_occupied: false, current_session_id: null, current_session: null },
    { id: 5, table_number: '5', capacity: 2, status: 'cleaning', qr_code: 'https://restoran.com/masa/REST001/5', is_occupied: false, current_session_id: null, current_session: null },
    { id: 6, table_number: '6', capacity: 8, status: 'empty', qr_code: 'https://restoran.com/masa/REST001/6', is_occupied: false, current_session_id: null, current_session: null },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 4,
  });

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

  // Mock veriler (3 durum: boş, dolu, temizleniyor)
  const mockTables = [
    {
      id: 1,
      table_number: '1',
      capacity: 4,
      status: 'occupied',
      is_occupied: true,
      current_session_id: 1,
      qr_code: 'QR001',
      current_session: {
        id: 1,
        started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 dakika önce
        guest_count: 2,
        is_active: true,
      },
    },
    {
      id: 2,
      table_number: '2',
      capacity: 2,
      status: 'empty',
      is_occupied: false,
      current_session_id: null,
      qr_code: 'QR002',
      current_session: null,
    },
    {
      id: 3,
      table_number: '3',
      capacity: 6,
      status: 'occupied', // Ödeme alındı ama masa hala dolu (garson temizleyecek)
      is_occupied: true,
      current_session_id: null, // Session sonlandırıldı
      qr_code: 'QR003',
      current_session: null,
      needs_cleaning: true, // Temizlik gerekli işareti
    },
    {
      id: 4,
      table_number: '4',
      capacity: 4,
      status: 'occupied',
      is_occupied: true,
      current_session_id: 2,
      qr_code: 'QR004',
      current_session: {
        id: 2,
        started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 dakika önce
        guest_count: 4,
        is_active: true,
      },
    },
    {
      id: 5,
      table_number: '5',
      capacity: 2,
      status: 'cleaning', // Garson temizliyor
      is_occupied: true,
      current_session_id: null,
      qr_code: 'QR005',
      current_session: null,
    },
    {
      id: 6,
      table_number: '6',
      capacity: 8,
      status: 'empty',
      is_occupied: false,
      current_session_id: null,
      qr_code: 'QR006',
      current_session: null,
    },
  ];

  // Mock API fonksiyonları
  const fetchTables = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setTables(mockTables);
    } catch (error) {
      console.error('Masalar yüklenirken hata:', error);
      Alert.alert('Hata', 'Masalar yüklenirken bir hata oluştu.');
    }
  };

  const addTable = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTableData = {
        id: Date.now(), // Mock ID
        table_number: newTable.table_number,
        capacity: newTable.capacity,
        is_occupied: false,
        current_session_id: null,
        qr_code: `QR${Date.now()}`,
        current_session: null,
      };
      
      setTables(prev => [...prev, newTableData]);
      setShowAddModal(false);
      setNewTable({ table_number: '', capacity: 4 });
      Alert.alert('Başarılı', 'Masa başarıyla eklendi.');
    } catch (error) {
      console.error('Masa ekleme hatası:', error);
      Alert.alert('Hata', 'Masa eklenirken bir hata oluştu.');
    }
  };

  const deleteTable = async (tableId) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTables(prev => prev.filter(table => table.id !== tableId));
      Alert.alert('Başarılı', 'Masa başarıyla silindi.');
    } catch (error) {
      console.error('Masa silme hatası:', error);
      Alert.alert('Hata', 'Masa silinirken bir hata oluştu.');
    }
  };

  const updateTableStatus = async (tableId, status) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTables(prev => prev.map(table => {
        if (table.id === tableId) {
          switch (status) {
            case 'empty':
              return {
                ...table,
                status: 'empty',
                is_occupied: false,
                current_session_id: null,
                current_session: null,
              };
            case 'occupied':
              return {
                ...table,
                status: 'occupied',
                is_occupied: true,
                current_session_id: Date.now(),
                current_session: {
                  id: Date.now(),
                  started_at: new Date().toISOString(),
                  guest_count: Math.floor(Math.random() * table.capacity) + 1,
                  is_active: true,
                },
              };
            case 'cleaning':
              return {
                ...table,
                status: 'cleaning',
                is_occupied: true,
                current_session_id: null,
                current_session: null,
              };
            default:
              return table;
          }
        }
        return table;
      }));
    } catch (error) {
      console.error('Masa durumu güncelleme hatası:', error);
      Alert.alert('Hata', 'Masa durumu güncellenirken bir hata oluştu.');
    }
  };

  // Masa durumu hesaplama (3 durum: boş, dolu, temizleniyor)
  const getTableStatus = (table) => {
    // Eğer status alanı varsa onu kullan
    if (table.status) {
      return table.status;
    }
    
    // Eski yöntemle hesapla
    if (table.is_occupied && table.current_session_id) {
      return 'occupied';
    } else if (table.is_occupied && !table.current_session_id) {
      return 'cleaning';
    } else {
      return 'empty';
    }
  };

  // Oturum süresi hesaplama
  const getSessionDuration = (startedAt) => {
    if (!startedAt) return null;
    const now = new Date();
    const start = new Date(startedAt);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} dk`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}s ${mins}dk`;
    }
  };

  // Kişi sayısı hesaplama (aktif oturumdan)
  const getCurrentGuests = (session) => {
    // Bu bilgi table_sessions tablosundan gelecek
    // Şimdilik mock data
    return session?.guest_count || 0;
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTables().finally(() => {
      setRefreshing(false);
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      empty: Colors.gray500,      // Gri - Boş
      occupied: Colors.info,      // Mavi - Dolu
      payment_waiting: Colors.warning,   // Sarı - Ödeme Bekliyor
      payment_completed: Colors.warning, // Sarı - Ödeme Alındı
      cleaning: Colors.success,   // Yeşil - Temizleniyor
    };
    return colors[status] || Colors.gray200;
  };

  const getStatusText = (status) => {
    const texts = {
      empty: 'Boş',
      occupied: 'Dolu',
      payment_waiting: 'Ödeme Bekliyor',
      payment_completed: 'Ödeme Alındı',
      cleaning: 'Temizlik',
    };
    return texts[status] || 'Bilinmiyor';
  };

  const getStatusIcon = (status) => {
    const icons = {
      empty: '🪑',
      occupied: '🍽️',
      payment_waiting: '⏳',
      payment_completed: '💰',
      cleaning: '🧹',
    };
    return icons[status] || '❓';
  };


  const handleAddTable = async () => {
    if (!newTable.tableNumber.trim()) {
      Alert.alert('Hata', 'Lütfen masa numarası giriniz.');
      return;
    }

    const tableExists = tables.some(table => table.table_number === newTable.tableNumber.trim());
    if (tableExists) {
      Alert.alert('Hata', 'Bu masa numarası zaten mevcut.');
      return;
    }

    // Business code'u al (şimdilik mock, sonra API'den gelecek)
    const businessCode = 'REST001';
    
    // QR kod oluştur
    const qrCode = generateQRCode(businessCode, newTable.tableNumber.trim());

    const newTableData = {
      id: Math.max(...tables.map(t => t.id)) + 1,
      table_number: newTable.tableNumber.trim(),
      capacity: newTable.capacity,
      status: 'empty',
      is_occupied: false,
      current_session_id: null,
      qr_code: qrCode,
      current_session: null,
    };

    setTables(prevTables => [...prevTables, newTableData]);
    setNewTable({ tableNumber: '', capacity: 4 });
    setShowAddModal(false);
    
    // QR kod onayı göster
    await confirmQRCodeGeneration(newTable.tableNumber.trim(), businessCode);
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
          onPress: () => deleteTable(tableId)
        }
      ]
    );
  };


  // Masa düzenleme fonksiyonu
  const handleEditTable = (table) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  // Masa kaydetme fonksiyonu
  const handleSaveTable = (updatedTable) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === updatedTable.id ? updatedTable : table
      )
    );
    setShowEditModal(false);
    setSelectedTable(null);
    Alert.alert('Başarılı', 'Masa bilgileri güncellendi.');
  };

  // Masa düzenleme modalını kapatma
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTable(null);
  };

  const handleStatusChange = (tableId, newStatus) => {
    updateTableStatus(tableId, newStatus);
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

  const emptyTables = tables.filter(t => getTableStatus(t) === 'empty').length;
  const occupiedTables = tables.filter(t => getTableStatus(t) === 'occupied').length;
  const cleaningTables = tables.filter(t => getTableStatus(t) === 'cleaning').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Masa Yönetimi</Text>
        <Text style={styles.headerSubtitle}>Masa durumları ve yerleşim yönetimi</Text>
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
              <Text style={styles.statNumber}>{cleaningTables}</Text>
              <Text style={styles.statLabel}>Temizleniyor</Text>
              <Text style={styles.statIcon}>🟠</Text>
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
            tables.map((table) => {
              const status = table.status;
              const sessionDuration = table.current_session ? getSessionDuration(table.current_session.started_at) : null;
              const currentGuests = table.current_session ? getCurrentGuests(table.current_session) : 0;
              
              return (
                <Card key={table.id} style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <View style={styles.tableInfo}>
                      <Text style={styles.tableNumber}>Masa {table.table_number}</Text>
                      <Text style={styles.tableCapacity}>{table.capacity} kişilik</Text>
                    </View>
                    <View style={styles.tableStatus}>
                      <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{getStatusText(status)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* QR Barkod */}
                  <View style={styles.qrSection}>
                    <QRBarcode
                      qrCode={table.qr_code || 'https://restoran.com/masa/default'}
                      tableNumber={table.table_number || '0'}
                      businessCode="REST001"
                      size={120}
                      showInfo={false}
                    />
                  </View>


                  {status === 'occupied' && (
                    <View style={styles.occupancyInfo}>
                      <Text style={styles.occupancyText}>
                        {currentGuests} kişi • {sessionDuration}
                      </Text>
                      {table.needs_cleaning && (
                        <Text style={styles.cleaningRequiredText}>
                          🧹 Temizlik Gerekli
                        </Text>
                      )}
                    </View>
                  )}

                  {status === 'payment_waiting' && (
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentText}>
                        ⏳ Müşteri kasiyeri çağırdı
                      </Text>
                    </View>
                  )}

                  {status === 'payment_completed' && (
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentText}>
                        💰 Ödeme alındı - Temizlik bekliyor
                      </Text>
                    </View>
                  )}

                  <View style={styles.tableActions}>
                    <Button
                      title="Düzenle"
                      variant="outline"
                      size="small"
                      onPress={() => handleEditTable(table)}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Sil"
                      variant="danger"
                      size="small"
                      onPress={() => handleRemoveTable(table.id)}
                      style={styles.actionButton}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </Card>
      </ScrollView>

      {/* Yeni Masa Ekleme Modalı */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Masa Ekle</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Masa Numarası</Text>
              <TextInput
                style={styles.textInput}
                value={newTable.tableNumber}
                onChangeText={(text) => setNewTable({...newTable, tableNumber: text})}
                placeholder="Örn: 1, A1, VIP-1"
                keyboardType="default"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kapasite</Text>
              <TextInput
                style={styles.textInput}
                value={newTable.capacity.toString()}
                onChangeText={(text) => setNewTable({...newTable, capacity: parseInt(text) || 4})}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTable}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Masa Düzenleme Modalı */}
      <TableEditModal
        visible={showEditModal}
        table={selectedTable}
        onClose={handleCloseEditModal}
        onSave={handleSaveTable}
        businessCode="REST001"
      />
    </SafeAreaView>
  );
};

// TableEditModal Component - Masa Düzenleme Modalı
const TableEditModal = ({
  visible,
  table,
  onClose,
  onSave,
  businessCode = 'REST001'
}) => {
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    qrCode: '',
  });

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.table_number || '',
        capacity: table.capacity || 4,
        qrCode: table.qr_code || '',
      });
    }
  }, [table]);

  const handleSave = () => {
    if (!formData.tableNumber.trim()) {
      Alert.alert('Hata', 'Lütfen masa numarası giriniz.');
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 20) {
      Alert.alert('Hata', 'Kapasite 1-20 arasında olmalıdır.');
      return;
    }

    onSave({
      ...table,
      table_number: formData.tableNumber.trim(),
      capacity: parseInt(formData.capacity),
      qr_code: formData.qrCode,
    });
  };

  const handleGenerateNewQR = () => {
    const newQRCode = generateQRCode(businessCode, formData.tableNumber.trim());
    setFormData(prev => ({ ...prev, qrCode: newQRCode }));
    Alert.alert('Başarılı', 'Yeni QR kod oluşturuldu.');
  };

  const handleResetQR = () => {
    Alert.alert(
      'QR Kod Sıfırla',
      'Mevcut QR kod sıfırlanacak ve yeni bir tane oluşturulacak. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: handleGenerateNewQR
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={editModalStyles.overlay}>
        <View style={editModalStyles.container}>
          <ScrollView contentContainerStyle={editModalStyles.scrollContent}>
            <Text style={editModalStyles.title}>Masa Düzenle</Text>
            
            {/* Masa Bilgileri */}
            <View style={editModalStyles.section}>
              <Text style={editModalStyles.sectionTitle}>Masa Bilgileri</Text>
              
              <View style={editModalStyles.inputGroup}>
                <Text style={editModalStyles.label}>Masa Numarası</Text>
                <TextInput
                  style={editModalStyles.input}
                  value={formData.tableNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, tableNumber: text }))}
                  placeholder="Masa numarasını giriniz"
                />
              </View>

              <View style={editModalStyles.inputGroup}>
                <Text style={editModalStyles.label}>Kapasite</Text>
                <TextInput
                  style={editModalStyles.input}
                  value={formData.capacity.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, capacity: parseInt(text) || 4 }))}
                  placeholder="Kişi sayısı"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* QR Kod Bölümü */}
            <View style={editModalStyles.section}>
              <View style={editModalStyles.sectionHeader}>
                <Text style={editModalStyles.sectionTitle}>QR Barkod</Text>
                <TouchableOpacity
                  style={editModalStyles.resetButton}
                  onPress={handleResetQR}
                >
                  <Text style={editModalStyles.resetButtonText}>Yenile</Text>
                </TouchableOpacity>
              </View>

              <View style={editModalStyles.qrContainer}>
                <QRBarcode
                  qrCode={formData.qrCode || 'https://restoran.com/masa/default'}
                  tableNumber={formData.tableNumber || '0'}
                  businessCode={businessCode}
                  size={150}
                  showInfo={true}
                />
              </View>

              <View style={editModalStyles.inputGroup}>
                <Text style={editModalStyles.label}>QR Kod URL</Text>
                <TextInput
                  style={[editModalStyles.input, editModalStyles.qrInput]}
                  value={formData.qrCode}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, qrCode: text }))}
                  placeholder="QR kod URL'i"
                  multiline
                />
              </View>
            </View>
          </ScrollView>

          {/* Butonlar */}
          <View style={editModalStyles.buttons}>
            <Button
              title="İptal"
              onPress={onClose}
              style={[editModalStyles.button, editModalStyles.cancelButton]}
              textStyle={editModalStyles.cancelButtonText}
            />
            <Button
              title="Kaydet"
              onPress={handleSave}
              style={[editModalStyles.button, editModalStyles.saveButton]}
            />
          </View>
        </View>
      </View>
    </Modal>
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
  cleaningRequiredText: {
    ...Typography.styles.bodySmall,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
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
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.styles.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.styles.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    ...Typography.styles.body,
    color: Colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  cancelButton: {
    backgroundColor: Colors.gray500,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.white,
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.md,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  saveButtonText: {
    color: Colors.white,
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  // Masa durumu butonları
  statusButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  paymentInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.warning + '20',
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
});

// TableEditModal Styles
const editModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resetButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.gray50,
  },
  qrInput: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  qrText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: Colors.gray200,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
});

export default TableManagementScreen;
