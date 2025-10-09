import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB, 
  DataTable,
  Chip,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  List,
  Switch,
  SegmentedButtons,
  Avatar
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Mock data
const mockMenuItems = [
  {
    id: 1,
    name: 'Mercimek Çorbası',
    description: 'Geleneksel mercimek çorbası',
    price: 25,
    category: 'soup',
    status: 'active',
    image_url: null,
    preparation_time: 15,
    ingredients: ['Mercimek', 'Soğan', 'Havuç', 'Patates']
  },
  {
    id: 2,
    name: 'Adana Kebap',
    description: 'Baharatlı kıyma kebap',
    price: 85,
    category: 'main',
    status: 'active',
    image_url: null,
    preparation_time: 25,
    ingredients: ['Kıyma', 'Baharat', 'Soğan']
  },
  {
    id: 3,
    name: 'Izgara Köfte',
    description: 'El yapımı ızgara köfte',
    price: 75,
    category: 'main',
    status: 'active',
    image_url: null,
    preparation_time: 20,
    ingredients: ['Kıyma', 'Ekmek', 'Soğan', 'Yumurta']
  },
  {
    id: 4,
    name: 'Karışık Izgara',
    description: 'Karışık et seçenekleri',
    price: 120,
    category: 'main',
    status: 'active',
    image_url: null,
    preparation_time: 30,
    ingredients: ['Et', 'Tavuk', 'Kuzu']
  },
  {
    id: 5,
    name: 'Lahmacun',
    description: 'İnce hamur lahmacun',
    price: 35,
    category: 'main',
    status: 'active',
    image_url: null,
    preparation_time: 15,
    ingredients: ['Hamur', 'Kıyma', 'Domates', 'Soğan']
  },
  {
    id: 6,
    name: 'Çoban Salatası',
    description: 'Taze sebze salatası',
    price: 30,
    category: 'salad',
    status: 'active',
    image_url: null,
    preparation_time: 10,
    ingredients: ['Domates', 'Salatalık', 'Soğan', 'Maydanoz']
  },
  {
    id: 7,
    name: 'Ayran',
    description: 'Ev yapımı ayran',
    price: 15,
    category: 'beverage',
    status: 'active',
    image_url: null,
    preparation_time: 5,
    ingredients: ['Yoğurt', 'Su', 'Tuz']
  },
  {
    id: 8,
    name: 'Çay',
    description: 'Türk çayı',
    price: 8,
    category: 'beverage',
    status: 'active',
    image_url: null,
    preparation_time: 3,
    ingredients: ['Çay', 'Su']
  }
];

const categories = {
  soup: 'Çorbalar',
  main: 'Ana Yemekler',
  salad: 'Salatalar',
  beverage: 'İçecekler',
  dessert: 'Tatlılar'
};

const categoryColors = {
  soup: '#f59e0b',
  main: '#ef4444',
  salad: '#10b981',
  beverage: '#3b82f6',
  dessert: '#8b5cf6'
};

export default function MenuManagementScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    status: 'active',
    preparation_time: '',
    ingredients: []
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setRefreshing(true);
    try {
      // Gerçek API çağrısı
      // const response = await api.getMenuItems();
      // setMenuItems(response.data);
      
      // Mock data kullan
      setTimeout(() => {
        setMenuItems(mockMenuItems);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Menü verileri yüklenirken hata:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMenuItems();
  };

  const handleAddItem = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'main',
      status: 'active',
      preparation_time: '',
      ingredients: []
    });
    setShowAddDialog(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      status: item.status,
      preparation_time: item.preparation_time.toString(),
      ingredients: [...item.ingredients]
    });
    setShowEditDialog(true);
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Ürünü Sil',
      `${item.name} adlı ürünü silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            // API çağrısı yapılacak
            console.log('Ürün siliniyor:', item.id);
            loadMenuItems();
          }
        }
      ]
    );
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Hata', 'Lütfen ürün adı ve fiyatını girin.');
      return;
    }

    setLoading(true);
    try {
      if (showAddDialog) {
        // Yeni ürün ekleme
        // await api.createMenuItem(formData);
        console.log('Yeni ürün ekleniyor:', formData);
      } else {
        // Ürün güncelleme
        // await api.updateMenuItem(selectedItem.id, formData);
        console.log('Ürün güncelleniyor:', selectedItem.id, formData);
      }
      
      setShowAddDialog(false);
      setShowEditDialog(false);
      loadMenuItems();
    } catch (error) {
      console.error('Ürün kaydedilirken hata:', error);
      Alert.alert('Hata', 'Ürün kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    Alert.prompt(
      'Malzeme Ekle',
      'Malzeme adını girin:',
      (text) => {
        if (text && text.trim()) {
          setFormData({
            ...formData,
            ingredients: [...formData.ingredients, text.trim()]
          });
        }
      }
    );
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? '#10b981' : '#ef4444';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Aktif' : 'Pasif';
  };

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
          <Appbar.Content title="Menü Yönetimi" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <Paragraph style={styles.headerSubtitle}>Ürünleri düzenle ve yönet</Paragraph>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <SegmentedButtons
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            buttons={[
              { value: 'all', label: 'Tümü' },
              { value: 'soup', label: 'Çorbalar' },
              { value: 'main', label: 'Ana Yemek' },
              { value: 'salad', label: 'Salata' },
              { value: 'beverage', label: 'İçecek' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {selectedCategory === 'all' ? (
            // Show all categories grouped
            Object.keys(groupedItems).map((category) => (
              <View key={category}>
                <View style={styles.categoryHeader}>
                  <Title style={styles.categoryTitle}>
                    {categories[category]}
                  </Title>
                  <Chip
                    mode="outlined"
                    compact
                    style={[styles.categoryChip, { borderColor: categoryColors[category] }]}
                    textStyle={{ color: categoryColors[category] }}
                  >
                    {groupedItems[category].length} ürün
                  </Chip>
                </View>
                
                {groupedItems[category].map((item) => (
                  <Card key={item.id} style={styles.menuItemCard}>
                    <Card.Content style={styles.cardContent}>
                      {/* Header Section */}
                      <View style={styles.cardHeader}>
                        <View style={styles.itemMainInfo}>
                          <Avatar.Icon 
                            size={50} 
                            icon="food" 
                            style={[styles.itemAvatar, { backgroundColor: categoryColors[item.category] }]}
                          />
                          <View style={styles.itemDetails}>
                            <Title style={styles.itemName}>
                              {item.name}
                            </Title>
                            <Paragraph style={styles.itemDescription}>
                              {item.description}
                            </Paragraph>
                          </View>
                        </View>
                        
                        <View style={styles.statusContainer}>
                          <Chip
                            mode="outlined"
                            compact
                            style={[
                              styles.statusChip,
                              { borderColor: getStatusColor(item.status) }
                            ]}
                            textStyle={{ 
                              color: getStatusColor(item.status),
                              fontSize: 12,
                              fontWeight: 'bold'
                            }}
                          >
                            {getStatusLabel(item.status)}
                          </Chip>
                        </View>
                      </View>

                      {/* Price and Time Section */}
                      <View style={styles.priceTimeSection}>
                        <View style={styles.priceContainer}>
                          <Paragraph style={styles.priceLabel}>Fiyat:</Paragraph>
                          <Title style={styles.priceText}>₺{item.price}</Title>
                        </View>
                        <View style={styles.timeContainer}>
                          <Paragraph style={styles.timeLabel}>Hazırlık:</Paragraph>
                          <Paragraph style={styles.timeText}>{item.preparation_time} dk</Paragraph>
                        </View>
                      </View>

                      {/* Ingredients Section */}
                      {item.ingredients && item.ingredients.length > 0 && (
                        <View style={styles.ingredientsSection}>
                          <Paragraph style={styles.sectionLabel}>Malzemeler:</Paragraph>
                          <View style={styles.ingredientsContainer}>
                            {item.ingredients.map((ingredient, index) => (
                              <Chip
                                key={index}
                                mode="outlined"
                                compact
                                style={styles.ingredientChip}
                                textStyle={{ fontSize: 12 }}
                              >
                                {ingredient}
                              </Chip>
                            ))}
                          </View>
                        </View>
                      )}

                  {/* Action Buttons */}
                  <View style={styles.actionSection}>
                    <IconButton
                      icon="pencil"
                      size={24}
                      iconColor="#1e3a8a"
                      onPress={() => handleEditItem(item)}
                      style={styles.actionIconButton}
                    />
                    <IconButton
                      icon="delete"
                      size={24}
                      iconColor="#ef4444"
                      onPress={() => handleDeleteItem(item)}
                      style={styles.actionIconButton}
                    />
                  </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ))
          ) : (
            // Show single category
            filteredItems.map((item) => (
              <Card key={item.id} style={styles.menuItemCard}>
                <Card.Content style={styles.cardContent}>
                  {/* Header Section */}
                  <View style={styles.cardHeader}>
                    <View style={styles.itemMainInfo}>
                      <Avatar.Icon 
                        size={50} 
                        icon="food" 
                        style={[styles.itemAvatar, { backgroundColor: categoryColors[item.category] }]}
                      />
                      <View style={styles.itemDetails}>
                        <Title style={styles.itemName}>
                          {item.name}
                        </Title>
                        <Paragraph style={styles.itemDescription}>
                          {item.description}
                        </Paragraph>
                      </View>
                    </View>
                    
                    <View style={styles.statusContainer}>
                      <Chip
                        mode="outlined"
                        compact
                        style={[
                          styles.statusChip,
                          { borderColor: getStatusColor(item.status) }
                        ]}
                        textStyle={{ 
                          color: getStatusColor(item.status),
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </Chip>
                    </View>
                  </View>

                  {/* Price and Time Section */}
                  <View style={styles.priceTimeSection}>
                    <View style={styles.priceContainer}>
                      <Paragraph style={styles.priceLabel}>Fiyat:</Paragraph>
                      <Title style={styles.priceText}>₺{item.price}</Title>
                    </View>
                    <View style={styles.timeContainer}>
                      <Paragraph style={styles.timeLabel}>Hazırlık:</Paragraph>
                      <Paragraph style={styles.timeText}>{item.preparation_time} dk</Paragraph>
                    </View>
                  </View>

                  {/* Ingredients Section */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <View style={styles.ingredientsSection}>
                      <Paragraph style={styles.sectionLabel}>Malzemeler:</Paragraph>
                      <View style={styles.ingredientsContainer}>
                        {item.ingredients.map((ingredient, index) => (
                          <Chip
                            key={index}
                            mode="outlined"
                            compact
                            style={styles.ingredientChip}
                            textStyle={{ fontSize: 12 }}
                          >
                            {ingredient}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionSection}>
                    <IconButton
                      icon="pencil"
                      size={24}
                      iconColor="#1e3a8a"
                      onPress={() => handleEditItem(item)}
                      style={styles.actionIconButton}
                    />
                    <IconButton
                      icon="delete"
                      size={24}
                      iconColor="#ef4444"
                      onPress={() => handleDeleteItem(item)}
                      style={styles.actionIconButton}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      {/* Add Item FAB */}
      <FAB
        icon="plus"
        label="Yeni Ürün"
        style={styles.addFab}
        onPress={handleAddItem}
      />

      {/* Add Item Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Yeni Ürün Ekle</Dialog.Title>
          <Dialog.Content>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput
                label="Ürün Adı *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              
              <TextInput
                label="Açıklama"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              
              <TextInput
                label="Fiyat (₺) *"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <TextInput
                label="Hazırlık Süresi (dakika)"
                value={formData.preparation_time}
                onChangeText={(text) => setFormData({ ...formData, preparation_time: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <SegmentedButtons
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                buttons={[
                  { value: 'soup', label: 'Çorba' },
                  { value: 'main', label: 'Ana Yemek' },
                  { value: 'salad', label: 'Salata' },
                  { value: 'beverage', label: 'İçecek' },
                ]}
                style={styles.input}
              />
              
              <Title style={styles.ingredientsTitle}>Malzemeler</Title>
              {formData.ingredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  onClose={() => removeIngredient(index)}
                  style={styles.ingredientChip}
                >
                  {ingredient}
                </Chip>
              ))}
              <Button
                mode="outlined"
                onPress={addIngredient}
                style={styles.addIngredientButton}
                icon="plus"
              >
                Malzeme Ekle
              </Button>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>İptal</Button>
            <Button 
              onPress={handleSaveItem}
              loading={loading}
              mode="contained"
            >
              Kaydet
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Item Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Ürün Düzenle</Dialog.Title>
          <Dialog.Content>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput
                label="Ürün Adı *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
              />
              
              <TextInput
                label="Açıklama"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              
              <TextInput
                label="Fiyat (₺) *"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <TextInput
                label="Hazırlık Süresi (dakika)"
                value={formData.preparation_time}
                onChangeText={(text) => setFormData({ ...formData, preparation_time: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <SegmentedButtons
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                buttons={[
                  { value: 'soup', label: 'Çorba' },
                  { value: 'main', label: 'Ana Yemek' },
                  { value: 'salad', label: 'Salata' },
                  { value: 'beverage', label: 'İçecek' },
                ]}
                style={styles.input}
              />
              
              <Title style={styles.ingredientsTitle}>Malzemeler</Title>
              {formData.ingredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  onClose={() => removeIngredient(index)}
                  style={styles.ingredientChip}
                >
                  {ingredient}
                </Chip>
              ))}
              <Button
                mode="outlined"
                onPress={addIngredient}
                style={styles.addIngredientButton}
                icon="plus"
              >
                Malzeme Ekle
              </Button>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>İptal</Button>
            <Button 
              onPress={handleSaveItem}
              loading={loading}
              mode="contained"
            >
              Güncelle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 16,
    marginTop: -10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -20,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    paddingVertical: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryChip: {
    backgroundColor: 'transparent',
  },
  menuItemCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemAvatar: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  priceTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    marginBottom: 4,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionIconButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
  },
  addFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e3a8a',
  },
  dialogContent: {
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addIngredientButton: {
    marginTop: 8,
  },
});
