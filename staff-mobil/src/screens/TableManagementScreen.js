import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, FAB, Avatar, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

export default function TableManagementScreen({ navigation }) {
  const { user, currentRole, availableRoles, switchRole, logout } = useAuth();
  const theme = useTheme();
  const [tables, setTables] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock masa verileri
  const mockTables = [
    { id: '001', name: 'Masa 1', qrCode: 'QR-TABLE-001', status: 'Dolu' },
    { id: '002', name: 'Masa 2', qrCode: 'QR-TABLE-002', status: 'Boş' },
    { id: '003', name: 'Masa 3', qrCode: 'QR-TABLE-003', status: 'Dolu' },
    { id: '004', name: 'Masa 4', qrCode: 'QR-TABLE-004', status: 'Boş' },
    { id: '005', name: 'Masa 5', qrCode: 'QR-TABLE-005', status: 'Dolu' },
    { id: '006', name: 'Masa 6', qrCode: 'QR-TABLE-006', status: 'Boş' },
  ];

  const fetchTables = async () => {
    setRefreshing(true);
    // Gerçek API entegrasyonu burada yapılacak
    setTimeout(() => {
      setTables(mockTables);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const onRefresh = () => {
    fetchTables();
  };

  const handleAddTable = () => {
    alert('Yeni Masa Ekle fonksiyonu burada çalışacak!');
  };

  const handlePrintQr = (tableId) => {
    alert(`Masa ${tableId} için QR kodu yazdırılıyor.`);
  };

  const handleEditTable = (tableId) => {
    alert(`Masa ${tableId} düzenleniyor.`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
          <Appbar.Content title="Masa Yönetimi" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <Paragraph style={styles.headerSubtitle}>Masa ve QR kod işlemleri</Paragraph>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {tables.map((table) => (
            <Card key={table.id} style={styles.tableCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Title style={styles.tableName}>{table.name}</Title>
                  <View style={[
                    styles.statusBadge,
                    table.status === 'Dolu' ? styles.statusDolu : styles.statusBos
                  ]}>
                    <Paragraph style={[
                      styles.statusText,
                      table.status === 'Dolu' ? styles.statusTextDolu : styles.statusTextBos
                    ]}>
                      {table.status}
                    </Paragraph>
                  </View>
                </View>
                <View style={styles.qrCodeContainer}>
                  <Icon name="qrcode-scan" size={80} color={theme.colors.onSurfaceVariant} />
                  <Paragraph style={styles.qrCodeText}>{table.qrCode}</Paragraph>
                </View>
                <View style={styles.cardActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handlePrintQr(table.id)}
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                    icon="qrcode"
                  >
                    Yazdır
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditTable(table.id)}
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                    icon="pencil"
                  >
                    Düzenle
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Add New Table FAB */}
      <FAB
        icon="plus"
        label="Yeni Masa Ekle"
        style={styles.addTableFab}
        onPress={handleAddTable}
        color="white"
        theme={{ colors: { accent: theme.colors.primary } }}
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
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  tableCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 10,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDolu: {
    backgroundColor: 'black',
  },
  statusBos: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusTextDolu: {
    color: 'white',
  },
  statusTextBos: {
    color: 'black',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodeText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderColor: '#667eea',
  },
  actionButtonLabel: {
    color: '#667eea',
  },
  addTableFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
