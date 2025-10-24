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
  StyleSheet,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { user, hasRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReport, setSelectedReport] = useState('sales');

  // Admin kontrolü
  if (!hasRole('admin')) {
    return (
      <View style={styles.container}>
        <View style={styles.safeArea}>
          <Card style={[styles.accessDenied, { paddingTop: 50 }]}>
            <Text style={styles.accessDeniedIcon}>📊</Text>
            <Text style={styles.accessDeniedTitle}>Erişim Reddedildi</Text>
            <Text style={styles.accessDeniedText}>
              Bu sayfaya erişim için admin yetkisi gereklidir.
            </Text>
          </Card>
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
        <Text style={styles.headerTitle}>Raporlar</Text>
        <Text style={styles.headerSubtitle}>İşletme performans analizi</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Zaman Periyodu Seçimi */}
        <Card style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Zaman Periyodu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodsContainer}>
            {periods.map((period) => (
              <Button
                key={period.key}
                title={period.label}
                variant={selectedPeriod === period.key ? 'primary' : 'outline'}
                size="small"
                onPress={() => setSelectedPeriod(period.key)}
                style={styles.periodButton}
              />
            ))}
          </ScrollView>
        </Card>

        {/* Rapor Türü Seçimi */}
        <Card style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Rapor Türü</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reportsContainer}>
            {reports.map((report) => (
              <Button
                key={report.key}
                title={report.label}
                variant={selectedReport === report.key ? 'primary' : 'outline'}
                size="small"
                onPress={() => setSelectedReport(report.key)}
                style={styles.reportButton}
              />
            ))}
          </ScrollView>
        </Card>

        {/* Rapor İçeriği */}
        <Card style={styles.contentSection}>
          {renderReportContent()}
        </Card>

        {/* Hızlı İşlemler */}
        <Card style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Rapor İşlemleri</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="📤 PDF İndir"
              variant="outline"
              size="small"
              style={styles.actionCard}
            />
            <Button
              title="📧 E-posta Gönder"
              variant="outline"
              size="small"
              style={styles.actionCard}
            />
            <Button
              title="📊 Detaylı Analiz"
              variant="outline"
              size="small"
              style={styles.actionCard}
            />
            <Button
              title="⚙️ Rapor Ayarları"
              variant="outline"
              size="small"
              style={styles.actionCard}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
    height: '100%', // Web için height ekle
  },
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
    flexGrow: 1, // Web için flexGrow ekle
  },
  periodSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  periodsContainer: {
    marginBottom: Spacing.sm,
  },
  periodButton: {
    marginRight: Spacing.md,
  },
  reportSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  reportsContainer: {
    marginBottom: Spacing.sm,
  },
  reportButton: {
    marginRight: Spacing.md,
  },
  contentSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  reportContent: {
    backgroundColor: Colors.gray50,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.screenPadding,
  },
  reportTitle: {
    ...Typography.styles.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.screenPadding,
    textAlign: 'center',
  },
  salesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.screenPadding,
  },
  salesCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  salesNumber: {
    ...Typography.styles.h4,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  salesLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  progressSection: {
    marginTop: Spacing.screenPadding,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Spacing.radius.sm,
    marginVertical: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: Spacing.radius.sm,
  },
  progressText: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success,
    textAlign: 'center',
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  popularRank: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
    marginRight: Spacing.md,
    width: 30,
  },
  popularName: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  popularStats: {
    alignItems: 'flex-end',
  },
  popularSales: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  popularRevenue: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  hourlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hourlyTime: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
  },
  hourlyStats: {
    alignItems: 'flex-end',
  },
  hourlyOrders: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  hourlyRevenue: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  customerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  customerCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  customerNumber: {
    ...Typography.styles.h4,
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  customerLabel: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  actionsSection: {
    padding: Spacing.screenPadding,
    marginTop: Spacing.sm,
    marginBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: Spacing.md,
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

export default ReportsScreen;
