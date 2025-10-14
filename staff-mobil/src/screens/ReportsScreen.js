/**
 * REPORTS SCREEN - Raporlar Ekranı (Sadece Admin)
 * 
 * Bu ekran sadece admin rolündeki kullanıcılar için raporlama sağlar.
 * Günlük, haftalık, yıllık satış raporları, gelir analizleri ve işletme performans metrikleri içerir.
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

const ReportsScreen = () => {
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReport, setSelectedReport] = useState('sales');

  // Admin kontrolü
  if (!hasRole('admin')) {
    return (
      <View style={styles.container}>
        <View style={styles.safeArea}>
          <View style={[styles.accessDenied, { paddingTop: 50 }]}>
            <Text style={styles.accessDeniedIcon}>📊</Text>
            <Text style={styles.accessDeniedTitle}>Erişim Reddedildi</Text>
            <Text style={styles.accessDeniedText}>
              Bu sayfaya erişim için admin yetkisi gereklidir.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Mock veriler
  const [reportData, setReportData] = useState({
    today: {
      sales: {
        totalRevenue: 2850.50,
        totalOrders: 45,
        averageOrderValue: 63.34,
        completedOrders: 42,
        pendingOrders: 3,
      },
      popular: [
        { name: 'Adana Kebab', sales: 15, revenue: 825.00 },
        { name: 'Margherita Pizza', sales: 12, revenue: 540.00 },
        { name: 'Cheeseburger', sales: 10, revenue: 350.00 },
        { name: 'Ayran', sales: 25, revenue: 375.00 },
        { name: 'Cola', sales: 18, revenue: 270.00 },
      ],
      hourly: [
        { hour: '12:00', orders: 8, revenue: 485.50 },
        { hour: '13:00', orders: 15, revenue: 925.00 },
        { hour: '14:00', orders: 12, revenue: 720.00 },
        { hour: '15:00', orders: 10, revenue: 720.00 },
      ],
    },
    weekly: {
      sales: {
        totalRevenue: 18950.75,
        totalOrders: 285,
        averageOrderValue: 66.49,
        completedOrders: 275,
        pendingOrders: 10,
      },
    },
    monthly: {
      sales: {
        totalRevenue: 78500.25,
        totalOrders: 1150,
        averageOrderValue: 68.26,
        completedOrders: 1120,
        pendingOrders: 30,
      },
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel rapor verilerini çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const periods = [
    { key: 'today', label: 'Bugün' },
    { key: 'week', label: 'Bu Hafta' },
    { key: 'month', label: 'Bu Ay' },
    { key: 'year', label: 'Bu Yıl' },
  ];

  const reports = [
    { key: 'sales', label: 'Satış Raporu' },
    { key: 'popular', label: 'Popüler Ürünler' },
    { key: 'hourly', label: 'Saatlik Analiz' },
    { key: 'customers', label: 'Müşteri Analizi' },
  ];

  const currentData = reportData[selectedPeriod] || reportData.today;

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return 'Bugün';
      case 'week': return 'Bu Hafta';
      case 'month': return 'Bu Ay';
      case 'year': return 'Bu Yıl';
      default: return 'Bugün';
    }
  };

  const renderSalesReport = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>Satış Özeti - {getPeriodLabel()}</Text>
      
      <View style={styles.salesGrid}>
        <View style={styles.salesCard}>
          <Text style={styles.salesNumber}>₺{currentData.sales.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.salesLabel}>Toplam Ciro</Text>
        </View>
        <View style={styles.salesCard}>
          <Text style={styles.salesNumber}>{currentData.sales.totalOrders}</Text>
          <Text style={styles.salesLabel}>Toplam Sipariş</Text>
        </View>
        <View style={styles.salesCard}>
          <Text style={styles.salesNumber}>₺{currentData.sales.averageOrderValue.toFixed(2)}</Text>
          <Text style={styles.salesLabel}>Ortalama Tutar</Text>
        </View>
        <View style={styles.salesCard}>
          <Text style={styles.salesNumber}>{currentData.sales.completedOrders}</Text>
          <Text style={styles.salesLabel}>Tamamlanan</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Tamamlanma Oranı</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentData.sales.completedOrders / currentData.sales.totalOrders) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          %{((currentData.sales.completedOrders / currentData.sales.totalOrders) * 100).toFixed(1)}
        </Text>
      </View>
    </View>
  );

  const renderPopularReport = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>En Popüler Ürünler - {getPeriodLabel()}</Text>
      
      {currentData.popular?.map((item, index) => (
        <View key={index} style={styles.popularItem}>
          <View style={styles.popularInfo}>
            <Text style={styles.popularRank}>#{index + 1}</Text>
            <Text style={styles.popularName}>{item.name}</Text>
          </View>
          <View style={styles.popularStats}>
            <Text style={styles.popularSales}>{item.sales} adet</Text>
            <Text style={styles.popularRevenue}>₺{item.revenue.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHourlyReport = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>Saatlik Analiz - {getPeriodLabel()}</Text>
      
      {currentData.hourly?.map((hour, index) => (
        <View key={index} style={styles.hourlyItem}>
          <Text style={styles.hourlyTime}>{hour.hour}</Text>
          <View style={styles.hourlyStats}>
            <Text style={styles.hourlyOrders}>{hour.orders} sipariş</Text>
            <Text style={styles.hourlyRevenue}>₺{hour.revenue.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCustomersReport = () => (
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>Müşteri Analizi - {getPeriodLabel()}</Text>
      
      <View style={styles.customerStats}>
        <View style={styles.customerCard}>
          <Text style={styles.customerNumber}>285</Text>
          <Text style={styles.customerLabel}>Toplam Müşteri</Text>
        </View>
        <View style={styles.customerCard}>
          <Text style={styles.customerNumber}>2.3</Text>
          <Text style={styles.customerLabel}>Ort. Müşteri/Masa</Text>
        </View>
        <View style={styles.customerCard}>
          <Text style={styles.customerNumber}>45 dk</Text>
          <Text style={styles.customerLabel}>Ort. Kalma Süresi</Text>
        </View>
        <View style={styles.customerCard}>
          <Text style={styles.customerNumber}>4.2</Text>
          <Text style={styles.customerLabel}>Ort. Puan</Text>
        </View>
      </View>
    </View>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'sales': return renderSalesReport();
      case 'popular': return renderPopularReport();
      case 'hourly': return renderHourlyReport();
      case 'customers': return renderCustomersReport();
      default: return renderSalesReport();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Raporlar</Text>
          <Text style={styles.headerSubtitle}>İşletme performans analizi</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Zaman Periyodu Seçimi */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Zaman Periyodu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodsContainer}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rapor Türü Seçimi */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Rapor Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reportsContainer}>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.key}
                style={[
                  styles.reportButton,
                  selectedReport === report.key && styles.reportButtonActive
                ]}
                onPress={() => setSelectedReport(report.key)}
              >
                <Text style={[
                  styles.reportButtonText,
                  selectedReport === report.key && styles.reportButtonTextActive
                ]}>
                  {report.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Rapor İçeriği */}
        <View style={styles.contentSection}>
          {renderReportContent()}
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Rapor İşlemleri</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionTitle}>PDF İndir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={styles.actionTitle}>E-posta Gönder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Detaylı Analiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Rapor Ayarları</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
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
  periodsContainer: {
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
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
  },
  reportSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  reportsContainer: {
    marginBottom: 8,
  },
  reportButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  reportButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  reportButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  reportButtonTextActive: {
    color: '#ffffff',
  },
  contentSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  reportContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  salesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  salesCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  salesNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  popularInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  popularRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginRight: 12,
    width: 30,
  },
  popularName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  popularStats: {
    alignItems: 'flex-end',
  },
  popularSales: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  popularRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  hourlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  hourlyTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  hourlyStats: {
    alignItems: 'flex-end',
  },
  hourlyOrders: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  hourlyRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  customerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  customerCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  customerNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  customerLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 40,
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
});

export default ReportsScreen;
