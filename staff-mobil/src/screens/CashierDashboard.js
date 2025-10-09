import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface, 
  Avatar,
  FAB
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CashierDashboard() {
  const { user, availableRoles, switchRole, logout, currentRole } = useAuth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      // Mock data - gerçek API hazır olduğunda değiştirilecek
      const mockPayments = [
        { id: 1, table_number: '5', amount: 125.50, order_number: '#001' },
        { id: 2, table_number: '8', amount: 89.75, order_number: '#002' },
        { id: 3, table_number: '12', amount: 156.25, order_number: '#003' }
      ];
      setPendingPayments(mockPayments);
    } catch (error) {
      console.error('Payments load error:', error);
      Alert.alert('Hata', 'Ödemeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingPayments();
  };

  const processPayment = async (paymentId) => {
    try {
      // Mock payment processing
      Alert.alert('Başarılı', 'Ödeme işlendi');
      await loadPendingPayments();
    } catch (error) {
      console.error('Payment process error:', error);
      Alert.alert('Hata', 'Ödeme işlenirken bir hata oluştu');
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text 
            size={50} 
            label={user?.full_name?.charAt(0) || 'K'} 
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Title style={styles.userName}>{user?.full_name}</Title>
            <Paragraph style={styles.userRole}>💰 Kasiyer</Paragraph>
          </View>
        </View>
        
        {/* Rol Değiştirme */}
        {availableRoles.length > 1 && (
          <View style={styles.roleSwitcher}>
            {availableRoles.map((role) => (
              <Button
                key={role}
                mode={currentRole === role ? "contained" : "outlined"}
                onPress={() => switchRole(role)}
                style={[
                  styles.roleButton,
                  currentRole === role && styles.activeRoleButton
                ]}
                labelStyle={styles.roleButtonLabel}
                compact
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Surface style={styles.statCard} elevation={2}>
              <Title style={styles.statNumber}>{pendingPayments.length}</Title>
              <Paragraph style={styles.statLabel}>Bekleyen Ödeme</Paragraph>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Title style={styles.statNumber}>₺371.50</Title>
              <Paragraph style={styles.statLabel}>Toplam Tutar</Paragraph>
            </Surface>
          </View>

          {/* Pending Payments */}
          <View style={styles.paymentsContainer}>
            <Title style={styles.sectionTitle}>Bekleyen Ödemeler</Title>
            
            {pendingPayments.length === 0 ? (
              <Surface style={styles.emptyState} elevation={2}>
                <Title style={styles.emptyTitle}>Ödeme Yok</Title>
                <Paragraph style={styles.emptyText}>
                  Bekleyen ödeme bulunmuyor.
                </Paragraph>
              </Surface>
            ) : (
              pendingPayments.map((payment) => (
                <Card key={payment.id} style={styles.paymentCard} elevation={3}>
                  <Card.Content>
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentInfo}>
                        <Title style={styles.paymentNumber}>{payment.order_number}</Title>
                        <Paragraph style={styles.tableInfo}>
                          Masa {payment.table_number}
                        </Paragraph>
                      </View>
                      <Title style={styles.paymentAmount}>
                        ₺{payment.amount}
                      </Title>
                    </View>
                    
                    <Button
                      mode="contained"
                      onPress={() => processPayment(payment.id)}
                      style={styles.processButton}
                    >
                      Ödeme Al
                    </Button>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Floating Action Buttons */}
      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={onRefresh}
        loading={refreshing}
      />
      <FAB
        icon="logout"
        style={styles.logoutFab}
        onPress={logout}
        label="Çıkış"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  roleSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeRoleButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleButtonLabel: {
    color: 'white',
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // FAB butonları için boşluk
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  paymentsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  tableInfo: {
    fontSize: 12,
    color: '#718096',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  processButton: {
    borderRadius: 12,
    backgroundColor: '#4caf50',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  logoutFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#e53e3e',
  },
});
