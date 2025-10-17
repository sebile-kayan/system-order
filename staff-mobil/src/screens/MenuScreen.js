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
  StyleSheet,
  RefreshControl,
  Alert,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import Modal from '../components/Modal';
import useModal from '../hooks/useModal';
import useForm from '../hooks/useForm';

const MenuScreen = () => {
  const { user, hasRole } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newItem, setNewItem] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    preparation_time: '',
    category_id: null,
    image_url: '',
    is_available: true,
    is_vegetarian: false,
  });

  // Modal hooks
  const addModal = useModal();
  const categoryModal = useModal();
  const editModal = useModal();
  
  const [categories, setCategories] = useState([
    { id: 1, name: 'Ana Yemek', isActive: true, display_order: 1 },
    { id: 2, name: 'Çorba', isActive: true, display_order: 2 },
    { id: 3, name: 'Meze', isActive: true, display_order: 3 },
    { id: 4, name: 'Salata', isActive: true, display_order: 4 },
    { id: 5, name: 'Tatlı', isActive: true, display_order: 5 },
    { id: 6, name: 'Sıcak İçecek', isActive: true, display_order: 6 },
    { id: 7, name: 'Soğuk İçecek', isActive: true, display_order: 7 },
  ]);

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Adana Kebab',
      description: 'Acılı kıyma kebabı, pilav ve salata ile',
      price: 55.00,
      category_id: 1,
      category: 'Ana Yemek',
      is_available: true,
      preparation_time: 15,
      image_url: null,
      is_vegetarian: false,
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      description: 'Domates, mozzarella ve fesleğenli pizza',
      price: 45.00,
      category_id: 1,
      category: 'Ana Yemek',
      is_available: true,
      preparation_time: 20,
      image_url: null,
      is_vegetarian: true,
    },
    {
      id: 3,
      name: 'Cheeseburger',
      description: 'Et köfte, peynir, marul ve domates',
      price: 35.00,
      category_id: 1,
      category: 'Ana Yemek',
      is_available: true,
      preparation_time: 10,
      image_url: null,
      is_vegetarian: false,
    },
    {
      id: 4,
      name: 'Ayran',
      description: 'Ev yapımı ayran',
      price: 15.00,
      category_id: 7,
      category: 'Soğuk İçecek',
      is_available: true,
      preparation_time: 2,
      image_url: null,
      is_vegetarian: true,
    },
    {
      id: 5,
      name: 'Cola',
      description: '330ml kutu kola',
      price: 15.00,
      category_id: 7,
      category: 'Soğuk İçecek',
      is_available: false,
      preparation_time: 1,
      image_url: null,
      is_vegetarian: true,
    },
    {
      id: 6,
      name: 'Tiramisu',
      description: 'İtalyan tatlısı',
      price: 25.00,
      category_id: 5,
      category: 'Tatlı',
      is_available: true,
      preparation_time: 5,
      image_url: null,
      is_vegetarian: true,
    },
  ]);

  // Form hooks
  const itemForm = useForm({
    name: '',
    description: '',
    price: '',
    category_id: 1,
    preparation_time: '',
    is_available: true,
    is_vegetarian: false,
    image_url: '',
  }, {
    name: { required: true, requiredMessage: 'Ürün adı zorunludur' },
    price: { 
      required: true, 
      requiredMessage: 'Fiyat zorunludur',
      pattern: /^\d+(\.\d{1,2})?$/,
      patternMessage: 'Geçerli bir fiyat giriniz'
    },
    preparation_time: { 
      required: true, 
      requiredMessage: 'Hazırlık süresi zorunludur',
      pattern: /^\d+$/,
      patternMessage: 'Geçerli bir süre giriniz'
    },
    category_id: { 
      required: true, 
      requiredMessage: 'Kategori seçimi zorunludur',
      custom: (value) => {
        if (!value || value === null || value === '') {
          return 'Kategori seçimi zorunludur';
        }
        return null;
      }
    },
  });

  const categoryForm = useForm({
    name: '',
    description: '',
    display_order: categories.length + 1,
    is_active: true,
  }, {
    name: { required: true, requiredMessage: 'Kategori adı zorunludur' },
  });

  // Ürün düzenleme için ayrı form
  const editItemForm = useForm({
    name: '',
    description: '',
    price: '',
    preparation_time: '',
    category_id: null,
    image_url: '',
    is_available: true,
    is_vegetarian: false,
  }, {
    name: { required: true, requiredMessage: 'Ürün adı zorunludur' },
    price: { 
      required: true, 
      requiredMessage: 'Fiyat zorunludur',
      pattern: /^\d+(\.\d{1,2})?$/,
      patternMessage: 'Geçerli bir fiyat giriniz'
    },
    preparation_time: { 
      required: true, 
      requiredMessage: 'Hazırlık süresi zorunludur',
      pattern: /^\d+$/,
      patternMessage: 'Geçerli bir süre giriniz'
    },
    category_id: { 
      required: true, 
      requiredMessage: 'Kategori seçimi zorunludur',
      custom: (value) => {
        if (!value || value === null || value === '') {
          return 'Kategori seçimi zorunludur';
        }
        return null;
      }
    },
  });

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
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === 'available' ? item.is_available :
                           selectedCategory === 'unavailable' ? !item.is_available :
                           item.category === selectedCategory;
    const matchesVegetarian = !showVegetarianOnly || item.is_vegetarian;
    return matchesSearch && matchesCategory && matchesVegetarian;
  });

  const handleToggleAvailability = (itemId) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, is_available: !item.is_available } : item
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
    setEditingItem(item);
    setShowEditModal(true);
    
    // Edit form'unu doldur
    editItemForm.setValue('name', item.name);
    editItemForm.setValue('description', item.description);
    editItemForm.setValue('price', item.price.toString());
    editItemForm.setValue('category_id', item.category_id);
    editItemForm.setValue('preparation_time', item.preparation_time.toString());
    editItemForm.setValue('is_available', item.is_available);
    editItemForm.setValue('is_vegetarian', item.is_vegetarian);
    editItemForm.setValue('image_url', item.image_url || '');
    setNewItem({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      price: String(item.price ?? ''),
      preparation_time: String(item.preparation_time ?? ''),
      category_id: item.category_id ?? null,
      image_url: item.image_url || '',
      is_available: !!item.is_available,
      is_vegetarian: !!item.is_vegetarian,
    });
    setShowEditModal(true);
  };

  const handleAddCategory = () => {
    categoryForm.resetForm();
    categoryForm.setValue('display_order', categories.length + 1);
    setShowCategoryModal(true);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      // Edit modunda editItemForm validasyonu
      if (!editItemForm.validateForm()) {
        return;
      }
      
      const itemData = {
        ...editItemForm.values,
        id: editingItem.id,
        price: isNaN(parseFloat(editItemForm.values.price)) ? 0 : parseFloat(editItemForm.values.price),
        preparation_time: isNaN(parseInt(editItemForm.values.preparation_time)) ? 0 : parseInt(editItemForm.values.preparation_time),
        category: categories.find(cat => cat.id === editItemForm.values.category_id)?.name || 'Ana Yemek',
      };
      
      setMenuItems(prevItems =>
        prevItems.map(item => item.id === editingItem.id ? itemData : item)
      );
      setShowEditModal(false);
    } else {
      // Yeni ekleme modunda itemForm validasyonu
      if (!itemForm.validateForm()) {
        return;
      }
      // Yeni ekleme modunda itemForm state'ini kullan
      if (!itemForm.validateForm()) {
        return;
      }

      const itemData = {
        ...itemForm.values,
        id: Date.now(),
        price: isNaN(parseFloat(itemForm.values.price)) ? 0 : parseFloat(itemForm.values.price),
        preparation_time: isNaN(parseInt(itemForm.values.preparation_time)) ? 0 : parseInt(itemForm.values.preparation_time),
        category: categories.find(cat => cat.id === itemForm.values.category_id)?.name || 'Ana Yemek',
      };
      
      setMenuItems(prevItems => [...prevItems, itemData]);
      addModal.closeModal();
    }

    itemForm.resetForm();
    setEditingItem(null);
  };

  const handleSaveCategory = () => {
    // Hataları temizle
    setCategoryErrors({});
    
    // Kategori adı zorunlu kontrolü
    if (!newCategory.name.trim()) {
      setCategoryErrors({ name: 'Kategori adı zorunludur' });
      return;
    }

    const categoryData = {
      ...newCategory,
      id: Date.now(),
      isActive: newCategory.is_active,
    };

    setCategories(prev => [...prev, categoryData]);
    setShowCategoryModal(false);
    setNewCategory({ name: '', description: '', is_active: true });
    setCategoryErrors({});
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{menuItems.length}</Text>
              <Text style={styles.statLabel}>Toplam Ürün</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{menuItems.filter(item => item.is_available).length}</Text>
              <Text style={styles.statLabel}>Mevcut</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{categories.filter(cat => cat.isActive).length}</Text>
              <Text style={styles.statLabel}>Kategori</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                ₺{menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(0) : '0'}
              </Text>
              <Text style={styles.statLabel}>Ort. Fiyat</Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <Card style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Ürün Ekle"
              icon="➕"
              variant="outline"
              size="small"
              onPress={() => {
                // Formu temizle
                itemForm.resetForm();
                setNewItem({
                  id: null,
                  name: '',
                  description: '',
                  price: '',
                  preparation_time: '',
                  category_id: null,
                  image_url: '',
                  is_available: true,
                  is_vegetarian: false,
                });
                addModal.openModal();
              }}
              style={styles.actionButton}
            />
            <Button
              title="Kategori Ekle"
              icon="📁"
              variant="outline"
              size="small"
              onPress={handleAddCategory}
              style={styles.actionButton}
            />
            <Button
              title="Menü Raporu"
              icon="📊"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('MenuReports')}
              style={styles.actionButton}
            />
            <Button
              title="Menü Ayarları"
              icon="⚙️"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('MenuSettings')}
              style={styles.actionButton}
            />
          </View>
        </Card>

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

        {/* Arama ve Vejetaryen Filtresi */}
        <Card style={styles.searchSection}>
          <Input
            label="Ürün Ara"
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Ürün adı veya açıklama..."
            style={styles.searchInput}
          />
          <View style={styles.filterRow}>
            <View style={styles.vegetarianFilter}>
              <Text style={styles.filterLabel}>🌱 Sadece Vejetaryen</Text>
              <Switch
                value={showVegetarianOnly}
                onValueChange={setShowVegetarianOnly}
                trackColor={{ false: Colors.gray200, true: Colors.success }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </Card>

        {/* Menü Listesi */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menü Öğeleri ({filteredItems.length})</Text>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <View style={styles.menuInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.is_vegetarian && (
                      <Text style={styles.vegetarianBadge}>🌱</Text>
                    )}
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <View style={styles.itemTags}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.preparationTime}>{item.preparation_time} dk</Text>
                  </View>
                </View>
                <View style={styles.menuActions}>
                  <TouchableOpacity
                    style={[
                      styles.availabilityButton,
                      item.is_available ? styles.availableButton : styles.unavailableButton
                    ]}
                    onPress={() => handleToggleAvailability(item.id)}
                  >
                    <Text style={styles.availabilityButtonText}>
                      {item.is_available ? 'Mevcut' : 'Mevcut Değil'}
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
                  <Text style={styles.detailValue}>{item.preparation_time} dakika</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vejetaryen:</Text>
                  <Text style={[styles.detailValue, { color: item.is_vegetarian ? Colors.success : Colors.error }]}>
                    {item.is_vegetarian ? 'Evet' : 'Hayır'}
                  </Text>
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
        visible={addModal.isVisible}
        onClose={addModal.closeModal}
        title="Yeni Ürün Ekle"
        size="large"
        scrollable
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveItem}
        secondaryButtonText="İptal"
        onSecondaryPress={addModal.closeModal}
      >
        <View style={styles.modalFormContainer}>
          <Input
            label="Ürün Adı *"
            value={itemForm.values.name}
            onChangeText={(text) => itemForm.setValue('name', text)}
            onBlur={() => itemForm.handleBlur('name')}
            placeholder="Ürün adını girin"
            error={itemForm.errors.name}
          />

        <Input
          label="Açıklama"
          value={itemForm.values.description}
          onChangeText={(text) => itemForm.setValue('description', text)}
          placeholder="Ürün açıklaması"
          multiline
          numberOfLines={3}
        />

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <Input
              label="Fiyat (₺) *"
              value={itemForm.values.price}
              onChangeText={(text) => itemForm.setValue('price', text)}
              onBlur={() => itemForm.handleBlur('price')}
              placeholder="0.00"
              keyboardType="numeric"
              error={itemForm.errors.price}
            />
          </View>
          <View style={styles.inputGroupHalf}>
            <Input
              label="Hazırlık Süresi (dk) *"
              value={itemForm.values.preparation_time}
              onChangeText={(text) => itemForm.setValue('preparation_time', text)}
              onBlur={() => itemForm.handleBlur('preparation_time')}
              placeholder="15"
              keyboardType="numeric"
              error={itemForm.errors.preparation_time}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Kategori *</Text>
          <View style={styles.categorySelector}>
            {categories.filter(cat => cat.isActive).map(category => (
              <Button
                key={category.id}
                title={category.name}
                variant={itemForm.values.category_id === category.id ? 'primary' : 'outline'}
                size="small"
                onPress={() => itemForm.setValue('category_id', category.id)}
                style={styles.categoryOption}
              />
            ))}
          </View>
        </View>

        <Input
          label="Resim URL"
          value={itemForm.values.image_url}
          onChangeText={(text) => itemForm.setValue('image_url', text)}
          placeholder="https://example.com/image.jpg"
        />

        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Mevcut</Text>
            <Switch
              value={itemForm.values.is_available}
              onValueChange={(value) => itemForm.setValue('is_available', value)}
              trackColor={{ false: Colors.gray200, true: Colors.success }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🌱 Vejetaryen</Text>
            <Switch
              value={itemForm.values.is_vegetarian}
              onValueChange={(value) => itemForm.setValue('is_vegetarian', value)}
              trackColor={{ false: Colors.gray200, true: Colors.success }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
        </View>
      </Modal>

      {/* Kategori Ekleme Modalı */}
      <Modal
        visible={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryErrors({});
        }}
        title="Yeni Kategori Ekle"
        size="medium"
        showCloseButton={true}
        scrollable={true}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveCategory}
        secondaryButtonText="İptal"
        onSecondaryPress={() => {
          setShowCategoryModal(false);
          setCategoryErrors({});
        }}
      >
        <View style={styles.modalFormContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kategori Adı *</Text>
            <Input
              value={newCategory.name}
              onChangeText={(text) => {
                setNewCategory({...newCategory, name: text});
                if (categoryErrors.name) {
                  setCategoryErrors({...categoryErrors, name: ''});
                }
              }}
              placeholder="Kategori adını girin"
              style={styles.textInput}
              error={categoryErrors.name}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Açıklama</Text>
            <Input
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
      </Modal>

      {/* Ürün Düzenleme Modalı */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Ürün Düzenle"
        size="large"
        showCloseButton={true}
        scrollable={true}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveItem}
        secondaryButtonText="İptal"
        onSecondaryPress={() => setShowEditModal(false)}
      >
        <View style={styles.modalFormContainer}>
                <View style={styles.inputGroup}>
                  <Input
                    label="Ürün Adı *"
                    value={editItemForm.values.name}
                    onChangeText={(text) => editItemForm.setValue('name', text)}
                    onBlur={() => editItemForm.handleBlur('name')}
                    placeholder="Ürün adını girin"
                    error={editItemForm.errors.name}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Input
                    label="Açıklama"
                    value={editItemForm.values.description}
                    onChangeText={(text) => editItemForm.setValue('description', text)}
                    placeholder="Ürün açıklaması"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroupHalf}>
                    <Input
                      label="Fiyat (₺) *"
                      value={editItemForm.values.price}
                      onChangeText={(text) => editItemForm.setValue('price', text)}
                      onBlur={() => editItemForm.handleBlur('price')}
                      placeholder="0.00"
                      keyboardType="numeric"
                      error={editItemForm.errors.price}
                    />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Input
                      label="Hazırlık Süresi (dk) *"
                      value={editItemForm.values.preparation_time}
                      onChangeText={(text) => editItemForm.setValue('preparation_time', text)}
                      onBlur={() => editItemForm.handleBlur('preparation_time')}
                      placeholder="15"
                      keyboardType="numeric"
                      error={editItemForm.errors.preparation_time}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kategori *</Text>
                  <View style={styles.categorySelector}>
                    {categories.filter(cat => cat.isActive).map(category => (
                      <Button
                        key={category.id}
                        title={category.name}
                        variant={editItemForm.values.category_id === category.id ? "primary" : "outline"}
                        size="small"
                        onPress={() => editItemForm.setValue('category_id', category.id)}
                        style={styles.categoryButton}
                      />
                    ))}
                  </View>
                  {editItemForm.errors.category_id && (
                    <Text style={styles.formErrorText}>{editItemForm.errors.category_id}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Input
                    label="Resim URL"
                    value={editItemForm.values.image_url}
                    onChangeText={(text) => editItemForm.setValue('image_url', text)}
                    placeholder="https://example.com/image.jpg"
                  />
                </View>

                <View style={styles.switchGroup}>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Mevcut</Text>
                    <Switch
                      value={editItemForm.values.is_available}
                      onValueChange={(value) => editItemForm.setValue('is_available', value)}
                      trackColor={{ false: Colors.border, true: Colors.success }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>🌱 Vejetaryen</Text>
                    <Switch
                      value={editItemForm.values.is_vegetarian}
                      onValueChange={(value) => editItemForm.setValue('is_vegetarian', value)}
                      trackColor={{ false: Colors.border, true: Colors.success }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    height: '100vh',
  },
  safeArea: {
    backgroundColor: Colors.background,
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
    ...Typography.styles.h2,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  accessDeniedText: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200, // Bottom navigation için makul boşluk
  },
  statsSection: {
    padding: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
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
    ...Typography.styles.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  actionsSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  filterSection: {
    padding: Spacing.screenPadding,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.gray100,
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  menuSection: {
    padding: Spacing.screenPadding,
    paddingBottom: 120, // Bottom navigation için makul boşluk
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  menuInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  itemDescription: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  itemCategory: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
    alignSelf: 'flex-start',
  },
  menuActions: {
    alignItems: 'flex-end',
  },
  availabilityButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
  },
  availableButton: {
    backgroundColor: Colors.success,
  },
  unavailableButton: {
    backgroundColor: Colors.warning,
  },
  availabilityButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  menuDetails: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  detailValue: {
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  editButton: {
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.sm,
  },
  editButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.sm,
  },
  deleteButtonText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Arama ve Filtre Stilleri
  searchSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  vegetarianFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  filterLabel: {
    ...Typography.styles.bodySmall,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  // Form Stilleri
  modalScrollView: {
    flex: 1,
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  modalFormContainer: {
    padding: Spacing.lg,
    flex: 1,
  },
  inputGroupHalf: {
    flex: 1,
    marginRight: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.styles.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  // Kategori Seçici
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryOption: {
    marginBottom: Spacing.sm,
  },
  categoryButton: {
    marginBottom: Spacing.sm,
    marginRight: Spacing.sm,
  },
  // Switch Stilleri
  switchGroup: {
    marginBottom: Spacing.xl,
    paddingHorizontal: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    ...Typography.styles.body,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  // Menü Kartı Güncellemeleri
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  vegetarianBadge: {
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
  },
  itemTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  preparationTime: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
  },
});

export default MenuScreen;
