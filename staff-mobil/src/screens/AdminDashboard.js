import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Button, 
  Surface, 
  Avatar, 
  FAB,
  Card,
  Chip,
  DataTable,
  IconButton,
  Appbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isMobile = width < 992;

// Mock data
const mockStats = {
  todayRevenue: 900,
  avgOrderValue: 180,
  totalOrders: 5,
  topSelling: 'Adana Kebap',
  topSellingCount: 23,
  activeTables: 3,
  totalTables: 12,
  occupancyRate: 25
};

const mockWeeklyData = [
  { date: '3 Eki', revenue: 3200, orders: 18 },
  { date: '6 Eki', revenue: 4500, orders: 25 },
  { date: '9 Eki', revenue: 3800, orders: 21 },
];

const mockRecentPayments = [
  { id: 1, amount: 285, method: 'Nakit', date: '09.10' },
  { id: 2, amount: 195, method: 'Kredi Kartı', date: '09.10' },
  { id: 3, amount: 420, method: 'Nakit', date: '09.10' },
];

const navigationItems = [
  { id: 'dashboard', icon: 'view-dashboard', label: 'Dashboard', active: true },
  { id: 'employees', icon: 'account-group', label: 'Çalışanlar', active: false },
  { id: 'menu', icon: 'food', label: 'Menü Yönetimi', active: false },
  { id: 'tables', icon: 'table-furniture', label: 'Masalar', active: false },
  { id: 'reports', icon: 'chart-line', label: 'Raporlar', active: false },
  { id: 'settings', icon: 'cog', label: 'Ayarlar', active: false },
];

export default function AdminDashboard() {
  const { user, availableRoles, switchRole, logout, currentRole } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Gerçek API çağrıları burada yapılacak
      // const response = await api.getDashboardStats();
      // setStats(response.data);
    } catch (error) {
      console.error('Dashboard data load error:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);

    // Gerçek navigasyon
    switch (tabId) {
      case 'tables':
        navigation.navigate('TableManagement');
        break;
      case 'employees':
        navigation.navigate('EmployeeManagement');
        break;
      case 'menu':
        navigation.navigate('MenuManagement');
        break;
      case 'reports':
        navigation.navigate('Reports');
        break;
      case 'settings':
        // Settings ekranı eklenecek
        alert('Ayarlar ekranı yakında eklenecek!');
        break;
      default:
        setActiveTab('dashboard');
    }
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
  };

  const renderDashboard = () => (
    <ScrollView 
      showsVerticalScrollIndicator={true}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={styles.statHeader}>
              <Paragraph style={styles.statTitle}>Bugünkü Ciro</Paragraph>
              <IconButton icon="currency-usd" size={20} />
          </View>
            <Title style={styles.statValue}>₺{stats.todayRevenue}</Title>
            <View style={styles.statTrend}>
              <IconButton icon="trending-up" size={16} iconColor="#4caf50" />
              <Paragraph style={styles.trendText}>+12% geçen haftaya göre</Paragraph>
        </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={styles.statHeader}>
              <Paragraph style={styles.statTitle}>Ort. Sipariş Tutarı</Paragraph>
              <IconButton icon="shopping" size={20} />
          </View>
            <Title style={styles.statValue}>₺{stats.avgOrderValue}</Title>
            <Paragraph style={styles.statSubtext}>{stats.totalOrders} sipariş</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={styles.statHeader}>
              <Paragraph style={styles.statTitle}>En Çok Satan</Paragraph>
              <IconButton icon="food" size={20} />
            </View>
            <Title style={styles.statValue}>{stats.topSelling}</Title>
            <Paragraph style={styles.statSubtext}>{stats.topSellingCount} adet satıldı</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={styles.statHeader}>
              <Paragraph style={styles.statTitle}>Aktif Masalar</Paragraph>
              <IconButton icon="table-furniture" size={20} />
            </View>
            <Title style={styles.statValue}>{stats.activeTables}/{stats.totalTables}</Title>
            <Paragraph style={styles.statSubtext}>Doluluk oranı: %{stats.occupancyRate}</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Weekly Summary Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Haftalık Özet</Title>
          <View style={styles.chartContainer}>
            {/* Mock chart - gerçek chart library kullanılacak */}
            <View style={styles.mockChart}>
              {mockWeeklyData.map((item, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={[styles.bar, { height: (item.revenue / 5000) * 100 }]} />
                  <Paragraph style={styles.chartLabel}>{item.date}</Paragraph>
                </View>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Payments */}
      <Card style={styles.tableCard}>
        <Card.Content>
          <Title style={styles.tableTitle}>Son Ödemeler</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Sipariş ID</DataTable.Title>
              <DataTable.Title>Tutar</DataTable.Title>
              <DataTable.Title>Ödeme Yöntemi</DataTable.Title>
              <DataTable.Title>Tarih</DataTable.Title>
            </DataTable.Header>

            {mockRecentPayments.map((payment) => (
              <DataTable.Row key={payment.id}>
                <DataTable.Cell>{payment.id}</DataTable.Cell>
                <DataTable.Cell>₺{payment.amount}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip 
                    mode="outlined" 
                    compact
                    style={styles.paymentChip}
                  >
                    {payment.method}
                  </Chip>
                </DataTable.Cell>
                <DataTable.Cell>{payment.date}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderEmployees = () => (
    <ScrollView style={styles.contentArea}>
      <View style={styles.pageHeader}>
        <Title style={styles.pageTitle}>Çalışanlar</Title>
        <Paragraph style={styles.pageSubtitle}>Personel yönetimi</Paragraph>
        <Button 
          mode="contained" 
          style={styles.addButton}
          icon="plus"
        >
          Yeni Çalışan
        </Button>
      </View>
      
      <Card style={styles.tableCard}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Ad Soyad</DataTable.Title>
            <DataTable.Title>E-posta</DataTable.Title>
            <DataTable.Title>Roller</DataTable.Title>
            <DataTable.Title>Durum</DataTable.Title>
          </DataTable.Header>

          <DataTable.Row>
            <DataTable.Cell>
              <View style={styles.employeeCell}>
                <Avatar.Text size={32} label="A" />
                <Paragraph style={styles.employeeName}>Ahmet Yılmaz</Paragraph>
              </View>
            </DataTable.Cell>
            <DataTable.Cell>ahmet@restaurant.com</DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact>Garson</Chip>
            </DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact style={styles.activeChip}>Aktif</Chip>
            </DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>
              <View style={styles.employeeCell}>
                <Avatar.Text size={32} label="A" />
                <Paragraph style={styles.employeeName}>Ayşe Kaya</Paragraph>
              </View>
            </DataTable.Cell>
            <DataTable.Cell>ayse@restaurant.com</DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact>Şef</Chip>
            </DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact style={styles.activeChip}>Aktif</Chip>
            </DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>
              <View style={styles.employeeCell}>
                <Avatar.Text size={32} label="M" />
                <Paragraph style={styles.employeeName}>Mehmet Demir</Paragraph>
                      </View>
            </DataTable.Cell>
            <DataTable.Cell>mehmet@restaurant.com</DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact>Kasiyer</Chip>
            </DataTable.Cell>
            <DataTable.Cell>
              <Chip mode="outlined" compact style={styles.activeChip}>Aktif</Chip>
            </DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </Card>
    </ScrollView>
  );

  const renderMenu = () => (
    <ScrollView style={styles.contentArea}>
      <View style={styles.pageHeader}>
        <Title style={styles.pageTitle}>Menü Yönetimi</Title>
        <Paragraph style={styles.pageSubtitle}>Ürünleri düzenle ve yönet</Paragraph>
                      <Button
                        mode="contained"
          style={styles.addButton}
          icon="plus"
                      >
          Yeni Ürün
                      </Button>
                    </View>

      {/* Categories */}
      <Card style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.categoryTitle}>Çorbalar</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Ürün Adı</DataTable.Title>
              <DataTable.Title>Açıklama</DataTable.Title>
              <DataTable.Title>Fiyat</DataTable.Title>
              <DataTable.Title>İşlemler</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Mercimek Çorbası</DataTable.Cell>
              <DataTable.Cell>Geleneksel mercimek</DataTable.Cell>
              <DataTable.Cell>₺25</DataTable.Cell>
              <DataTable.Cell>
                <IconButton icon="pencil" size={20} />
                <IconButton icon="delete" size={20} />
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.categoryCard}>
        <Card.Content>
          <Title style={styles.categoryTitle}>Ana Yemekler</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Ürün Adı</DataTable.Title>
              <DataTable.Title>Açıklama</DataTable.Title>
              <DataTable.Title>Fiyat</DataTable.Title>
              <DataTable.Title>İşlemler</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>Adana Kebap</DataTable.Cell>
              <DataTable.Cell>Baharatlı kıyma kebap</DataTable.Cell>
              <DataTable.Cell>₺85</DataTable.Cell>
              <DataTable.Cell>
                <IconButton icon="pencil" size={20} />
                <IconButton icon="delete" size={20} />
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Izgara Köfte</DataTable.Cell>
              <DataTable.Cell>El yapımı ızgara köfte</DataTable.Cell>
              <DataTable.Cell>₺75</DataTable.Cell>
              <DataTable.Cell>
                <IconButton icon="pencil" size={20} />
                <IconButton icon="delete" size={20} />
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'employees':
        return renderEmployees();
      case 'menu':
        return renderMenu();
      default:
        return renderDashboard();
    }
  };

  const renderSidebar = () => (
    <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
      <View style={styles.sidebarHeader}>
        <Title style={styles.sidebarTitle}>Restaurant Admin</Title>
        {!isMobile && (
          <IconButton 
            icon={sidebarCollapsed ? "chevron-right" : "chevron-left"}
            size={20}
            iconColor="white"
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
      </View>

      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            mode={item.active ? "contained" : "text"}
            onPress={() => {
              handleNavigation(item.id);
              if (isMobile) setSidebarVisible(false);
            }}
            style={[
              styles.navButton,
              item.active && styles.activeNavButton
            ]}
            labelStyle={[
              styles.navButtonLabel,
              item.active && styles.activeNavButtonLabel
            ]}
            icon={item.icon}
            contentStyle={styles.navButtonContent}
          >
            {(!sidebarCollapsed || isMobile) && item.label}
          </Button>
              ))}
            </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <Avatar.Text 
          size={40} 
          label={user?.full_name?.charAt(0) || 'A'} 
          style={styles.userAvatar}
        />
        {(!sidebarCollapsed || isMobile) && (
          <View style={styles.userInfo}>
            <Paragraph style={styles.userName}>{user?.full_name}</Paragraph>
            <Paragraph style={styles.userRole}>Admin</Paragraph>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Mobile Header */}
      {isMobile && (
        <Appbar.Header style={styles.mobileHeader}>
          <Appbar.Action 
            icon="menu" 
            onPress={() => setSidebarVisible(true)}
            color="white"
          />
          <Appbar.Content 
            title="Restaurant Admin" 
            titleStyle={styles.mobileHeaderTitle}
          />
        </Appbar.Header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && renderSidebar()}

      {/* Mobile Sidebar Modal */}
      {isMobile && (
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSidebarVisible(false)}
            />
            <View style={styles.mobileSidebar}>
              <View style={styles.mobileSidebarHeader}>
                <Title style={styles.sidebarTitle}>Menü</Title>
                <IconButton 
                  icon="close"
                  size={24}
                  iconColor="white"
                  onPress={handleSidebarClose}
                />
              </View>
              <View style={styles.navigation}>
                {navigationItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      handleNavigation(item.id);
                      setSidebarVisible(false);
                    }}
                    style={[
                      styles.mobileNavItem,
                      item.active && styles.mobileActiveNavItem
                    ]}
                  >
                    <IconButton 
                      icon={item.icon} 
                      size={20} 
                      iconColor="white" 
                      style={styles.mobileNavIcon}
                    />
                    <Paragraph style={[
                      styles.mobileNavLabel,
                      item.active && styles.mobileActiveNavLabel
                    ]}>
                      {item.label}
                    </Paragraph>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.mobileUserSection}>
                <View style={styles.mobileUserDivider} />
                <View style={styles.mobileUserInfo}>
                  <Avatar.Text 
                    size={40} 
                    label={user?.full_name?.charAt(0) || 'A'} 
                    style={styles.userAvatar}
                  />
                  <View style={styles.mobileUserDetails}>
                    <Paragraph style={styles.mobileUserName}>{user?.full_name}</Paragraph>
                    <Paragraph style={styles.mobileUserRole}>Admin</Paragraph>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Main Content */}
      <View style={[styles.mainContent, isMobile && styles.mobileMainContent]}>
        {renderContent()}
      </View>

      {/* Floating Action Buttons */}
      <FAB
        icon="refresh"
        style={styles.refreshFab}
        onPress={onRefresh}
        loading={refreshing}
      />
      <FAB
        icon="logout"
        style={styles.logoutFab}
        onPress={logout}
        label="Çıkış"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  mobileHeader: {
    backgroundColor: '#1e3a8a',
    elevation: 4,
  },
  mobileHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#1e3a8a',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sidebarCollapsed: {
    width: 80,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  mobileSidebar: {
    width: '80%',
    backgroundColor: '#1e3a8a',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
  },
  mobileSidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  mobileActiveNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  mobileNavIcon: {
    marginRight: 16,
  },
  mobileNavLabel: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
  },
  mobileActiveNavLabel: {
    fontWeight: 'bold',
  },
  mobileUserSection: {
    marginTop: 'auto',
    paddingTop: 30,
  },
  mobileUserDivider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 24,
    borderRadius: 1,
  },
  mobileUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  mobileUserDetails: {
    marginLeft: 12,
    flex: 1,
  },
  mobileUserName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  mobileUserRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '400',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  navigation: {
    flex: 1,
  },
  navButton: {
    marginVertical: 4,
    justifyContent: 'flex-start',
  },
  activeNavButton: {
    backgroundColor: '#3b82f6',
  },
  navButtonLabel: {
    color: 'white',
    fontSize: 14,
  },
  activeNavButtonLabel: {
    color: 'white',
  },
  navButtonContent: {
    justifyContent: 'flex-start',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  userAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mobileMainContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  addButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 20,
    elevation: 3,
    borderRadius: 12,
  },
  statCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 11,
    color: '#4caf50',
    marginLeft: 4,
  },
  chartCard: {
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    height: 200,
  },
  mockChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    alignItems: 'center',
  },
  bar: {
    width: 30,
    backgroundColor: '#3b82f6',
    marginBottom: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tableCard: {
    marginBottom: 20,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentChip: {
    backgroundColor: '#f3f4f6',
  },
  categoryCard: {
    marginBottom: 20,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  employeeCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeName: {
    marginLeft: 12,
    fontSize: 14,
  },
  activeChip: {
    backgroundColor: '#dcfce7',
  },
  refreshFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#3b82f6',
  },
  logoutFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
  },
});