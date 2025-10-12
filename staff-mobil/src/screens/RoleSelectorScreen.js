/**
 * ROLE SELECTOR SCREEN - Login Sonrası Ana Rol Seçim Ekranı
 * 
 * Bu ekran kullanıcının birden fazla rolü olduğunda login sonrası ilk hangi rol ile çalışmak istediğini seçmesini sağlar.
 * Rol seçildikten sonra ilgili dashboard'a yönlendirir. Üstte hızlı rol değiştirme butonları bulunur.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const RoleSelectorScreen = ({ navigation }) => {
  const { user, currentRole, switchRole, hasRole } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Yönetici',
      description: 'Tüm sistem yönetimi, raporlar ve ayarlar',
      icon: '👑',
      color: '#dc2626',
    },
    {
      id: 'chef',
      name: 'Şef',
      description: 'Yemek siparişlerini yönetme ve hazırlama',
      icon: '👨‍🍳',
      color: '#ea580c',
    },
    {
      id: 'waiter',
      name: 'Garson',
      description: 'Masa takibi, sipariş teslimi ve müşteri hizmetleri',
      icon: '👨‍💼',
      color: '#059669',
    },
    {
      id: 'cashier',
      name: 'Kasiyer',
      description: 'Ödeme işlemleri ve kasa yönetimi',
      icon: '💰',
      color: '#7c3aed',
    },
  ];

  const handleRoleSelect = (roleId) => {
    switchRole(roleId);
    // Navigation otomatik olarak AppNavigator'da conditional rendering ile yapılacak
  };

  const getAvailableRoles = () => {
    return roles.filter(role => hasRole(role.id));
  };

  const availableRoles = getAvailableRoles();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rol Seçimi</Text>
          <Text style={styles.subtitle}>
            Hangi rol ile çalışmak istiyorsunuz?
          </Text>
        </View>
        {availableRoles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              { borderLeftColor: role.color },
              currentRole === role.id && styles.selectedCard
            ]}
            onPress={() => handleRoleSelect(role.id)}
          >
            <View style={styles.roleHeader}>
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{role.name}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              {currentRole === role.id && (
                <View style={[styles.selectedBadge, { backgroundColor: role.color }]}>
                  <Text style={styles.selectedBadgeText}>Aktif</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.quickSwitch}>
        <Text style={styles.quickSwitchTitle}>Hızlı Geçiş</Text>
        <View style={styles.quickSwitchButtons}>
          {availableRoles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.quickSwitchButton,
                { backgroundColor: role.color },
                currentRole === role.id && styles.quickSwitchButtonActive
              ]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <Text style={styles.quickSwitchButtonText}>{role.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    paddingTop: 50, // Header'ı aşağı taşıdık
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  selectedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickSwitch: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  quickSwitchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickSwitchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickSwitchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  quickSwitchButtonActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  quickSwitchButtonText: {
    fontSize: 20,
  },
});

export default RoleSelectorScreen;
