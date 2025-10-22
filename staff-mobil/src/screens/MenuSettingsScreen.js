/**
 * MENU SETTINGS SCREEN - Menü Ayarları Ekranı (Sadece Admin)
 * 
 * Bu ekran menü yönetimi için gerekli ayarları içerir:
 * - Kategori Yönetimi (sıralama, aktif/pasif, birleştirme/bölme)
 * - Fiyat Yönetimi (toplu güncelleme, geçmiş, onay sistemi)
 * - Hazırlık Süresi Ayarları (kategori bazlı varsayılan süreler)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useCategory } from '../context/CategoryContext';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/Input';
import { Colors } from '../constants/Colors';

// Sadece web'de kullanılan ConfirmationModal expo için çağırılmadı.
let ConfirmationModal = null;
if (Platform.OS === 'web') {
  ConfirmationModal = require('../components/ConfirmationModal').default;
}

const MenuSettingsScreen = () => {
  const { user, hasRole } = useAuth();
  const { 
    categories, 
    products,
    addCategory, 
    deleteCategory, 
    toggleCategoryStatus, 
    reorderCategories,
    mergeCategories,
    splitCategory,
    bulkUpdatePrices
  } = useCategory();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('categories');
  const [refreshing, setRefreshing] = useState(false);

  // Fiyat Yönetimi - Toplu zam ve indirim
  const [bulkIncreasePercent, setBulkIncreasePercent] = useState(5);
  const [bulkDecreasePercent, setBulkDecreasePercent] = useState(5);


  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showBulkIncreaseModal, setShowBulkIncreaseModal] = useState(false);
  const [showBulkDecreaseModal, setShowBulkDecreaseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesToDelete, setCategoriesToDelete] = useState([]);
  const [categoryToSplit, setCategoryToSplit] = useState(null);
  const [splitCategories, setSplitCategories] = useState(['', '']);
  const [mergedCategoryName, setMergedCategoryName] = useState('');
  const [productAssignments, setProductAssignments] = useState({});
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Onayla',
    cancelText: 'İptal',
    type: 'default',
    onConfirm: null,
    onCancel: null,
    isLoading: false,
  });
  
  // Kategori ekleme state'leri
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [categoryErrors, setCategoryErrors] = useState({});

  // Confirmation modal helper functions - Sadece Web'de
  const showConfirmation = (config) => {
    if (Platform.OS !== 'web') return;
    
    // Web'de onay modalı açılırken diğer modalları kapat
    setShowCategoryModal(false);
    setShowMergeModal(false);
    setShowSplitModal(false);
    setShowBulkIncreaseModal(false);
    setShowBulkDecreaseModal(false);
    setShowDeleteModal(false);
    
    setConfirmationModal({
      visible: true,
      title: config.title || 'Onay',
      message: config.message || '',
      confirmText: config.confirmText || 'Onayla',
      cancelText: config.cancelText || 'İptal',
      type: config.type || 'default',
      onConfirm: config.onConfirm || (() => {}),
      onCancel: config.onCancel || (() => setConfirmationModal(prev => ({ ...prev, visible: false }))),
      isLoading: false,
    });
  };

  const hideConfirmation = () => {
    if (Platform.OS !== 'web') return;
    
    setConfirmationModal(prev => ({ ...prev, visible: false }));
    // Web'de onay modalı kapandığında diğer modalları da temizle
    setShowCategoryModal(false);
    setShowMergeModal(false);
    setShowSplitModal(false);
    setShowBulkIncreaseModal(false);
    setShowBulkDecreaseModal(false);
    setShowDeleteModal(false);
  };

  const handleConfirmationConfirm = async () => {
    if (Platform.OS !== 'web') return;
    
    if (confirmationModal.onConfirm) {
      setConfirmationModal(prev => ({ ...prev, isLoading: true }));
      try {
        await confirmationModal.onConfirm();
        hideConfirmation();
      } catch (error) {
        console.error('Confirmation error:', error);
        setConfirmationModal(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const handleConfirmationCancel = () => {
    if (Platform.OS !== 'web') return;
    
    if (confirmationModal.onCancel) {
      confirmationModal.onCancel();
    }
    hideConfirmation();
  };

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
    // API'den güncel ayarları çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Kategori Yönetimi Fonksiyonları
  const handleToggleCategoryStatus = (categoryId) => {
    toggleCategoryStatus(categoryId);
  };

  const handleReorderCategories = (fromIndex, toIndex) => {
    reorderCategories(fromIndex, toIndex);
  };

  const handleMergeCategories = () => {
    if (selectedCategories.length < 2) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'En az 2 kategori seçmelisiniz.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'En az 2 kategori seçmelisiniz.');
      }
      return;
    }
    
    if (!mergedCategoryName.trim()) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'Birleşik kategori adı zorunludur.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'Birleşik kategori adı zorunludur.');
      }
      return;
    }
    
    if (Platform.OS === 'web') {
      showConfirmation({
        title: 'Kategori Birleştirme',
        message: `Seçilen ${selectedCategories.length} kategoriyi "${mergedCategoryName}" olarak birleştirmek istediğinizden emin misiniz?`,
        confirmText: 'Birleştir',
        cancelText: 'İptal',
        type: 'default',
        onConfirm: () => {
          mergeCategories(selectedCategories, mergedCategoryName);
          showConfirmation({
            title: 'Başarılı',
            message: 'Kategoriler başarıyla birleştirildi.',
            confirmText: 'Tamam',
            type: 'default',
            onConfirm: () => {
              setShowMergeModal(false);
              setSelectedCategories([]);
              setMergedCategoryName('');
              hideConfirmation();
            },
          });
        },
      });
    } else {
      Alert.alert(
        'Kategori Birleştirme',
        `Seçilen ${selectedCategories.length} kategoriyi "${mergedCategoryName}" olarak birleştirmek istediğinizden emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Birleştir',
            onPress: () => {
              mergeCategories(selectedCategories, mergedCategoryName);
              Alert.alert('Başarılı', 'Kategoriler başarıyla birleştirildi.');
              setShowMergeModal(false);
              setSelectedCategories([]);
              setMergedCategoryName('');
            },
          },
        ]
      );
    }
  };

  const handleSplitCategory = () => {
    if (!categoryToSplit) return;
    
    const validCategories = splitCategories.filter(name => name.trim());
    if (validCategories.length < 2) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'En az 2 kategori adı girmelisiniz.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'En az 2 kategori adı girmelisiniz.');
      }
      return;
    }
    
    // Kategori bölme modalını aç
    setShowSplitModal(true);
  };

  // Ürün atama işleminin tamamlanıp tamamlanmadığını kontrol et
  const isProductAssignmentComplete = () => {
    if (!categoryToSplit) return true;
    
    const productsInCategory = products.filter(product => product.category_id === categoryToSplit.id);
    
    // Eğer kategoride ürün yoksa tamamlanmış sayılır
    if (productsInCategory.length === 0) return true;
    
    // Tüm ürünler için atama yapılmış mı kontrol et
    return productsInCategory.every(product => productAssignments[product.id]);
  };

  const confirmSplitCategory = () => {
    if (!categoryToSplit) return;
    
    const validCategories = splitCategories.filter(name => name.trim());
    if (validCategories.length < 2) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'En az 2 kategori adı girmelisiniz.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'En az 2 kategori adı girmelisiniz.');
      }
      return;
    }
    
    // Bölünen kategorideki ürünleri kontrol et
    const productsInCategory = products.filter(product => product.category_id === categoryToSplit.id);
    
    if (productsInCategory.length === 0) {
      // Eğer kategoride ürün yoksa direkt böl
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Kategori Bölme',
          message: `"${categoryToSplit.name}" kategorisini ${validCategories.length} kategoriye bölmek istediğinizden emin misiniz?`,
          confirmText: 'Böl',
          cancelText: 'İptal',
          type: 'default',
          onConfirm: () => {
            splitCategory(categoryToSplit.id, validCategories, []);
            showConfirmation({
              title: 'Başarılı',
              message: 'Kategori başarıyla bölündü.',
              confirmText: 'Tamam',
              type: 'default',
              onConfirm: () => {
                setShowSplitModal(false);
                setCategoryToSplit(null);
                setSplitCategories(['', '']);
                setProductAssignments({});
                hideConfirmation();
              },
            });
          },
        });
      } else {
        Alert.alert(
          'Kategori Bölme',
          `"${categoryToSplit.name}" kategorisini ${validCategories.length} kategoriye bölmek istediğinizden emin misiniz?`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Böl',
              onPress: () => {
                splitCategory(categoryToSplit.id, validCategories, []);
                Alert.alert('Başarılı', 'Kategori başarıyla bölündü.');
                setShowSplitModal(false);
                setCategoryToSplit(null);
                setSplitCategories(['', '']);
                setProductAssignments({});
              },
            },
          ]
        );
      }
      return;
    }
    
    // Ürün atama kontrolü
    const unassignedProducts = productsInCategory.filter(product => !productAssignments[product.id]);
    const deletedProducts = productsInCategory.filter(product => productAssignments[product.id] === 'DELETE');
    const assignedProducts = productsInCategory.filter(product => 
      productAssignments[product.id] && productAssignments[product.id] !== 'DELETE'
    );
    
    if (unassignedProducts.length > 0) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Eksik Ürün Ataması',
          message: `Bölünen kategorideki ${unassignedProducts.length} ürün için yeni kategori seçmelisiniz veya ürünü silmelisiniz.\n\nAtanmamış ürünler:\n${unassignedProducts.map(p => `• ${p.name}`).join('\n')}`,
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert(
          'Eksik Ürün Ataması',
          `Bölünen kategorideki ${unassignedProducts.length} ürün için yeni kategori seçmelisiniz veya ürünü silmelisiniz.\n\nAtanmamış ürünler:\n${unassignedProducts.map(p => `• ${p.name}`).join('\n')}`
        );
      }
      return;
    }
    
    // Product assignments'ı hazırla
    const assignments = Object.entries(productAssignments)
      .filter(([productId, categoryName]) => categoryName !== 'DELETE')
      .map(([productId, categoryName]) => ({
        productId: parseInt(productId),
        categoryName: categoryName
      }));
    
    const deletedProductIds = Object.entries(productAssignments)
      .filter(([productId, categoryName]) => categoryName === 'DELETE')
      .map(([productId]) => parseInt(productId));
    
    if (Platform.OS === 'web') {
      showConfirmation({
        title: 'Kategori Bölme Onayı',
        message: `"${categoryToSplit.name}" kategorisini ${validCategories.length} kategoriye bölmek istediğinizden emin misiniz?\n\n• ${assignedProducts.length} ürün yeni kategorilere atanacak\n• ${deletedProducts.length} ürün silinecek`,
        confirmText: 'Böl',
        cancelText: 'İptal',
        type: 'default',
        onConfirm: () => {
          splitCategory(categoryToSplit.id, validCategories, assignments, deletedProductIds);
          showConfirmation({
            title: 'Başarılı',
            message: 'Kategori başarıyla bölündü.',
            confirmText: 'Tamam',
            type: 'default',
            onConfirm: () => {
              setShowSplitModal(false);
              setCategoryToSplit(null);
              setSplitCategories(['', '']);
              setProductAssignments({});
              hideConfirmation();
            },
          });
        },
      });
    } else {
      Alert.alert(
        'Kategori Bölme Onayı',
        `"${categoryToSplit.name}" kategorisini ${validCategories.length} kategoriye bölmek istediğinizden emin misiniz?\n\n• ${assignedProducts.length} ürün yeni kategorilere atanacak\n• ${deletedProducts.length} ürün silinecek`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Böl',
            onPress: () => {
              splitCategory(categoryToSplit.id, validCategories, assignments, deletedProductIds);
              Alert.alert('Başarılı', 'Kategori başarıyla bölündü.');
              setShowSplitModal(false);
              setCategoryToSplit(null);
              setSplitCategories(['', '']);
              setProductAssignments({});
            },
          },
        ]
      );
    }
  };

  // Kategori Silme Fonksiyonları
  const handleDeleteCategory = () => {
    setCategoriesToDelete([]);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = () => {
    if (categoriesToDelete.length === 0) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'En az bir kategori seçmelisiniz.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'En az bir kategori seçmelisiniz.');
      }
      return;
    }
    
    const categoryNames = categoriesToDelete.map(id => 
      categories.find(cat => cat.id === id)?.name
    ).join(', ');
    
    if (Platform.OS === 'web') {
      showConfirmation({
        title: 'Kategori Silme Onayı',
        message: `Seçilen ${categoriesToDelete.length} kategoriyi silmek istediğinizden emin misiniz?\n\nSilinecek kategoriler: ${categoryNames}`,
        confirmText: 'Sil',
        cancelText: 'İptal',
        type: 'danger',
        onConfirm: () => {
          // Kategorileri sil
          categoriesToDelete.forEach(categoryId => {
            deleteCategory(categoryId);
          });
          
          showConfirmation({
            title: 'Başarılı',
            message: `${categoriesToDelete.length} kategori başarıyla silindi.`,
            confirmText: 'Tamam',
            type: 'default',
            onConfirm: () => {
              setShowDeleteModal(false);
              setCategoriesToDelete([]);
              hideConfirmation();
            },
          });
        },
      });
    } else {
      Alert.alert(
        'Kategori Silme Onayı',
        `Seçilen ${categoriesToDelete.length} kategoriyi silmek istediğinizden emin misiniz?\n\nSilinecek kategoriler: ${categoryNames}`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            onPress: () => {
              // Kategorileri sil
              categoriesToDelete.forEach(categoryId => {
                deleteCategory(categoryId);
              });
              
              Alert.alert('Başarılı', `${categoriesToDelete.length} kategori başarıyla silindi.`);
              setShowDeleteModal(false);
              setCategoriesToDelete([]);
            },
          },
        ]
      );
    }
  };

  // Kategori Ekleme Fonksiyonları
  const handleSaveCategory = () => {
    // Hataları temizle
    setCategoryErrors({});
    
    // Kategori adı zorunlu kontrolü
    if (!newCategory.name.trim()) {
      setCategoryErrors({ name: 'Kategori adı zorunludur' });
      return;
    }

    addCategory(newCategory);
    setShowCategoryModal(false);
    setNewCategory({ name: '', description: '', is_active: true });
    setCategoryErrors({});
    
    if (Platform.OS === 'web') {
      showConfirmation({
        title: 'Başarılı',
        message: 'Kategori başarıyla eklendi.',
        confirmText: 'Tamam',
        type: 'default',
        onConfirm: () => hideConfirmation(),
      });
    } else {
      Alert.alert('Başarılı', 'Kategori başarıyla eklendi.');
    }
  };

  // Fiyat Yönetimi Fonksiyonları

  const handleBulkIncrease = () => {
    if (bulkIncreasePercent <= 0) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'Zam oranı 0\'dan büyük olmalıdır.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'Zam oranı 0\'dan büyük olmalıdır.');
      }
      return;
    }

    // Direkt güncelleme yap
    bulkUpdatePrices(bulkIncreasePercent);
    
    if (Platform.OS === 'web') {
      // Web'de önce modal'ı kapat, sonra başarılı mesajını göster
      setShowBulkIncreaseModal(false);
      showConfirmation({
        title: 'Başarılı',
        message: `Tüm ürünlerin fiyatı %${bulkIncreasePercent} artırıldı.\n\nGüncellenen ürün sayısı: ${products.length}`,
        confirmText: 'Tamam',
        type: 'default',
        onConfirm: () => hideConfirmation(),
      });
    } else {
      Alert.alert(
        'Başarılı', 
        `Tüm ürünlerin fiyatı %${bulkIncreasePercent} artırıldı.\n\nGüncellenen ürün sayısı: ${products.length}`,
        [
          {
            text: 'Tamam',
            onPress: () => setShowBulkIncreaseModal(false)
          }
        ]
      );
    }
  };

  const handleBulkDecrease = () => {
    if (bulkDecreasePercent <= 0) {
      if (Platform.OS === 'web') {
        showConfirmation({
          title: 'Hata',
          message: 'İndirim oranı 0\'dan büyük olmalıdır.',
          confirmText: 'Tamam',
          type: 'warning',
          onConfirm: () => hideConfirmation(),
        });
      } else {
        Alert.alert('Hata', 'İndirim oranı 0\'dan büyük olmalıdır.');
      }
      return;
    }

    // Negatif oran ile güncelleme yap (indirim)
    bulkUpdatePrices(-bulkDecreasePercent);
    
    if (Platform.OS === 'web') {
      // Web'de önce modal'ı kapat, sonra başarılı mesajını göster
      setShowBulkDecreaseModal(false);
      showConfirmation({
        title: 'Başarılı',
        message: `Tüm ürünlerin fiyatı %${bulkDecreasePercent} azaltıldı.\n\nGüncellenen ürün sayısı: ${products.length}`,
        confirmText: 'Tamam',
        type: 'default',
        onConfirm: () => hideConfirmation(),
      });
    } else {
      Alert.alert(
        'Başarılı', 
        `Tüm ürünlerin fiyatı %${bulkDecreasePercent} azaltıldı.\n\nGüncellenen ürün sayısı: ${products.length}`,
        [
          {
            text: 'Tamam',
            onPress: () => setShowBulkDecreaseModal(false)
          }
        ]
      );
    }
  };


  const renderCategoriesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori Yönetimi</Text>
      </View>

      {/* Kategori Sıralaması */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subsectionTitle}>Kategori Sıralaması</Text>
        </View>
        {categories.map((category, index) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryOrder}>#{category.display_order}</Text>
            </View>
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  category.is_active ? styles.activeButton : styles.inactiveButton
                ]}
                onPress={() => handleToggleCategoryStatus(category.id)}
              >
                <Text style={styles.statusButtonText}>
                  {category.is_active ? 'Aktif' : 'Pasif'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Kategori İşlemleri */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subsectionTitle}>Kategori İşlemleri</Text>
        </View>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Kategori Ekle</Text>
            <Text style={styles.actionButtonSubtext}>Yeni kategori oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={styles.actionButtonText}>Kategori Sil</Text>
            <Text style={styles.actionButtonSubtext}>Kategoriyi kalıcı sil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.warningActionButton]}
            onPress={() => setShowMergeModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🔗</Text>
            <Text style={styles.actionButtonText}>Kategorileri Birleştir</Text>
            <Text style={styles.actionButtonSubtext}>Birden fazla kategoriyi birleştir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.infoActionButton]}
            onPress={() => setShowSplitModal(true)}
          >
            <Text style={styles.actionButtonIcon}>✂️</Text>
            <Text style={styles.actionButtonText}>Kategori Böl</Text>
            <Text style={styles.actionButtonSubtext}>Kategoriyi parçalara böl</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPricingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fiyat Yönetimi</Text>
      </View>

      {/* Toplu Fiyat Zammı */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Toplu Fiyat Zammı</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Zam Oranı (%):</Text>
          <TextInput
            style={styles.numberInput}
            value={bulkIncreasePercent.toString()}
            onChangeText={(text) => setBulkIncreasePercent(parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setShowBulkIncreaseModal(true)}
        >
          <Text style={styles.primaryButtonText}>Toplu Fiyat Zammı</Text>
        </TouchableOpacity>
      </View>

      {/* Toplu Fiyat İndirimi */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Toplu Fiyat İndirimi</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>İndirim Oranı (%):</Text>
          <TextInput
            style={styles.numberInput}
            value={bulkDecreasePercent.toString()}
            onChangeText={(text) => setBulkDecreasePercent(parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity 
          style={[styles.primaryButton, styles.discountButton]}
          onPress={() => setShowBulkDecreaseModal(true)}
        >
          <Text style={styles.primaryButtonText}>Toplu Fiyat İndirimi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menü Ayarları</Text>
          <Text style={styles.headerSubtitle}>Menü yönetimi ayarları</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => setActiveTab('categories')}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              Kategoriler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pricing' && styles.activeTab]}
            onPress={() => setActiveTab('pricing')}
          >
            <Text style={[styles.tabText, activeTab === 'pricing' && styles.activeTabText]}>
              Fiyatlar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'pricing' && renderPricingTab()}
      </ScrollView>

      {/* Kategori Birleştirme Modalı */}
      {showMergeModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMergeModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategorileri Birleştir</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowMergeModal(false);
                  setSelectedCategories([]);
                  setMergedCategoryName('');
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormContainer}>
                <Text style={styles.modalDescription}>
                  Birleştirmek istediğiniz kategorileri seçin:
                </Text>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelectItem,
                      selectedCategories.includes(category.id) && styles.categorySelectItemSelected
                    ]}
                    onPress={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories(prev => [...prev, category.id]);
                      }
                    }}
                  >
                    <View style={styles.categorySelectInfo}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={[
                        styles.categorySelectText,
                        selectedCategories.includes(category.id) && styles.categorySelectTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Birleşik Kategori Adı *</Text>
                  <TextInput
                    value={mergedCategoryName}
                    onChangeText={setMergedCategoryName}
                    placeholder="Birleşik kategori adını girin"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMergeModal(false);
                  setSelectedCategories([]);
                  setMergedCategoryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, (selectedCategories.length < 2 || !mergedCategoryName.trim()) && styles.disabledButton]}
                onPress={handleMergeCategories}
                disabled={selectedCategories.length < 2 || !mergedCategoryName.trim()}
              >
                <Text style={styles.primaryButtonText}>Birleştir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}

      {/* Toplu Fiyat Zammı Modalı */}
      {showBulkIncreaseModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBulkIncreaseModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Toplu Fiyat Zammı</Text>
            </View>
            
            <View style={styles.modalFormContainer}>
              <Text style={styles.modalDescription}>
                Tüm ürünlerin fiyatını %{bulkIncreasePercent} artıracaksınız.
              </Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📊 Güncellenecek ürün sayısı: {products.length}
                </Text>
                <Text style={styles.infoSubtext}>
                  Örnek: 50₺ → {Math.round((50 * (1 + bulkIncreasePercent / 100)) * 100) / 100}₺
                </Text>
              </View>
              
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Bu işlem geri alınamaz! Tüm ürünlerin fiyatı artacak.
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBulkIncreaseModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBulkIncrease}
              >
                <Text style={styles.primaryButtonText}>Zam Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}

      {/* Toplu Fiyat İndirimi Modalı */}
      {showBulkDecreaseModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBulkDecreaseModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Toplu Fiyat İndirimi</Text>
            </View>
            
            <View style={styles.modalFormContainer}>
              <Text style={styles.modalDescription}>
                Tüm ürünlerin fiyatını %{bulkDecreasePercent} azaltacaksınız.
              </Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📊 Güncellenecek ürün sayısı: {products.length}
                </Text>
                <Text style={styles.infoSubtext}>
                  Örnek: 50₺ → {Math.round((50 * (1 - bulkDecreasePercent / 100)) * 100) / 100}₺
                </Text>
              </View>
              
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Bu işlem geri alınamaz! Tüm ürünlerin fiyatı azalacak.
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBulkDecreaseModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.discountButton]}
                onPress={handleBulkDecrease}
              >
                <Text style={styles.primaryButtonText}>İndirim Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}


        {/* Kategori Silme Modalı */}
        {showDeleteModal && (
          <Modal
            visible={true}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowDeleteModal(false)}
          >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Sil</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormContainer}>
                <Text style={styles.modalDescription}>
                  Silmek istediğiniz kategorileri seçin (çoklu seçim):
                </Text>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelectItem,
                      categoriesToDelete.includes(category.id) && styles.categorySelectItemSelected
                    ]}
                    onPress={() => {
                      if (categoriesToDelete.includes(category.id)) {
                        setCategoriesToDelete(prev => prev.filter(id => id !== category.id));
                      } else {
                        setCategoriesToDelete(prev => [...prev, category.id]);
                      }
                    }}
                  >
                    <View style={styles.categorySelectInfo}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={[
                        styles.categorySelectText,
                        categoriesToDelete.includes(category.id) && styles.categorySelectTextSelected
                      ]}>
                        {category.name}
                      </Text>
                      {categoriesToDelete.includes(category.id) && (
                        <Text style={styles.selectedIndicator}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                
                {categoriesToDelete.length > 0 && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      ⚠️ {categoriesToDelete.length} kategori ve içindeki tüm ürünler silinecek!
                    </Text>
                    <Text style={styles.warningSubtext}>
                      Seçilen kategoriler: {categoriesToDelete.map(id => 
                        categories.find(cat => cat.id === id)?.name
                      ).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setCategoriesToDelete([]);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dangerButton, categoriesToDelete.length === 0 && styles.disabledButton]}
                onPress={confirmDeleteCategory}
                disabled={categoriesToDelete.length === 0}
              >
                <Text style={styles.dangerButtonText}>
                  {categoriesToDelete.length > 0 ? `Sil (${categoriesToDelete.length})` : 'Sil'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}

      {/* Kategori Bölme Modalı */}
      {showSplitModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSplitModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Böl</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSplitModal(false);
                  setCategoryToSplit(null);
                  setSplitCategories(['', '']);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormContainer}>
                <Text style={styles.modalDescription}>
                  Bölmek istediğiniz kategoriyi seçin:
                </Text>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelectItem,
                      categoryToSplit?.id === category.id && styles.categorySelectItemSelected
                    ]}
                    onPress={() => setCategoryToSplit(category)}
                  >
                    <View style={styles.categorySelectInfo}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={[
                        styles.categorySelectText,
                        categoryToSplit?.id === category.id && styles.categorySelectTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {categoryToSplit && (
                  <>
                    <Text style={styles.inputLabel}>Yeni Kategori Adları:</Text>
                    {splitCategories.map((name, index) => (
                      <View key={index} style={styles.splitInputGroup}>
                        <Text style={styles.splitInputLabel}>Kategori {index + 1}:</Text>
                        <TextInput
                          value={name}
                          onChangeText={(text) => {
                            const newSplitCategories = [...splitCategories];
                            newSplitCategories[index] = text;
                            setSplitCategories(newSplitCategories);
                          }}
                          placeholder={`Kategori ${index + 1} adı`}
                          style={styles.textInput}
                        />
                      </View>
                    ))}
                    
                    <TouchableOpacity
                      style={styles.addSplitButton}
                      onPress={() => setSplitCategories([...splitCategories, ''])}
                    >
                      <Text style={styles.addSplitButtonText}>+ Kategori Ekle</Text>
                    </TouchableOpacity>
                    
                    {splitCategories.length > 2 && (
                      <TouchableOpacity
                        style={styles.removeSplitButton}
                        onPress={() => {
                          const newSplitCategories = splitCategories.slice(0, -1);
                          setSplitCategories(newSplitCategories);
                        }}
                      >
                        <Text style={styles.removeSplitButtonText}>- Kategori Çıkar</Text>
                      </TouchableOpacity>
                    )}

                    {/* Ürün Atama Bölümü */}
                    {splitCategories.some(name => name.trim()) && (
                      <>
                        <View style={styles.separator} />
                        <Text style={styles.inputLabel}>Ürünleri Yeni Kategorilere Ata:</Text>
                        <Text style={styles.modalDescription}>
                          Her ürünü hangi yeni kategoriye atamak istediğinizi seçin veya ürünü silin:
                        </Text>
                        
                        {products
                          .filter(product => product.category_id === categoryToSplit.id)
                          .map((product) => (
                            <View key={product.id} style={styles.productAssignmentItem}>
                              <Text style={styles.productName}>{product.name}</Text>
                              <View style={styles.categorySelectionRow}>
                                {splitCategories
                                  .filter(name => name.trim())
                                  .map((categoryName, index) => (
                                    <TouchableOpacity
                                      key={index}
                                      style={[
                                        styles.categorySelectionButton,
                                        productAssignments[product.id] === categoryName && 
                                        styles.categorySelectionButtonSelected
                                      ]}
                                      onPress={() => {
                                        setProductAssignments(prev => ({
                                          ...prev,
                                          [product.id]: categoryName
                                        }));
                                      }}
                                    >
                                      <Text style={[
                                        styles.categorySelectionButtonText,
                                        productAssignments[product.id] === categoryName && 
                                        styles.categorySelectionButtonTextSelected
                                      ]}>
                                        {categoryName}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                
                                {/* Ürün Silme Butonu */}
                                <TouchableOpacity
                                  style={[
                                    styles.categorySelectionButton,
                                    styles.deleteProductButton,
                                    productAssignments[product.id] === 'DELETE' && 
                                    styles.deleteProductButtonSelected
                                  ]}
                                  onPress={() => {
                                    setProductAssignments(prev => ({
                                      ...prev,
                                      [product.id]: 'DELETE'
                                    }));
                                  }}
                                >
                                  <Text style={[
                                    styles.categorySelectionButtonText,
                                    styles.deleteProductButtonText,
                                    productAssignments[product.id] === 'DELETE' && 
                                    styles.deleteProductButtonTextSelected
                                  ]}>
                                    🗑️ Sil
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                      </>
                    )}
                  </>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowSplitModal(false);
                  setCategoryToSplit(null);
                  setSplitCategories(['', '']);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton, 
                  (!categoryToSplit || !isProductAssignmentComplete()) && styles.disabledButton
                ]}
                onPress={confirmSplitCategory}
                disabled={!categoryToSplit || !isProductAssignmentComplete()}
              >
                <Text style={styles.primaryButtonText}>Böl</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}

      {/* Kategori Ekleme Modalı */}
      {showCategoryModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowCategoryModal(false);
            setCategoryErrors({});
          }}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowCategoryModal(false);
                  setCategoryErrors({});
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kategori Adı *</Text>
                  <TextInput
                    value={newCategory.name}
                    onChangeText={(text) => {
                      setNewCategory({...newCategory, name: text});
                      if (categoryErrors.name) {
                        setCategoryErrors({...categoryErrors, name: ''});
                      }
                    }}
                    placeholder="Kategori adını girin"
                    style={[
                      styles.textInput,
                      categoryErrors.name && styles.textInputError
                    ]}
                  />
                  {categoryErrors.name && (
                    <Text style={styles.errorText}>{categoryErrors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Açıklama</Text>
                  <TextInput
                    value={newCategory.description}
                    onChangeText={(text) => setNewCategory({...newCategory, description: text})}
                    placeholder="Kategori açıklaması"
                    multiline
                    numberOfLines={2}
                    style={[styles.textInput, styles.textArea]}
                  />
                </View>

                <View style={styles.switchGroup}>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Aktif</Text>
                    <Switch
                      value={newCategory.is_active}
                      onValueChange={(value) => setNewCategory({...newCategory, is_active: value})}
                      trackColor={{ false: Colors.border, true: Colors.success }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCategoryModal(false);
                  setCategoryErrors({});
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveCategory}
              >
                <Text style={styles.primaryButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        )}

      {/* Confirmation Modal - Sadece Web'de */}
      {Platform.OS === 'web' && ConfirmationModal && (
        <ConfirmationModal
          visible={confirmationModal.visible}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          type={confirmationModal.type}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationCancel}
          isLoading={confirmationModal.isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    height: '100vh',
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
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
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
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#dc2626',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  categoryOrder: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#10b981',
  },
  inactiveButton: {
    backgroundColor: '#f59e0b',
  },
  statusButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  actionsGrid: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    minHeight: 120,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  primaryActionButton: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  dangerActionButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  warningActionButton: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  infoActionButton: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  numberInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1f2937',
    width: 80,
    textAlign: 'center',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  discountButton: {
    backgroundColor: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.25)',
    elevation: 10,
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  categorySelectItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categorySelectItemSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  categorySelectText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  categorySelectTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  dangerButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalFormContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  textInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  categorySelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  warningSubtext: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 4,
    fontStyle: 'italic',
  },
  disabledButton: {
    opacity: 0.5,
  },
  splitInputGroup: {
    marginBottom: 16,
  },
  splitInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  addSplitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  addSplitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeSplitButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeSplitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  productAssignmentItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categorySelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  categorySelectionButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categorySelectionButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categorySelectionButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  deleteProductButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  deleteProductButtonSelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  deleteProductButtonText: {
    color: '#dc2626',
    fontWeight: '500',
  },
  deleteProductButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
});

export default MenuSettingsScreen;
