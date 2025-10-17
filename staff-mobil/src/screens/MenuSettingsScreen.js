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
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useNavigation } from '@react-navigation/native';

const MenuSettingsScreen = () => {
  const { user, hasRole } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('categories');
  const [refreshing, setRefreshing] = useState(false);

  // Kategori Yönetimi
  const [categories, setCategories] = useState([
    { id: 1, name: 'Ana Yemek', is_active: true, display_order: 1, color: '#dc2626' },
    { id: 2, name: 'Çorba', is_active: true, display_order: 2, color: '#f59e0b' },
    { id: 3, name: 'Meze', is_active: true, display_order: 3, color: '#10b981' },
    { id: 4, name: 'Salata', is_active: true, display_order: 4, color: '#3b82f6' },
    { id: 5, name: 'Tatlı', is_active: true, display_order: 5, color: '#8b5cf6' },
    { id: 6, name: 'Sıcak İçecek', is_active: true, display_order: 6, color: '#ef4444' },
    { id: 7, name: 'Soğuk İçecek', is_active: true, display_order: 7, color: '#06b6d4' },
  ]);

  // Fiyat Yönetimi
  const [priceSettings, setPriceSettings] = useState({
    bulkIncreasePercent: 5,
    autoApproval: false,
    costMarginPercent: 30,
  });

  const [priceHistory, setPriceHistory] = useState([
    { id: 1, item_name: 'Adana Kebab', old_price: 50, new_price: 55, changed_at: '2024-01-15 14:30', changed_by: 'Admin' },
    { id: 2, item_name: 'Margherita Pizza', old_price: 40, new_price: 45, changed_at: '2024-01-14 10:15', changed_by: 'Admin' },
    { id: 3, item_name: 'Cheeseburger', old_price: 30, new_price: 35, changed_at: '2024-01-13 16:45', changed_by: 'Admin' },
  ]);

  // Hazırlık Süresi Ayarları
  const [preparationSettings, setPreparationSettings] = useState([
    { category_id: 1, category_name: 'Ana Yemek', default_time: 20, seasonal_adjustment: 0, busy_multiplier: 1.5 },
    { category_id: 2, category_name: 'Çorba', default_time: 15, seasonal_adjustment: 0, busy_multiplier: 1.2 },
    { category_id: 3, category_name: 'Meze', default_time: 10, seasonal_adjustment: 0, busy_multiplier: 1.1 },
    { category_id: 4, category_name: 'Salata', default_time: 5, seasonal_adjustment: 0, busy_multiplier: 1.0 },
    { category_id: 5, category_name: 'Tatlı', default_time: 8, seasonal_adjustment: 0, busy_multiplier: 1.1 },
    { category_id: 6, category_name: 'Sıcak İçecek', default_time: 3, seasonal_adjustment: 0, busy_multiplier: 1.0 },
    { category_id: 7, category_name: 'Soğuk İçecek', default_time: 2, seasonal_adjustment: 0, busy_multiplier: 1.0 },
  ]);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

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
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, is_active: !cat.is_active }
          : cat
      )
    );
  };

  const handleReorderCategories = (fromIndex, toIndex) => {
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(fromIndex, 1);
    newCategories.splice(toIndex, 0, movedCategory);
    
    // Display order'ları güncelle
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      display_order: index + 1
    }));
    
    setCategories(updatedCategories);
  };

  const handleMergeCategories = () => {
    if (selectedCategories.length < 2) {
      Alert.alert('Hata', 'En az 2 kategori seçmelisiniz.');
      return;
    }
    
    Alert.alert(
      'Kategori Birleştirme',
      `Seçilen ${selectedCategories.length} kategoriyi birleştirmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Birleştir',
          onPress: () => {
            // Birleştirme işlemi
            Alert.alert('Başarılı', 'Kategoriler başarıyla birleştirildi.');
            setShowMergeModal(false);
            setSelectedCategories([]);
          },
        },
      ]
    );
  };

  // Fiyat Yönetimi Fonksiyonları
  const handleBulkPriceUpdate = () => {
    const { bulkIncreasePercent } = priceSettings;
    Alert.alert(
      'Toplu Fiyat Güncelleme',
      `Tüm ürünlerin fiyatını %${bulkIncreasePercent} artırmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Güncelle',
          onPress: () => {
            Alert.alert('Başarılı', `Tüm ürünlerin fiyatı %${bulkIncreasePercent} artırıldı.`);
            setShowBulkPriceModal(false);
          },
        },
      ]
    );
  };

  const handleAutoPriceCalculation = (item) => {
    const { costMarginPercent } = priceSettings;
    const suggestedPrice = item.cost * (1 + costMarginPercent / 100);
    Alert.alert(
      'Otomatik Fiyat Hesaplama',
      `Maliyet: ₺${item.cost}\nÖnerilen Fiyat: ₺${suggestedPrice.toFixed(2)}\nKar Marjı: %${costMarginPercent}`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Uygula',
          onPress: () => {
            Alert.alert('Başarılı', 'Fiyat otomatik olarak hesaplandı ve uygulandı.');
          },
        },
      ]
    );
  };

  // Hazırlık Süresi Fonksiyonları
  const handleUpdatePreparationTime = (categoryId, field, value) => {
    setPreparationSettings(prev =>
      prev.map(setting =>
        setting.category_id === categoryId
          ? { ...setting, [field]: value }
          : setting
      )
    );
  };

  const renderCategoriesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori Yönetimi</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.addButtonText}>+ Kategori Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Kategori Sıralaması */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Kategori Sıralaması</Text>
        <Text style={styles.sectionDescription}>
          Kategorilerin menüde görüneceği sırayı belirleyin
        </Text>
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
        <Text style={styles.subsectionTitle}>Kategori İşlemleri</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowMergeModal(true)}
          >
            <Text style={styles.actionButtonText}>🔗 Kategorileri Birleştir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>✂️ Kategori Böl</Text>
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

      {/* Toplu Fiyat Güncelleme */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Toplu Fiyat Güncelleme</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Artış Oranı (%):</Text>
          <TextInput
            style={styles.numberInput}
            value={priceSettings.bulkIncreasePercent.toString()}
            onChangeText={(text) => setPriceSettings(prev => ({
              ...prev,
              bulkIncreasePercent: parseInt(text) || 0
            }))}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setShowBulkPriceModal(true)}
        >
          <Text style={styles.primaryButtonText}>Toplu Fiyat Güncelle</Text>
        </TouchableOpacity>
      </View>

      {/* Fiyat Onay Sistemi */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Fiyat Onay Sistemi</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Otomatik Onay</Text>
          <Switch
            value={priceSettings.autoApproval}
            onValueChange={(value) => setPriceSettings(prev => ({
              ...prev,
              autoApproval: value
            }))}
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
        <Text style={styles.settingDescription}>
          Açık: Fiyat değişiklikleri otomatik onaylanır
        </Text>
      </View>

      {/* Otomatik Fiyat Hesaplama */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Otomatik Fiyat Hesaplama</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Kar Marjı (%):</Text>
          <TextInput
            style={styles.numberInput}
            value={priceSettings.costMarginPercent.toString()}
            onChangeText={(text) => setPriceSettings(prev => ({
              ...prev,
              costMarginPercent: parseInt(text) || 0
            }))}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.settingDescription}>
          Maliyet + Kar Marjı = Önerilen Fiyat
        </Text>
      </View>

      {/* Fiyat Geçmişi */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Son Fiyat Değişiklikleri</Text>
        {priceHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyItemName}>{item.item_name}</Text>
              <Text style={styles.historyPrice}>
                ₺{item.old_price} → ₺{item.new_price}
              </Text>
            </View>
            <View style={styles.historyMeta}>
              <Text style={styles.historyDate}>{item.changed_at}</Text>
              <Text style={styles.historyUser}>{item.changed_by}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPreparationTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hazırlık Süresi Ayarları</Text>
      </View>

      {preparationSettings.map((setting) => (
        <View key={setting.category_id} style={styles.section}>
          <Text style={styles.subsectionTitle}>{setting.category_name}</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Varsayılan Süre (dk):</Text>
            <TextInput
              style={styles.numberInput}
              value={setting.default_time.toString()}
              onChangeText={(text) => handleUpdatePreparationTime(
                setting.category_id, 
                'default_time', 
                parseInt(text) || 0
              )}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Mevsimsel Ayarlama (dk):</Text>
            <TextInput
              style={styles.numberInput}
              value={setting.seasonal_adjustment.toString()}
              onChangeText={(text) => handleUpdatePreparationTime(
                setting.category_id, 
                'seasonal_adjustment', 
                parseInt(text) || 0
              )}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Yoğunluk Çarpanı:</Text>
            <TextInput
              style={styles.numberInput}
              value={setting.busy_multiplier.toString()}
              onChangeText={(text) => handleUpdatePreparationTime(
                setting.category_id, 
                'busy_multiplier', 
                parseFloat(text) || 1.0
              )}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.settingDescription}>
            Gerçek süre = (Varsayılan + Mevsimsel) × Yoğunluk Çarpanı
          </Text>
        </View>
      ))}
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
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preparation' && styles.activeTab]}
            onPress={() => setActiveTab('preparation')}
          >
            <Text style={[styles.tabText, activeTab === 'preparation' && styles.activeTabText]}>
              Hazırlık
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'pricing' && renderPricingTab()}
        {activeTab === 'preparation' && renderPreparationTab()}
      </ScrollView>

      {/* Kategori Birleştirme Modalı */}
      <Modal
        visible={showMergeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMergeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategorileri Birleştir</Text>
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
                <Text style={[
                  styles.categorySelectText,
                  selectedCategories.includes(category.id) && styles.categorySelectTextSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowMergeModal(false);
                  setSelectedCategories([]);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleMergeCategories}
              >
                <Text style={styles.primaryButtonText}>Birleştir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toplu Fiyat Güncelleme Modalı */}
      <Modal
        visible={showBulkPriceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBulkPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Toplu Fiyat Güncelleme</Text>
            <Text style={styles.modalDescription}>
              Tüm ürünlerin fiyatını %{priceSettings.bulkIncreasePercent} artıracaksınız.
            </Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Bu işlem geri alınamaz! Tüm ürünlerin fiyatı değişecek.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBulkPriceModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBulkPriceUpdate}
              >
                <Text style={styles.primaryButtonText}>Güncelle</Text>
              </TouchableOpacity>
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyInfo: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  historyPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  historyMeta: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  historyUser: {
    fontSize: 12,
    color: '#6b7280',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    borderRadius: 16,
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
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
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
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

export default MenuSettingsScreen;
