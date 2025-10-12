/**
 * MENU SCREEN - Menü Yönetimi Ekranı (Sadece Admin)
 * 
 * Bu ekran sadece admin rolündeki kullanıcılar için menü yönetimi sağlar.
 * Ürün ekleme, düzenleme, silme, fiyat güncelleme ve kategori yönetimi işlemlerini içerir.
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
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const MenuScreen = () => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [categories, setCategories] = useState([
    { id: 1, name: 'Ana Yemekler', isActive: true },
    { id: 2, name: 'İçecekler', isActive: true },
    { id: 3, name: 'Tatlılar', isActive: true },
    { id: 4, name: 'Atıştırmalıklar', isActive: false },
  ]);

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Adana Kebab',
      description: 'Acılı kıyma kebabı, pilav ve salata ile',
      price: 55.00,
      category: 'Ana Yemekler',
      isAvailable: true,
      preparationTime: 15,
      image: null,
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      description: 'Domates, mozzarella ve fesleğenli pizza',
      price: 45.00,
      category: 'Ana Yemekler',
      isAvailable: true,
      preparationTime: 20,
      image: null,
    },
    {
      id: 3,
      name: 'Cheeseburger',
      description: 'Et köfte, peynir, marul ve domates',
      price: 35.00,
      category: 'Ana Yemekler',
      isAvailable: true,
      preparationTime: 10,
      image: null,
    },
    {
      id: 4,
      name: 'Ayran',
      description: 'Ev yapımı ayran',
      price: 15.00,
      category: 'İçecekler',
      isAvailable: true,
      preparationTime: 2,
      image: null,
    },
    {
      id: 5,
      name: 'Cola',
      description: '330ml kutu kola',
      price: 15.00,
      category: 'İçecekler',
      isAvailable: false,
      preparationTime: 1,
      image: null,
    },
    {
      id: 6,
      name: 'Tiramisu',
      description: 'İtalyan tatlısı',
      price: 25.00,
      category: 'Tatlılar',
      isAvailable: true,
      preparationTime: 5,
      image: null,
    },
  ]);

  // Admin kontrolü
  if (!hasRole('admin')) {
    return (
      <View style={styles.container}>
        <View style={styles.safeArea}>
          <View style={[styles.accessDenied, { paddingTop: 50 }]}>
            <Text style={styles.accessDeniedIcon}>🔒</Text>
            <Text style={styles.accessDeniedTitle}>Erişim Reddedildi</Text>
            <Text style={styles.accessDeniedText}>
              Bu sayfaya erişim için admin yetkisi gereklidir.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel menü verilerini çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'available') return item.isAvailable;
    if (selectedCategory === 'unavailable') return !item.isAvailable;
    return item.category === selectedCategory;
  });

  const handleToggleAvailability = (itemId) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Ürün Silme',
      'Bu ürünü silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const handleEditItem = (item) => {
    // Düzenleme modalını aç
    Alert.alert('Düzenleme', `${item.name} düzenleme özelliği yakında eklenecek.`);
  };

  const handleAddCategory = () => {
    Alert.prompt(
      'Yeni Kategori',
      'Kategori adını girin:',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ekle',
          onPress: (categoryName) => {
            if (categoryName && categoryName.trim()) {
              const newCategory = {
                id: Date.now(),
                name: categoryName.trim(),
                isActive: true,
              };
              setCategories(prev => [...prev, newCategory]);
            }
          },
        },
      ]
    );
  };

  const categoryFilters = [
    { key: 'all', label: 'Tümü' },
    { key: 'available', label: 'Mevcut' },
    { key: 'unavailable', label: 'Mevcut Değil' },
    ...categories.filter(cat => cat.isActive).map(cat => ({
      key: cat.name,
      label: cat.name,
    })),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Menü Yönetimi</Text>
          <Text style={styles.headerSubtitle}>Ürün ve kategori yönetimi</Text>
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
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{menuItems.length}</Text>
              <Text style={styles.statLabel}>Toplam Ürün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{menuItems.filter(item => item.isAvailable).length}</Text>
              <Text style={styles.statLabel}>Mevcut</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{categories.filter(cat => cat.isActive).length}</Text>
              <Text style={styles.statLabel}>Kategori</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                ₺{(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Ort. Fiyat</Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionTitle}>Ürün Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleAddCategory}
            >
              <Text style={styles.actionIcon}>📁</Text>
              <Text style={styles.actionTitle}>Kategori Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Menü Raporu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Menü Ayarları</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtreler */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {categoryFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedCategory === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menü Listesi */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menü Öğeleri</Text>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <View style={styles.menuInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View style={styles.menuActions}>
                  <TouchableOpacity
                    style={[
                      styles.availabilityButton,
                      item.isAvailable ? styles.availableButton : styles.unavailableButton
                    ]}
                    onPress={() => handleToggleAvailability(item.id)}
                  >
                    <Text style={styles.availabilityButtonText}>
                      {item.isAvailable ? 'Mevcut' : 'Mevcut Değil'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.menuDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fiyat:</Text>
                  <Text style={styles.detailValue}>₺{item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hazırlık Süresi:</Text>
                  <Text style={styles.detailValue}>{item.preparationTime} dk</Text>
                </View>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Text style={styles.editButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Ürün Ekleme Modalı */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Ürün Ekle</Text>
            <Text style={styles.modalNote}>
              Ürün ekleme özelliği yakında eklenecek.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
    color: '#dc2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionsSection: {
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
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
    backgroundColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  menuSection: {
    padding: 20,
    paddingBottom: 40,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  menuInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  menuActions: {
    alignItems: 'flex-end',
  },
  availabilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableButton: {
    backgroundColor: '#10b981',
  },
  unavailableButton: {
    backgroundColor: '#f59e0b',
  },
  availabilityButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuDetails: {
    marginBottom: 16,
    paddingTop: 12,
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
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuScreen;
