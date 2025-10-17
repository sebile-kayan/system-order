/**
 * MENU REPORTS SCREEN - Menü Raporu Ekranı (Sadece Admin)
 * 
 * Bu ekran menü performansı hakkında detaylı raporlar sağlar:
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
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MenuReportsScreen = () => {
  const { user, hasRole } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState('topProducts');

  // Mock data - gerçek uygulamada API'den gelecek
  const [topProducts] = useState([
    { id: 1, name: 'Adana Kebab', orders: 156, revenue: 8580, growth: 12.5 },
    { id: 2, name: 'Margherita Pizza', orders: 134, revenue: 6030, growth: 8.3 },
    { id: 3, name: 'Cheeseburger', orders: 98, revenue: 3430, growth: -2.1 },
    { id: 4, name: 'Ayran', orders: 87, revenue: 1305, growth: 15.7 },
    { id: 5, name: 'Tiramisu', orders: 76, revenue: 1900, growth: 5.2 },
    { id: 6, name: 'Cola', orders: 65, revenue: 975, growth: -8.9 },
    { id: 7, name: 'Lahmacun', orders: 54, revenue: 1350, growth: 22.1 },
    { id: 8, name: 'Mantı', orders: 43, revenue: 2580, growth: 3.4 },
    { id: 9, name: 'Tavuk Şiş', orders: 38, revenue: 2850, growth: -5.6 },
    { id: 10, name: 'Baklava', orders: 32, revenue: 1280, growth: 18.9 },
  ]);

  const [bottomProducts] = useState([
    { id: 11, name: 'Muhammara', orders: 3, revenue: 84, growth: -25.0 },
    { id: 12, name: 'Baba Gannuş', orders: 5, revenue: 140, growth: -15.2 },
    { id: 13, name: 'Humus', orders: 8, revenue: 224, growth: -8.7 },
    { id: 14, name: 'Çoban Salata', orders: 12, revenue: 540, growth: 2.1 },
    { id: 15, name: 'Mercimek Çorbası', orders: 15, revenue: 450, growth: -12.3 },
  ]);

  const [categoryStats] = useState([
    { id: 1, name: 'Ana Yemek', orders: 423, revenue: 18940, percentage: 45.2, color: '#dc2626' },
    { id: 2, name: 'İçecekler', orders: 234, revenue: 3510, percentage: 8.4, color: '#3b82f6' },
    { id: 3, name: 'Tatlı', orders: 156, revenue: 3900, percentage: 9.3, color: '#8b5cf6' },
    { id: 4, name: 'Meze', orders: 89, revenue: 2492, percentage: 5.9, color: '#10b981' },
    { id: 5, name: 'Salata', orders: 67, revenue: 3015, percentage: 7.2, color: '#f59e0b' },
    { id: 6, name: 'Çorba', orders: 45, revenue: 1350, percentage: 3.2, color: '#ef4444' },
  ]);

  const [salesTrends] = useState([
    { period: 'Pazartesi', orders: 45, revenue: 2250 },
    { period: 'Salı', orders: 52, revenue: 2600 },
    { period: 'Çarşamba', orders: 48, revenue: 2400 },
    { period: 'Perşembe', orders: 61, revenue: 3050 },
    { period: 'Cuma', orders: 78, revenue: 3900 },
    { period: 'Cumartesi', orders: 89, revenue: 4450 },
    { period: 'Pazar', orders: 67, revenue: 3350 },
  ]);

  const [weeklyTrends] = useState([
    { week: '1. Hafta', orders: 234, revenue: 11700 },
    { week: '2. Hafta', orders: 267, revenue: 13350 },
    { week: '3. Hafta', orders: 289, revenue: 14450 },
    { week: '4. Hafta', orders: 312, revenue: 15600 },
  ]);

  const [monthlyTrends] = useState([
    { month: 'Ocak', orders: 1234, revenue: 61700 },
    { month: 'Şubat', orders: 1456, revenue: 72800 },
    { month: 'Mart', orders: 1678, revenue: 83900 },
    { month: 'Nisan', orders: 1890, revenue: 94500 },
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
      <Text style={styles.reportTitle}>En Çok Satılan Ürünler (TOP 10)</Text>
      {topProducts.map((product, index) => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productRank}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStats}>
              {product.orders} sipariş • ₺{product.revenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.productGrowth}>
            <Text style={[
              styles.growthText,
              { color: product.growth >= 0 ? '#10b981' : '#dc2626' }
            ]}>
              {product.growth >= 0 ? '+' : ''}{product.growth}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderBottomProducts = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>En Az Satılan Ürünler</Text>
      <Text style={styles.reportSubtitle}>Düşük performans gösteren ürünler</Text>
      {bottomProducts.map((product, index) => (
        <View key={product.id} style={styles.productItem}>
          <View style={styles.productRank}>
            <Text style={[styles.rankNumber, { color: '#dc2626' }]}>#{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStats}>
              {product.orders} sipariş • ₺{product.revenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.productGrowth}>
            <Text style={[
              styles.growthText,
              { color: product.growth >= 0 ? '#10b981' : '#dc2626' }
            ]}>
              {product.growth >= 0 ? '+' : ''}{product.growth}%
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
      {categoryStats.map((category) => (
        <View key={category.id} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
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
                  width: `${category.percentage}%`,
                  backgroundColor: category.color 
                }
              ]} 
            />
          </View>
        </View>
      ))}
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
            const maxRevenue = Math.max(...trends.map(t => t.revenue));
            const barHeight = (trend.revenue / maxRevenue) * 100;
            
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
                <Text style={styles.barLabel}>{trend.period || trend.week || trend.month}</Text>
                <Text style={styles.barValue}>₺{trend.revenue.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        {/* Trend Detayları */}
        <View style={styles.trendDetails}>
          {trends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <Text style={styles.trendPeriod}>{trend.period || trend.week || trend.month}</Text>
              <View style={styles.trendStats}>
                <Text style={styles.trendOrders}>{trend.orders} sipariş</Text>
                <Text style={styles.trendRevenue}>₺{trend.revenue.toLocaleString()}</Text>
              </View>
            </View>
          ))}
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
    width: (width - 64) / 2,
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
