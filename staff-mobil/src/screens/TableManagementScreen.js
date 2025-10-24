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
  Platform,
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// Platform-specific imports - expo-print removed due to web compatibility issues

const TableManagementScreen = ({ navigation }) => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [tables, setTables] = useState([
    // MASA 1: BOŞ - Yeni müşteri alabilir
    { 
      id: 1, 
      table_number: '1', 
      capacity: 4, 
      status: 'empty', 
      qr_code: 'https://customer-web.com/masa/REST001/1', 
      is_occupied: false, 
      current_session_id: null, 
      current_session: null,
    },
    
    // MASA 2: DOLU - Müşteri yemek yiyor (25 dakikadır)
    { 
      id: 2, 
      table_number: '2', 
      capacity: 2, 
      status: 'occupied', 
      qr_code: 'https://customer-web.com/masa/REST001/2', 
      is_occupied: true, 
      current_session_id: 1, 
      current_session: { 
        id: 1, 
        started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), 
        guest_count: 2, 
        is_active: true 
      },
    },
    
    // MASA 3: DOLU - Ödeme bekliyor (alt durum)
    { 
      id: 3, 
      table_number: '3', 
      capacity: 6, 
      status: 'occupied', 
      payment_status: 'payment_waiting', // Alt durum
      qr_code: 'https://customer-web.com/masa/REST001/3', 
      is_occupied: true, 
      current_session_id: 2, 
      current_session: { 
        id: 2, 
        started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), 
        guest_count: 4, 
        is_active: true 
      },
    },
    
    // MASA 4: DOLU - Ödeme alındı (alt durum)
    { 
      id: 4, 
      table_number: '4', 
      capacity: 4, 
      status: 'occupied', 
      payment_status: 'payment_completed', // Alt durum
      qr_code: 'https://customer-web.com/masa/REST001/4', 
      is_occupied: true, 
      current_session_id: 3, 
      current_session: { 
        id: 3, 
        started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), 
        guest_count: 3, 
        is_active: true 
      },
    },
    
    // MASA 5: TEMİZLİK - Müşteri kalktı, garson temizlik yapıyor
    { 
      id: 5, 
      table_number: '5', 
      capacity: 2, 
      status: 'cleaning', 
      qr_code: 'https://customer-web.com/masa/REST001/5', 
      is_occupied: false, 
      current_session_id: null, 
      current_session: null,
    },
    
    // MASA 6: BOŞ - Temizlik bitti, yeni müşteri alabilir
    { 
      id: 6, 
      table_number: '6', 
      capacity: 8, 
      status: 'empty', 
      qr_code: 'https://customer-web.com/masa/REST001/6', 
      is_occupied: false, 
      current_session_id: null, 
      current_session: null,
    },
    
    // MASA 7: DOLU - Uzun süreli müşteri (2 saat)
    { 
      id: 7, 
      table_number: '7', 
      capacity: 4, 
      status: 'occupied', 
      qr_code: 'https://customer-web.com/masa/REST001/7', 
      is_occupied: true, 
      current_session_id: 4, 
      current_session: { 
        id: 4, 
        started_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), 
        guest_count: 4, 
        is_active: true 
      },
    },
    
    // MASA 8: DOLU - Ödeme bekliyor (uzun süre - 30 dakika)
    { 
      id: 8, 
      table_number: '8', 
      capacity: 6, 
      status: 'occupied', 
      payment_status: 'payment_waiting', // Alt durum
      qr_code: 'https://customer-web.com/masa/REST001/8', 
      is_occupied: true, 
      current_session_id: 5, 
      current_session: { 
        id: 5, 
        started_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), 
        guest_count: 6, 
        is_active: true 
      },
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showQRDownloadModal, setShowQRDownloadModal] = useState(false);
  const [qrDownloadTable, setQrDownloadTable] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState(null);
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

  // Mock API fonksiyonları
  const fetchTables = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // tables state'i zaten başlangıçta dolu, sadece refresh yapıyoruz
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
      empty: '#9CA3AF',          // Yumuşak gri - Boş
      occupied: '#EF4444',      // Yumuşak kırmızı - Dolu
      cleaning: '#10B981',      // Yumuşak yeşil - Temizleniyor
    };
    return colors[status] || '#E5E7EB';
  };

  const getStatusText = (status) => {
    const texts = {
      empty: 'Boş',
      occupied: 'Dolu',
      cleaning: 'Temizleniyor',
    };
    return texts[status] || 'Bilinmiyor';
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
    if (Platform.OS === 'web') {
      // Web'de modal göster
      setDeleteTableId(tableId);
      setShowDeleteModal(true);
    } else {
      // Mobil'de Alert kullan
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
    }
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
    if (Platform.OS === 'web') {
      window.alert('Başarılı: Masa bilgileri güncellendi.');
    } else {
      Alert.alert('Başarılı', 'Masa bilgileri güncellendi.');
    }
  };

  // Masa düzenleme modalını kapatma
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTable(null);
  };

  const handleStatusChange = (tableId, newStatus) => {
    updateTableStatus(tableId, newStatus);
  };

  // QR Kod PDF İndirme
  const handleDownloadQR = (table) => {
    if (Platform.OS === 'web') {
      // Web'de modal göster
      setQrDownloadTable(table);
      setShowQRDownloadModal(true);
    } else {
      // Mobil'de Alert kullan
      Alert.alert(
        'QR Kod İndir',
        `Masa ${table.table_number} için QR kod PDF'ini indirmek istediğinizden emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          { 
            text: 'İndir', 
            onPress: () => {
              downloadQRPDF(table);
            }
          }
        ]
      );
    }
  };

  // QR Kod PDF İndirme Fonksiyonu
  const downloadQRPDF = (table) => {
    // Web'de PDF indirme
    if (Platform.OS === 'web') {
      const qrCodeUrl = table.qr_code || `https://customer-web.com/masa/REST001/${table.table_number}`;
      
      // HTML içeriği oluştur (QR kod ile)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Masa ${table.table_number} QR Kod</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              background: white;
            }
            .qr-container {
              border: 2px solid #333;
              padding: 20px;
              margin: 20px auto;
              max-width: 400px;
              background: white;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #333;
            }
            .qr-code {
              margin: 20px 0;
              display: flex;
              justify-content: center;
            }
            .qr-url {
              font-size: 12px;
              color: #666;
              word-break: break-all;
              margin: 20px 0;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .qr-instruction {
              font-size: 16px;
              color: #333;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">Masa ${table.table_number}</div>
            <div class="qr-code">
              <canvas id="qrcode"></canvas>
            </div>
            <div class="qr-url">${qrCodeUrl}</div>
            <div class="qr-instruction">
              Müşteri bu QR kodu okutarak menüye erişebilir
            </div>
          </div>
          
          <script>
            // QR kod oluştur
            QRCode.toCanvas(document.getElementById('qrcode'), '${qrCodeUrl}', {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            }, function (error) {
              if (error) console.error(error);
            });
          </script>
        </body>
        </html>
      `;
      
      // Blob oluştur ve indir
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Masa_${table.table_number}_QR_Kod.html`;
      link.click();
      URL.revokeObjectURL(url);
      
      Alert.alert('Başarılı', 'QR kod dosyası indirildi.');
    } else {
      // Mobil'de QR kod indirme
      downloadQRForMobile(table);
    }
  };

  // Mobil'de QR kod indirme fonksiyonu
  const downloadQRForMobile = async (table) => {
    try {
      const qrCodeUrl = table.qr_code || `https://customer-web.com/masa/REST001/${table.table_number}`;
      
      // QR kod için HTML içeriği oluştur (PDF için)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Kod - Masa ${table.table_number}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 40px; 
              background: white;
              margin: 0;
            }
            .container { 
              background: white; 
              padding: 40px; 
              border: 2px solid #333;
              max-width: 400px;
              margin: 0 auto;
            }
            h1 { 
              color: #333; 
              margin-bottom: 30px; 
              font-size: 24px;
            }
            .info { 
              background: #f8f9fa; 
              padding: 20px; 
              border: 1px solid #ddd;
              margin-top: 30px;
            }
            .info p { 
              margin: 8px 0; 
              color: #666; 
              font-size: 14px;
            }
            .qr-text { 
              font-family: monospace; 
              background: #000; 
              color: #fff; 
              padding: 15px; 
              border-radius: 5px; 
              word-break: break-all;
              margin: 30px 0;
              font-size: 12px;
            }
            .qr-code {
              margin: 20px 0;
              padding: 20px;
              border: 1px solid #ddd;
              background: #f9f9f9;
            }
            .qr-code-text {
              font-family: monospace;
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Masa ${table.table_number} QR Kodu</h1>
            
            <div class="qr-code">
              <div style="font-size: 18px; margin-bottom: 10px;">QR Kod:</div>
              <div class="qr-text">${qrCodeUrl}</div>
            </div>
            
            <div class="info">
              <p><strong>Masa Numarası:</strong> ${table.table_number}</p>
              <p><strong>İşletme Kodu:</strong> REST001</p>
              <p><strong>Kapasite:</strong> ${table.capacity} kişi</p>
              <p><strong>QR Kod URL:</strong></p>
              <div class="qr-code-text">${qrCodeUrl}</div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Platform kontrolü
      if (Platform.OS === 'web') {
        // Web'de HTML dosyası oluştur
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Masa_${table.table_number}_QR_Kod.html`;
        link.click();
        URL.revokeObjectURL(url);
        
        window.alert('Başarılı: QR kod dosyası indirildi.');
      } else {
        // Mobil'de HTML dosyası oluştur ve paylaş
        const fileName = `Masa_${table.table_number}_QR_Kod.html`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // HTML dosyasını yaz
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        // Dosyayı paylaş
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: `Masa ${table.table_number} QR Kodu`,
          });
        } else {
          Alert.alert('Hata', 'Dosya paylaşımı desteklenmiyor.');
        }
      }
      
    } catch (error) {
      console.error('QR kod indirme hatası:', error);
      if (Platform.OS === 'web') {
        window.alert('Hata: QR kod indirilemedi.');
      } else {
        Alert.alert('Hata', 'QR kod indirilemedi.');
      }
    }
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
        {/* Web için geri düğmesi */}
        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
        )}
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
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{getStatusText(status)}</Text>
                      </View>
                    </View>
                  </View>



                  {status === 'occupied' && (
                    <View style={styles.occupancyInfo}>
                      <Text style={styles.occupancyText}>
                        {currentGuests} kişi • {sessionDuration}
                      </Text>
                    </View>
                  )}

                  {table.payment_status === 'payment_waiting' && (
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentText}>
                        ⏳ Müşteri kasiyeri çağırdı
                      </Text>
                    </View>
                  )}

                  {table.payment_status === 'payment_completed' && (
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentText}>
                        💰 Ödeme alındı
                      </Text>
                    </View>
                  )}

                  <View style={styles.tableActions}>
                    <Button
                      title="QR Kod Görüntüle"
                      variant="primary"
                      size="small"
                      onPress={() => handleDownloadQR(table)}
                      style={[styles.actionButton, styles.softBlueButton]}
                      textStyle={styles.softBlueButtonText}
                    />
                    <Button
                      title="Düzenle"
                      variant="outline"
                      size="small"
                      onPress={() => handleEditTable(table)}
                      style={[styles.actionButton, styles.softBlueButton]}
                      textStyle={styles.softBlueButtonText}
                    />
                    <Button
                      title="Sil"
                      variant="danger"
                      size="small"
                      onPress={() => handleRemoveTable(table.id)}
                      style={[styles.actionButton, styles.softBlueButton]}
                      textStyle={styles.softBlueButtonText}
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

      {/* QR Kod İndirme Onay Modalı */}
      <Modal
        visible={showQRDownloadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRDownloadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {Platform.OS === 'web' ? 'QR Kod İndir' : 'QR Kod Görüntüle'}
            </Text>
            
            {Platform.OS === 'web' ? (
              <>
                <Text style={styles.modalMessage}>
                  Masa {qrDownloadTable?.table_number} için QR kod PDF'ini indirmek istediğinizden emin misiniz?
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowQRDownloadModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      downloadQRPDF(qrDownloadTable);
                      setShowQRDownloadModal(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>İndir</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalMessage}>
                  Masa {qrDownloadTable?.table_number} QR Kodu
                </Text>
                
                {/* Mobil'de QR kod görüntüleme */}
                <View style={styles.qrDisplayContainer}>
                  <QRBarcode
                    qrCode={qrDownloadTable?.qr_code || `https://customer-web.com/masa/REST001/${qrDownloadTable?.table_number}`}
                    tableNumber={qrDownloadTable?.table_number || '0'}
                    businessCode="REST001"
                    size={200}
                    showInfo={true}
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowQRDownloadModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Kapat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      downloadQRForMobile(qrDownloadTable);
                      setShowQRDownloadModal(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>İndir</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Masa Silme Onay Modalı */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Masa Sil</Text>
            <Text style={styles.modalMessage}>
              Bu masayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.dangerButton]}
                onPress={() => {
                  deleteTable(deleteTableId);
                  setShowDeleteModal(false);
                }}
              >
                <Text style={styles.dangerButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      if (Platform.OS === 'web') {
        window.alert('Hata: Lütfen masa numarası giriniz.');
      } else {
        Alert.alert('Hata', 'Lütfen masa numarası giriniz.');
      }
      return;
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 20) {
      if (Platform.OS === 'web') {
        window.alert('Hata: Kapasite 1-20 arasında olmalıdır.');
      } else {
        Alert.alert('Hata', 'Kapasite 1-20 arasında olmalıdır.');
      }
      return;
    }

    // Web'de onay mesajı göster
    if (Platform.OS === 'web') {
      if (window.confirm('Masa bilgilerini güncellemek istediğinizden emin misiniz?')) {
        onSave({
          ...table,
          table_number: formData.tableNumber.trim(),
          capacity: parseInt(formData.capacity),
          qr_code: formData.qrCode,
        });
      }
    } else {
      onSave({
        ...table,
        table_number: formData.tableNumber.trim(),
        capacity: parseInt(formData.capacity),
        qr_code: formData.qrCode,
      });
    }
  };

  const handleGenerateNewQR = () => {
    const newQRCode = generateQRCode(businessCode, formData.tableNumber.trim());
    setFormData(prev => ({ ...prev, qrCode: newQRCode }));
    if (Platform.OS === 'web') {
      window.alert('Başarılı: Yeni QR kod oluşturuldu.');
    } else {
      Alert.alert('Başarılı', 'Yeni QR kod oluşturuldu.');
    }
  };

  const handleResetQR = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Mevcut QR kod sıfırlanacak ve yeni bir tane oluşturulacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
        handleGenerateNewQR();
      }
    } else {
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
    }
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
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    if (text === '' || isNaN(num)) {
                      setFormData(prev => ({ ...prev, capacity: '' }));
                    } else {
                      setFormData(prev => ({ ...prev, capacity: num }));
                    }
                  }}
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
                  key={formData.qrCode} // QR kodu değiştiğinde component yeniden render edilir
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
    marginBottom: 16,
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tableInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  tableCapacity: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tableStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
  },
  occupancyInfo: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  occupancyText: {
    fontSize: 11,
    color: '#D97706',
    textAlign: 'center',
    fontWeight: '500',
  },
  tableActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    marginBottom: Spacing.sm,
  },
  softBlueButton: {
    backgroundColor: '#ddbac6', // Soft blue
    borderColor: '#ddbac6',
  },
  softBlueButtonText: {
    color: '#FFFFFF', // Beyaz yazı
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
    marginTop: 4,
    padding: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 12,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
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
  // QR Download Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.styles.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Platform.select({
      web: {
        minWidth: 120,
        maxWidth: 150,
      },
    }),
  },
  cancelButton: {
    backgroundColor: Colors.gray200,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.error,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    ...Typography.styles.body,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: 16,
  },
  confirmButtonText: {
    ...Typography.styles.body,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    fontSize: 16,
  },
  dangerButtonText: {
    ...Typography.styles.body,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
    fontSize: 16,
  },
  // QR Display Container
  qrDisplayContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
  },
});

export default TableManagementScreen;
