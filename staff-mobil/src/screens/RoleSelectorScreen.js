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
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';

const RoleSelectorScreen = ({ navigation }) => {
  const { user, currentRole, switchRole, hasRole } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Yönetici',
      description: 'Tüm sistem yönetimi, raporlar ve ayarlar',
      icon: '👑',
      color: Colors.error,
    },
    {
      id: 'chef',
      name: 'Şef',
      description: 'Yemek siparişlerini yönetme ve hazırlama',
      icon: '👨‍🍳',
      color: Colors.warning,
    },
    {
      id: 'waiter',
      name: 'Garson',
      description: 'Masa takibi, sipariş teslimi ve müşteri hizmetleri',
      icon: '👨‍💼',
      color: Colors.success,
    },
    {
      id: 'cashier',
      name: 'Kasiyer',
      description: 'Ödeme işlemleri ve kasa yönetimi',
      icon: '💰',
      color: Colors.secondary,
    },
  ];

  const handleRoleSelect = (roleId) => {
    switchRole(roleId);
    // Navigation otomatik olarak AppNavigator'da conditional rendering ile yapılacak
  };

  const getAvailableRoles = () => {
    return roles.filter(role => user?.roles?.includes(role.id) || false);
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
          <Card
            key={role.id}
            style={[
              styles.roleCard,
              { borderLeftColor: role.color, borderLeftWidth: 4 },
              currentRole === role.id && styles.selectedCard
            ]}
          >
            <TouchableOpacity
              onPress={() => handleRoleSelect(role.id)}
              style={styles.roleButton}
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
          </Card>
        ))}
      </ScrollView>

      <Card style={styles.quickSwitch}>
        <View style={styles.quickSwitchButtons}>
          {availableRoles.map((role) => (
            <Button
              key={role.id}
              title={role.icon}
              variant={currentRole === role.id ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleRoleSelect(role.id)}
              style={[
                styles.quickSwitchButton,
                { backgroundColor: currentRole === role.id ? role.color : Colors.white }
              ]}
            />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.screenPadding,
    paddingTop: 50,
  },
  title: {
    ...Typography.styles.h2,
    color: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  roleCard: {
    marginBottom: Spacing.lg,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  roleButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: Spacing.lg,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    ...Typography.styles.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roleDescription: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  selectedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
  },
  selectedBadgeText: {
    color: Colors.white,
    ...Typography.styles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  quickSwitch: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickSwitchTitle: {
    ...Typography.styles.body,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
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
    opacity: 0.8,
  },
});

export default RoleSelectorScreen;
