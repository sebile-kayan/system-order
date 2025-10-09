import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB, 
  Avatar, 
  DataTable,
  Chip,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  List,
  Switch,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Mock data
const mockEmployees = [
  {
    id: 1,
    full_name: 'Ahmet Yılmaz',
    username: 'ahmet',
    email: 'ahmet@restaurant.com',
    phone: '+90 532 123 4567',
    roles: ['waiter', 'cashier'],
    status: 'active',
    hire_date: '2023-01-15',
    salary: 8500
  },
  {
    id: 2,
    full_name: 'Ayşe Kaya',
    username: 'ayse',
    email: 'ayse@restaurant.com',
    phone: '+90 533 234 5678',
    roles: ['chef'],
    status: 'active',
    hire_date: '2022-08-20',
    salary: 12000
  },
  {
    id: 3,
    full_name: 'Mehmet Demir',
    username: 'mehmet',
    email: 'mehmet@restaurant.com',
    phone: '+90 534 345 6789',
    roles: ['cashier'],
    status: 'active',
    hire_date: '2023-03-10',
    salary: 7500
  },
  {
    id: 4,
    full_name: 'Fatma Özkan',
    username: 'fatma',
    email: 'fatma@restaurant.com',
    phone: '+90 535 456 7890',
    roles: ['waiter'],
    status: 'inactive',
    hire_date: '2022-12-05',
    salary: 8000
  }
];

const roleLabels = {
  admin: 'Admin',
  chef: 'Şef',
  waiter: 'Garson',
  cashier: 'Kasiyer'
};

const roleColors = {
  admin: '#ef4444',
  chef: '#f59e0b',
  waiter: '#3b82f6',
  cashier: '#10b981'
};

export default function EmployeeManagementScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    roles: [],
    salary: '',
    password: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setRefreshing(true);
    try {
      // Gerçek API çağrısı
      // const response = await api.getUsers();
      // setEmployees(response.data);
      
      // Mock data kullan
      setTimeout(() => {
        setEmployees(mockEmployees);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Çalışan verileri yüklenirken hata:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadEmployees();
  };

  const handleAddEmployee = () => {
    setFormData({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      roles: [],
      salary: '',
      password: ''
    });
    setShowAddDialog(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      username: employee.username,
      email: employee.email,
      phone: employee.phone,
      roles: [...employee.roles],
      salary: employee.salary.toString(),
      password: ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = (employee) => {
    Alert.alert(
      'Çalışanı Sil',
      `${employee.full_name} adlı çalışanı silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            // API çağrısı yapılacak
            console.log('Çalışan siliniyor:', employee.id);
            loadEmployees();
          }
        }
      ]
    );
  };

  const handleSaveEmployee = async () => {
    if (!formData.full_name || !formData.username || !formData.email) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      if (showAddDialog) {
        // Yeni çalışan ekleme
        // await api.createUser(formData);
        console.log('Yeni çalışan ekleniyor:', formData);
      } else {
        // Çalışan güncelleme
        // await api.updateUser(selectedEmployee.id, formData);
        console.log('Çalışan güncelleniyor:', selectedEmployee.id, formData);
      }
      
      setShowAddDialog(false);
      setShowEditDialog(false);
      loadEmployees();
    } catch (error) {
      console.error('Çalışan kaydedilirken hata:', error);
      Alert.alert('Hata', 'Çalışan kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) => {
    const newRoles = formData.roles.includes(role)
      ? formData.roles.filter(r => r !== role)
      : [...formData.roles, role];
    
    setFormData({ ...formData, roles: newRoles });
  };

  const filteredEmployees = employees.filter(employee => {
    if (filterStatus === 'all') return true;
    return employee.status === filterStatus;
  });

  const getStatusColor = (status) => {
    return status === 'active' ? '#10b981' : '#ef4444';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'Aktif' : 'Pasif';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
          <Appbar.Content title="Çalışan Yönetimi" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        <Paragraph style={styles.headerSubtitle}>Personel yönetimi ve işlemleri</Paragraph>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <Chip
            selected={filterStatus === 'all'}
            onPress={() => setFilterStatus('all')}
            style={styles.filterChip}
          >
            Tümü
          </Chip>
          <Chip
            selected={filterStatus === 'active'}
            onPress={() => setFilterStatus('active')}
            style={styles.filterChip}
          >
            Aktif
          </Chip>
          <Chip
            selected={filterStatus === 'inactive'}
            onPress={() => setFilterStatus('inactive')}
            style={styles.filterChip}
          >
            Pasif
          </Chip>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} style={styles.employeeCard}>
              <Card.Content style={styles.cardContent}>
                {/* Header Section */}
                <View style={styles.cardHeader}>
                  <View style={styles.employeeMainInfo}>
                    <Avatar.Text 
                      size={50} 
                      label={employee.full_name.charAt(0)} 
                      style={styles.employeeAvatar}
                    />
                    <View style={styles.employeeDetails}>
                      <Title style={styles.employeeName}>
                        {employee.full_name}
                      </Title>
                      <Paragraph style={styles.employeeUsername}>
                        @{employee.username}
                      </Paragraph>
                    </View>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[
                        styles.statusChip,
                        { borderColor: getStatusColor(employee.status) }
                      ]}
                      textStyle={{ 
                        color: getStatusColor(employee.status),
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    >
                      {getStatusLabel(employee.status)}
                    </Chip>
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.contactSection}>
                  <View style={styles.contactItem}>
                    <IconButton icon="email" size={16} iconColor="#6b7280" />
                    <Paragraph style={styles.contactText}>
                      {employee.email}
                    </Paragraph>
                  </View>
                  <View style={styles.contactItem}>
                    <IconButton icon="phone" size={16} iconColor="#6b7280" />
                    <Paragraph style={styles.contactText}>
                      {employee.phone}
                    </Paragraph>
                  </View>
                </View>

                {/* Roles Section */}
                <View style={styles.rolesSection}>
                  <Paragraph style={styles.sectionLabel}>Roller:</Paragraph>
                  <View style={styles.rolesContainer}>
                    {employee.roles.map((role) => (
                      <Chip
                        key={role}
                        mode="outlined"
                        compact
                        style={[styles.roleChip, { borderColor: roleColors[role] }]}
                        textStyle={{ color: roleColors[role], fontSize: 12 }}
                      >
                        {roleLabels[role]}
                      </Chip>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                  <IconButton
                    icon="pencil"
                    size={24}
                    iconColor="#1e3a8a"
                    onPress={() => handleEditEmployee(employee)}
                    style={styles.actionIconButton}
                  />
                  <IconButton
                    icon="delete"
                    size={24}
                    iconColor="#ef4444"
                    onPress={() => handleDeleteEmployee(employee)}
                    style={styles.actionIconButton}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Add Employee FAB */}
      <FAB
        icon="plus"
        label="Yeni Çalışan"
        style={styles.addFab}
        onPress={handleAddEmployee}
      />

      {/* Add Employee Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Yeni Çalışan Ekle</Dialog.Title>
          <Dialog.Content>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput
                label="Ad Soyad *"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={styles.input}
              />
              
              <TextInput
                label="Kullanıcı Adı *"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                style={styles.input}
              />
              
              <TextInput
                label="E-posta *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                style={styles.input}
              />
              
              <TextInput
                label="Telefon"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Maaş"
                value={formData.salary}
                onChangeText={(text) => setFormData({ ...formData, salary: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <TextInput
                label="Şifre *"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                style={styles.input}
              />
              
              <Title style={styles.rolesTitle}>Roller</Title>
              {Object.keys(roleLabels).map((role) => (
                <List.Item
                  key={role}
                  title={roleLabels[role]}
                  left={() => (
                    <Switch
                      value={formData.roles.includes(role)}
                      onValueChange={() => toggleRole(role)}
                    />
                  )}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>İptal</Button>
            <Button 
              onPress={handleSaveEmployee}
              loading={loading}
              mode="contained"
            >
              Kaydet
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Employee Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Çalışan Düzenle</Dialog.Title>
          <Dialog.Content>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput
                label="Ad Soyad *"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={styles.input}
              />
              
              <TextInput
                label="Kullanıcı Adı *"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                style={styles.input}
              />
              
              <TextInput
                label="E-posta *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                style={styles.input}
              />
              
              <TextInput
                label="Telefon"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                style={styles.input}
              />
              
              <TextInput
                label="Maaş"
                value={formData.salary}
                onChangeText={(text) => setFormData({ ...formData, salary: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              
              <TextInput
                label="Yeni Şifre (Opsiyonel)"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                style={styles.input}
              />
              
              <Title style={styles.rolesTitle}>Roller</Title>
              {Object.keys(roleLabels).map((role) => (
                <List.Item
                  key={role}
                  title={roleLabels[role]}
                  left={() => (
                    <Switch
                      value={formData.roles.includes(role)}
                      onValueChange={() => toggleRole(role)}
                    />
                  )}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>İptal</Button>
            <Button 
              onPress={handleSaveEmployee}
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
    flexDirection: 'row',
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  employeeCard: {
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
  employeeMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  employeeUsername: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
    marginLeft: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  contactSection: {
    marginBottom: 20,
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  rolesSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
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
  rolesTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});
