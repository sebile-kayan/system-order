/**
 * MENU REPORTS SCREEN - Menü Raporu Ekranı (Sadece Admin)
 * 
 * Bu ekran menü performansı hakkında raporlar sağlar:
 * - En çok/az satılan ürünler
 * - Kategori bazlı satış dağılımı
 * - Günlük/haftalık/aylık satış trendleri
 * - Ortalama sipariş değeri
 * - Kategori bazlı gelir analizi
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useNavigation } from '@react-navigation/native';

const MenuReportsScreen = () => {
  const { hasRole } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState('topProducts');

  // Mock data - gerçek uygulamada API'den gelecek
  const [topProducts, setTopProducts] = useState([]);

  // Dönem bazlı mock veriler
  const dailyTopProducts = [
    { id: 1, name: 'Adana Kebab', order_count: 12, total_revenue: 660, total_quantity: 12 },
    { id: 2, name: 'Margherita Pizza', order_count: 8, total_revenue: 360, total_quantity: 8 },
    { id: 3, name: 'Cheeseburger', order_count: 6, total_revenue: 210, total_quantity: 6 },
    { id: 4, name: 'Ayran', order_count: 15, total_revenue: 225, total_quantity: 15 },
    { id: 5, name: 'Tiramisu', order_count: 4, total_revenue: 100, total_quantity: 4 },
  ];

  const weeklyTopProducts = [
    { id: 1, name: 'Adana Kebab', order_count: 45, total_revenue: 2475, total_quantity: 55 },
    { id: 2, name: 'Margherita Pizza', order_count: 38, total_revenue: 1710, total_quantity: 78 },
    { id: 3, name: 'Cheeseburger', order_count: 28, total_revenue: 980, total_quantity: 28 },
    { id: 4, name: 'Ayran', order_count: 52, total_revenue: 780, total_quantity: 52 },
    { id: 5, name: 'Tiramisu', order_count: 18, total_revenue: 450, total_quantity: 20},
  ];

  const monthlyTopProducts = [
    { id: 1, name: 'Adana Kebab', order_count: 156, total_revenue: 8580, total_quantity: 166 },
    { id: 2, name: 'Margherita Pizza', order_count: 134, total_revenue: 6030, total_quantity: 135 },
    { id: 3, name: 'Cheeseburger', order_count: 98, total_revenue: 3430, total_quantity: 99},
    { id: 4, name: 'Ayran', order_count: 87, total_revenue: 1305, total_quantity: 87 },
    { id: 5, name: 'Tiramisu', order_count: 76, total_revenue: 1900, total_quantity: 79 },
  ];

  // Dönem bazlı en az satılan ürünler mock verileri
  const [bottomProducts, setBottomProducts] = useState([]);

  const dailyBottomProducts = [
    { id: 11, name: 'Muhammara', order_count: 0, total_revenue: 0, total_quantity: 0 },  // Hiç satılmamış
    { id: 12, name: 'Baba Gannuş', order_count: 0, total_revenue: 0, total_quantity: 0 }, // Hiç satılmamış
    { id: 13, name: 'Humus', order_count: 1, total_revenue: 28, total_quantity: 3 },      // 1 adet
    { id: 14, name: 'Çoban Salata', order_count: 1, total_revenue: 45, total_quantity: 5 }, // 1 adet
    { id: 15, name: 'Mercimek Çorbası', order_count: 1, total_revenue: 60, total_quantity: 3 }, // 2 adet
  ];

  const weeklyBottomProducts = [
    { id: 11, name: 'Muhammara', order_count: 1, total_revenue: 28, total_quantity: 1 },  // 1 adet
    { id: 12, name: 'Baba Gannuş', order_count: 2, total_revenue: 56, total_quantity: 7 }, // 2 adet
    { id: 13, name: 'Humus', order_count: 3, total_revenue: 84, total_quantity: 7 },      // 3 adet
    { id: 14, name: 'Çoban Salata', order_count: 4, total_revenue: 180, total_quantity: 6 }, // 4 adet
    { id: 15, name: 'Mercimek Çorbası', order_count: 5, total_revenue: 150, total_quantity: 5 }, // 5 adet
  ];

  const monthlyBottomProducts = [
    { id: 11, name: 'Muhammara', order_count: 3, total_revenue: 84, total_quantity: 3 },  // 3 adet
    { id: 12, name: 'Baba Gannuş', order_count: 5, total_revenue: 140, total_quantity: 10 }, // 5 adet
    { id: 13, name: 'Humus', order_count: 8, total_revenue: 224, total_quantity: 8 },      // 8 adet
    { id: 14, name: 'Çoban Salata', order_count: 12, total_revenue: 540, total_quantity: 13 }, // 12 adet
    { id: 15, name: 'Mercimek Çorbası', order_count: 15, total_revenue: 450, total_quantity: 17 }, // 15 adet
  ];

  // Dönem bazlı kategori analizi mock verileri
  const [categoryStats, setCategoryStats] = useState([]);

  const dailyCategoryStats = [
    { id: 1, name: 'Ana Yemek', orders: 15, revenue: 750, color: '#dc2626' },
    { id: 2, name: 'İçecekler', orders: 8, revenue: 120, color: '#3b82f6' },
    { id: 3, name: 'Tatlı', orders: 5, revenue: 125, color: '#8b5cf6' },
    { id: 4, name: 'Meze', orders: 3, revenue: 84, color: '#10b981' },
    { id: 5, name: 'Salata', orders: 2, revenue: 90, color: '#f59e0b' },
    { id: 6, name: 'Çorba', orders: 1, revenue: 30, color: '#ef4444' },
  ];

  const weeklyCategoryStats = [
    { id: 1, name: 'Ana Yemek', orders: 105, revenue: 5250, color: '#dc2626' },
    { id: 2, name: 'İçecekler', orders: 58, revenue: 870, color: '#3b82f6' },
    { id: 3, name: 'Tatlı', orders: 35, revenue: 875, color: '#8b5cf6' },
    { id: 4, name: 'Meze', orders: 21, revenue: 588, color: '#10b981' },
    { id: 5, name: 'Salata', orders: 16, revenue: 720, color: '#f59e0b' },
    { id: 6, name: 'Çorba', orders: 11, revenue: 330, color: '#ef4444' },
  ];

  const monthlyCategoryStats = [
    { id: 1, name: 'Ana Yemek', orders: 423, revenue: 18940, color: '#dc2626' },
    { id: 2, name: 'İçecekler', orders: 234, revenue: 3510, color: '#3b82f6' },
    { id: 3, name: 'Tatlı', orders: 156, revenue: 3900, color: '#8b5cf6' },
    { id: 4, name: 'Meze', orders: 89, revenue: 2492, color: '#10b981' },
    { id: 5, name: 'Salata', orders: 67, revenue: 3015, color: '#f59e0b' },
    { id: 6, name: 'Çorba', orders: 45, revenue: 1350, color: '#ef4444' },
  ];

  const [salesTrends] = useState([
    { sale_date: '2025-01-20', total_orders: 45, total_revenue: 2250, total_customers: 12, avg_order_value: 50.00 },
    { sale_date: '2025-01-21', total_orders: 52, total_revenue: 2600, total_customers: 15, avg_order_value: 50.00 },
    { sale_date: '2025-01-22', total_orders: 48, total_revenue: 2400, total_customers: 13, avg_order_value: 50.00 },
    { sale_date: '2025-01-23', total_orders: 61, total_revenue: 3050, total_customers: 18, avg_order_value: 50.00 },
    { sale_date: '2025-01-24', total_orders: 78, total_revenue: 3900, total_customers: 22, avg_order_value: 50.00 },
    { sale_date: '2025-01-25', total_orders: 89, total_revenue: 4450, total_customers: 25, avg_order_value: 50.00 },
    { sale_date: '2025-01-26', total_orders: 67, total_revenue: 3350, total_customers: 20, avg_order_value: 50.00 },
  ]);

  const [weeklyTrends] = useState([
    { year: 2025, week: 1, total_orders: 234, total_revenue: 11700, total_customers: 65, avg_order_value: 50.00 },
    { year: 2025, week: 2, total_orders: 267, total_revenue: 13350, total_customers: 72, avg_order_value: 50.00 },
    { year: 2025, week: 3, total_orders: 289, total_revenue: 14450, total_customers: 78, avg_order_value: 50.00 },
    { year: 2025, week: 4, total_orders: 312, total_revenue: 15600, total_customers: 85, avg_order_value: 50.00 },
  ]);

  const [monthlyTrends] = useState([
    { year: 2025, month: 1, total_orders: 1234, total_revenue: 61700, total_customers: 350, avg_order_value: 50.00 },
    { year: 2025, month: 2, total_orders: 1456, total_revenue: 72800, total_customers: 410, avg_order_value: 50.00 },
    { year: 2025, month: 3, total_orders: 1678, total_revenue: 83900, total_customers: 470, avg_order_value: 50.00 },
    { year: 2025, month: 4, total_orders: 1890, total_revenue: 94500, total_customers: 530, avg_order_value: 50.00 },
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

  // Dönem değiştiğinde tüm verileri güncelle
  useEffect(() => {
    if (selectedPeriod === 'day') {
      setTopProducts(dailyTopProducts);
      setBottomProducts(dailyBottomProducts);
      setCategoryStats(dailyCategoryStats);
    } else if (selectedPeriod === 'week') {
      setTopProducts(weeklyTopProducts);
      setBottomProducts(weeklyBottomProducts);
      setCategoryStats(weeklyCategoryStats);
    } else if (selectedPeriod === 'month') {
      setTopProducts(monthlyTopProducts);
      setBottomProducts(monthlyBottomProducts);
      setCategoryStats(monthlyCategoryStats);
    }
  }, [selectedPeriod]);

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel rapor verilerini çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const periodOptions = [
    { key: 'day', label: 'Günlük' },
    { key: 'week', label: 'Haftalık' },
    { key: 'month', label: 'Aylık' },
  ];

  const reportOptions = [
    { key: 'topProducts', label: 'En Çok Satılan', icon: '📈' },
    { key: 'bottomProducts', label: 'En Az Satılan', icon: '📉' },
    { key: 'categories', label: 'Kategori Analizi', icon: '📊' },
    { key: 'trends', label: 'Satış Trendleri', icon: '📅' },
  ];

  const getTotalRevenue = () => {
    return categoryStats.reduce((sum, cat) => sum + cat.revenue, 0);
  };

  const getTotalOrders = () => {
    return categoryStats.reduce((sum, cat) => sum + cat.orders, 0);
  };

  const getAverageOrderValue = () => {
    const total = getTotalRevenue();
    const orders = getTotalOrders();
    return orders > 0 ? (total / orders).toFixed(2) : '0.00';
  };

  const renderTopProducts = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>En Çok Satılan Ürünler</Text>
      {topProducts.map((product, index) => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStats}>
              {product.order_count} sipariş • ₺{product.total_revenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.productGrowth}>
            <Text style={styles.growthText}>
              {product.total_quantity} adet
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBottomProducts = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>En Az Satılan Ürünler</Text>
      {bottomProducts.map((product, index) => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productRank}>
            <Text style={[styles.rankNumber, { color: '#dc2626' }]}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStats}>
              {product.order_count} sipariş • ₺{product.total_revenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.productGrowth}>
            <Text style={styles.growthText}>
              {product.total_quantity} adet
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCategoryAnalysis = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>Kategori Bazlı Satış Dağılımı</Text>
      
      {/* Özet İstatistikler */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₺{getTotalRevenue().toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Toplam Gelir</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{getTotalOrders()}</Text>
          <Text style={styles.summaryLabel}>Toplam Sipariş</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>₺{getAverageOrderValue()}</Text>
          <Text style={styles.summaryLabel}>Ort. Sipariş Değeri</Text>
        </View>
      </View>

        {/* Kategori Dağılımı */}
        {categoryStats.map((category) => {
          const totalRevenue = categoryStats.reduce((sum, cat) => sum + cat.revenue, 0);
          const percentage = totalRevenue > 0 ? ((category.revenue / totalRevenue) * 100).toFixed(1) : 0;
          
          return (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <Text style={styles.categoryPercentage}>{percentage}%</Text>
              </View>
              
              <View style={styles.categoryStats}>
                <Text style={styles.categoryStatText}>
                  {category.orders} sipariş • ₺{category.revenue.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: category.color 
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
    </View>
  );

  const renderTrends = () => {
    const trends = selectedPeriod === 'day' ? salesTrends : 
                   selectedPeriod === 'week' ? weeklyTrends : monthlyTrends;
    
    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>Satış Trendleri</Text>
        
        {/* Trend Grafik */}
        <View style={styles.trendChart}>
          <Text style={styles.chartTitle}>
            {selectedPeriod === 'day' ? 'Günlük' : 
             selectedPeriod === 'week' ? 'Haftalık' : 'Aylık'} Satış Trendi
          </Text>
          
           {trends.map((trend, index) => {
             const maxRevenue = Math.max(...trends.map(t => t.total_revenue));
             const barHeight = (trend.total_revenue / maxRevenue) * 100;
             
             // Günlük trendlerde tarih yerine gün adı göster
             let displayLabel = '';
             if (selectedPeriod === 'day') {
               const date = new Date(trend.sale_date);
               displayLabel = date.toLocaleDateString('tr-TR', { weekday: 'long' });
             } else if (selectedPeriod === 'week') {
               displayLabel = `${trend.week}. Hafta`;
             } else {
               const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
               displayLabel = monthNames[trend.month - 1];
             }
             
             return (
               <View key={index} style={styles.trendBar}>
                 <View style={styles.barContainer}>
                   <View 
                     style={[
                       styles.bar, 
                       { height: `${barHeight}%` }
                     ]} 
                   />
                 </View>
                 <Text style={styles.barLabel}>{displayLabel}</Text>
                 <Text style={styles.barValue}>₺{trend.total_revenue.toLocaleString()}</Text>
               </View>
             );
           })}
        </View>

         {/* Trend Detayları */}
         <View style={styles.trendDetails}>
           {trends.map((trend, index) => {
             let displayPeriod = '';
             if (selectedPeriod === 'day') {
               const date = new Date(trend.sale_date);
               displayPeriod = date.toLocaleDateString('tr-TR', { 
                 day: 'numeric', 
                 month: 'short',
                 weekday: 'long' 
               });
             } else if (selectedPeriod === 'week') {
               displayPeriod = `${trend.year} - ${trend.week}. Hafta`;
             } else {
               const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
               displayPeriod = `${trend.year} - ${monthNames[trend.month - 1]}`;
             }
             
             return (
               <View key={index} style={styles.trendItem}>
                 <Text style={styles.trendPeriod}>{displayPeriod}</Text>
                 <View style={styles.trendStats}>
                   <Text style={styles.trendOrders}>{trend.total_orders} sipariş</Text>
                   <Text style={styles.trendRevenue}>₺{trend.total_revenue.toLocaleString()}</Text>
                 </View>
               </View>
             );
           })}
         </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Menü Raporu</Text>
          <Text style={styles.headerSubtitle}>Menü performans analizi</Text>
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
        {/* Dönem Seçimi */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Dönem Seçimi</Text>
          <View style={styles.periodButtons}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === option.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(option.key)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === option.key && styles.periodButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rapor Seçimi */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Rapor Türü</Text>
          <View style={styles.reportGrid}>
            {reportOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.reportButton,
                  selectedReport === option.key && styles.reportButtonActive
                ]}
                onPress={() => setSelectedReport(option.key)}
              >
                <Text style={styles.reportIcon}>{option.icon}</Text>
                <Text style={[
                  styles.reportButtonText,
                  selectedReport === option.key && styles.reportButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rapor İçeriği */}
        {selectedReport === 'topProducts' && renderTopProducts()}
        {selectedReport === 'bottomProducts' && renderBottomProducts()}
        {selectedReport === 'categories' && renderCategoryAnalysis()}
        {selectedReport === 'trends' && renderTrends()}
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200,
  },
  periodSection: {
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
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#dc2626',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  reportSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  reportIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  reportButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  reportContent: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  productStats: {
    fontSize: 14,
    color: '#6b7280',
  },
  productGrowth: {
    alignItems: 'flex-end',
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  categoryStats: {
    marginBottom: 8,
  },
  categoryStatText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendChart: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  trendBar: {
    alignItems: 'center',
    marginBottom: 8,
  },
  barContainer: {
    height: 100,
    width: 30,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    backgroundColor: '#dc2626',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  trendDetails: {
    marginTop: 16,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  trendPeriod: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  trendStats: {
    alignItems: 'flex-end',
  },
  trendOrders: {
    fontSize: 12,
    color: '#6b7280',
  },
  trendRevenue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
});

export default MenuReportsScreen;
