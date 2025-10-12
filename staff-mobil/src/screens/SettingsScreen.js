/**
 * SETTINGS SCREEN - Ayarlar Ekranı
 * 
 * Bu ekran tüm kullanıcılar için ortak ayarlar sayfasıdır. Profil yönetimi, bildirim ayarları,
 * çıkış işlemi ve rol değiştirme seçenekleri içerir. Admin kullanıcılar için ek işletme ayarları bulunur.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const SettingsScreen = () => {
  const { user, business, hasRole, switchRole, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  const handleRoleSwitch = (role) => {
    Alert.alert(
      'Rol Değiştir',
      `${role.toUpperCase()} rolüne geçmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değiştir',
          onPress: () => switchRole(role),
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Destek',
      'Destek ekibiyle iletişime geçmek için:\n\n📧 Email: destek@restoran.com\n📞 Telefon: +90 212 555 0123',
      [{ text: 'Tamam' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Uygulama Hakkında',
      `Restoran Yönetim Sistemi\n\nVersiyon: 1.0.0\nGeliştirici: Restoran Teknoloji\n\n© 2024 Tüm hakları saklıdır.`,
      [{ text: 'Tamam' }]
    );
  };

  const getAvailableRoles = () => {
    const allRoles = [
      { id: 'admin', name: 'Yönetici', icon: '👑', color: '#dc2626' },
      { id: 'chef', name: 'Şef', icon: '👨‍🍳', color: '#ea580c' },
      { id: 'waiter', name: 'Garson', icon: '👨‍💼', color: '#059669' },
      { id: 'cashier', name: 'Kasiyer', icon: '💰', color: '#7c3aed' },
    ];
    
    return allRoles.filter(role => hasRole(role.id));
  };

  const availableRoles = getAvailableRoles();

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: 50 }]}>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <Text style={styles.headerSubtitle}>Uygulama ve hesap ayarları</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profil Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name}</Text>
              <Text style={styles.profileBusiness}>{business?.name}</Text>
              <Text style={styles.profileUsername}>@{user?.username}</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rol Değiştirme */}
        {availableRoles.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rol Değiştirme</Text>
            <View style={styles.rolesContainer}>
              {availableRoles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[styles.roleCard, { borderLeftColor: role.color }]}
                  onPress={() => handleRoleSwitch(role.id)}
                >
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{role.name}</Text>
                    <Text style={styles.roleDescription}>
                      {role.id === 'admin' && 'Tüm sistem yönetimi'}
                      {role.id === 'chef' && 'Mutfak ve sipariş yönetimi'}
                      {role.id === 'waiter' && 'Masa ve müşteri hizmetleri'}
                      {role.id === 'cashier' && 'Ödeme ve kasa işlemleri'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bildirim Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Bildirimleri</Text>
              <Text style={styles.settingDescription}>Sipariş ve ödeme bildirimleri</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ses Uyarıları</Text>
              <Text style={styles.settingDescription}>Bildirim sesleri</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={soundEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Görünüm Ayarları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Karanlık Mod</Text>
              <Text style={styles.settingDescription}>Karanlık tema kullan</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Admin Ayarları */}
        {hasRole('admin') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İşletme Yönetimi</Text>
            <TouchableOpacity style={styles.adminAction}>
              <Text style={styles.adminActionIcon}>👥</Text>
              <Text style={styles.adminActionText}>Çalışan Yönetimi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminAction}>
              <Text style={styles.adminActionIcon}>🏢</Text>
              <Text style={styles.adminActionText}>İşletme Bilgileri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminAction}>
              <Text style={styles.adminActionIcon}>🔧</Text>
              <Text style={styles.adminActionText}>Sistem Ayarları</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Yardım ve Destek */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yardım ve Destek</Text>
          <TouchableOpacity style={styles.helpAction} onPress={handleContactSupport}>
            <Text style={styles.helpActionIcon}>📞</Text>
            <Text style={styles.helpActionText}>Destek İletişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpAction}>
            <Text style={styles.helpActionIcon}>❓</Text>
            <Text style={styles.helpActionText}>Sık Sorulan Sorular</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpAction} onPress={handleAbout}>
            <Text style={styles.helpActionIcon}>ℹ️</Text>
            <Text style={styles.helpActionText}>Uygulama Hakkında</Text>
          </TouchableOpacity>
        </View>

        {/* Çıkış */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>⏻</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileBusiness: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 12,
    color: '#9ca3af',
  },
  editProfileButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editProfileButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  rolesContainer: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  adminAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  adminActionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  adminActionText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  helpAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  helpActionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  helpActionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
