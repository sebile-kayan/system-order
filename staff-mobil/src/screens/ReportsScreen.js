import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB, 
  DataTable,
  Chip,
  SegmentedButtons,
  Surface,
  Text
} from 'react-native-paper';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

// Mock data
const mockWeeklyData = [
  { date: '3 Eki', revenue: 3200, orders: 18 },
  { date: '6 Eki', revenue: 4500, orders: 25 },
  { date: '9 Eki', revenue: 3800, orders: 21 },
  { date: '12 Eki', revenue: 5200, orders: 28 },
  { date: '15 Eki', revenue: 4100, orders: 22 },
  { date: '18 Eki', revenue: 4800, orders: 26 },
  { date: '21 Eki', revenue: 3900, orders: 20 },
];

const mockRecentPayments = [
  { id: 1, amount: 285, method: 'Nakit', date: '09.10', table: 'Masa 3' },
  { id: 2, amount: 195, method: 'Kredi Kartı', date: '09.10', table: 'Masa 1' },
  { id: 3, amount: 420, method: 'Nakit', date: '09.10', table: 'Masa 5' },
  { id: 4, amount: 350, method: 'Kredi Kartı', date: '09.10', table: 'Masa 2' },
  { id: 5, amount: 180, method: 'Nakit', date: '09.10', table: 'Masa 4' },
];

const mockTopSellingItems = [
  { name: 'Adana Kebap', count: 23, revenue: 1955 },
  { name: 'Izgara Köfte', count: 18, revenue: 1350 },
  { name: 'Lahmacun', count: 15, revenue: 525 },
  { name: 'Mercimek Çorbası', count: 12, revenue: 300 },
  { name: 'Çoban Salatası', count: 10, revenue: 300 },
];

const mockEmployeeStats = [
  { name: 'Ahmet Yılmaz', orders: 45, revenue: 3200 },
  { name: 'Ayşe Kaya', orders: 38, revenue: 2800 },
  { name: 'Mehmet Demir', orders: 42, revenue: 3100 },
];

export default function ReportsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reports, setReports] = useState({
    weeklyData: mockWeeklyData,
    recentPayments: mockRecentPayments,
    topSellingItems: mockTopSellingItems,
    employeeStats: mockEmployeeStats
  });

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    setRefreshing(true);
    try {
      // Gerçek API çağrısı
      // const response = await api.getReports(selectedPeriod);
      // setReports(response.data);
      
      // Mock data kullan
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Rapor verileri yüklenirken hata:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadReports();
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#1e3a8a',
    },
  };

  const barChartData = {
    labels: reports.weeklyData.map(item => item.date),
    datasets: [
      {
        data: reports.weeklyData.map(item => item.revenue),
        color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData = [
    {
      name: 'Nakit',
      population: reports.recentPayments.filter(p => p.method === 'Nakit').length,
      color: '#10b981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Kredi Kartı',
      population: reports.recentPayments.filter(p => p.method === 'Kredi Kartı').length,
      color: '#3b82f6',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const getTotalRevenue = () => {
    return reports.weeklyData.reduce((sum, item) => sum + item.revenue, 0);
  };

  const getTotalOrders = () => {
    return reports.weeklyData.reduce((sum, item) => sum + item.orders, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
          <Appbar.Content title="Raporlar" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <Paragraph style={styles.headerSubtitle}>Detaylı satış ve performans raporları</Paragraph>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              { value: 'day', label: 'Günlük' },
              { value: 'week', label: 'Haftalık' },
              { value: 'month', label: 'Aylık' },
              { value: 'year', label: 'Yıllık' },
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
          {/* Summary Cards */}
          <View style={styles.summaryCards}>
            <Card style={styles.summaryCard}>
              <Card.Content style={styles.summaryCardContent}>
                <Title style={styles.summaryTitle}>Toplam Ciro</Title>
                <Title style={styles.summaryValue}>₺{getTotalRevenue().toLocaleString()}</Title>
                <Paragraph style={styles.summarySubtext}>
                  {selectedPeriod === 'week' ? 'Bu hafta' : 
                   selectedPeriod === 'month' ? 'Bu ay' : 
                   selectedPeriod === 'year' ? 'Bu yıl' : 'Bugün'}
                </Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.summaryCard}>
              <Card.Content style={styles.summaryCardContent}>
                <Title style={styles.summaryTitle}>Toplam Sipariş</Title>
                <Title style={styles.summaryValue}>{getTotalOrders()}</Title>
                <Paragraph style={styles.summarySubtext}>
                  Ortalama: ₺{getAverageOrderValue()}
                </Paragraph>
              </Card.Content>
            </Card>
          </View>

          {/* Weekly Revenue Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Haftalık Ciro Trendi</Title>
              <View style={styles.chartContainer}>
                <BarChart
                  data={barChartData}
                  width={width - 80}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars={true}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Payment Methods Chart */}
          <Card style={styles.chartCard}>
            <Card.Content>
              <Title style={styles.chartTitle}>Ödeme Yöntemleri</Title>
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  width={width - 80}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Top Selling Items */}
          <Card style={styles.tableCard}>
            <Card.Content>
              <Title style={styles.tableTitle}>En Çok Satan Ürünler</Title>
              {reports.topSellingItems.map((item, index) => (
                <Card key={index} style={styles.topItemCard}>
                  <Card.Content style={styles.topItemContent}>
                    <View style={styles.topItemHeader}>
                      <Surface style={styles.rankBadge}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                      </Surface>
                      <View style={styles.topItemInfo}>
                        <Title style={styles.topItemName}>{item.name}</Title>
                        <Paragraph style={styles.topItemSubtext}>
                          {item.count} adet satıldı
                        </Paragraph>
                      </View>
                    </View>
                    <View style={styles.topItemStats}>
                      <Title style={styles.topItemRevenue}>₺{item.revenue}</Title>
                      <Paragraph style={styles.topItemRevenueLabel}>Toplam Ciro</Paragraph>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>

          {/* Recent Payments */}
          <Card style={styles.tableCard}>
            <Card.Content>
              <Title style={styles.tableTitle}>Son Ödemeler</Title>
              {reports.recentPayments.map((payment) => (
                <Card key={payment.id} style={styles.paymentCard}>
                  <Card.Content style={styles.paymentContent}>
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentInfo}>
                        <Title style={styles.paymentId}>Sipariş #{payment.id}</Title>
                        <Paragraph style={styles.paymentTable}>Masa: {payment.table}</Paragraph>
                      </View>
                      <View style={styles.paymentAmount}>
                        <Title style={styles.paymentAmountText}>₺{payment.amount}</Title>
                      </View>
                    </View>
                    <View style={styles.paymentFooter}>
                      <Chip 
                        mode="outlined" 
                        compact
                        style={styles.paymentChip}
                      >
                        {payment.method}
                      </Chip>
                      <Paragraph style={styles.paymentDate}>{payment.date}</Paragraph>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>

          {/* Employee Performance */}
          <Card style={styles.tableCard}>
            <Card.Content>
              <Title style={styles.tableTitle}>Çalışan Performansı</Title>
              {reports.employeeStats.map((employee, index) => (
                <Card key={index} style={styles.employeeCard}>
                  <Card.Content style={styles.employeeContent}>
                    <View style={styles.employeeHeader}>
                      <Avatar.Text 
                        size={40} 
                        label={employee.name.charAt(0)} 
                        style={styles.employeeAvatar}
                      />
                      <View style={styles.employeeInfo}>
                        <Title style={styles.employeeName}>{employee.name}</Title>
                        <Paragraph style={styles.employeeSubtext}>
                          {employee.orders} sipariş işledi
                        </Paragraph>
                      </View>
                    </View>
                    <View style={styles.employeeStats}>
                      <Title style={styles.employeeRevenue}>₺{employee.revenue}</Title>
                      <Paragraph style={styles.employeeRevenueLabel}>Toplam Ciro</Paragraph>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>
        </ScrollView>
      </View>

      {/* Export FAB */}
      <FAB
        icon="download"
        label="Raporu İndir"
        style={styles.exportFab}
        onPress={() => {
          // PDF export functionality
          console.log('Rapor indiriliyor...');
        }}
      />
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
  periodContainer: {
    paddingVertical: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    elevation: 2,
  },
  summaryCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  tableCard: {
    marginBottom: 20,
    elevation: 2,
    borderRadius: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  topItemCard: {
    elevation: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  topItemContent: {
    padding: 12,
  },
  topItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  topItemSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  topItemStats: {
    alignItems: 'flex-end',
  },
  topItemRevenue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  topItemRevenueLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  paymentCard: {
    elevation: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  paymentContent: {
    padding: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  paymentTable: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentChip: {
    backgroundColor: '#f3f4f6',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  employeeCard: {
    elevation: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  employeeContent: {
    padding: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  employeeAvatar: {
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  employeeSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  employeeStats: {
    alignItems: 'flex-end',
  },
  employeeRevenue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  employeeRevenueLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  exportFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#059669',
  },
});
