/**
 * SETTINGS SCREEN - Ayarlar Ekranı
 * 
 * Kullanıcı profil yönetimi, bildirim ayarları, rol değiştirme ve çıkış işlemleri.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';

const SettingsScreen = () => {
  const { user, business, hasRole, switchRole, logout, updateProfile, currentRole } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Profil düzenleme modalı
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Kullanıcı bilgileri değiştiğinde form verilerini güncelle
  useEffect(() => {
    // Sadece user ve currentRole varsa çalış
    if (!user || !currentRole || !user.id) {
      return;
    }
    
    setProfileData({
      fullName: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user?.id, currentRole]);

  const handleLogout = () => {
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
      'Destek: destek@restoran.com\nTelefon: +90 212 555 0123',
      [{ text: 'Tamam' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Uygulama Hakkında',
      'Restoran Yönetim Sistemi v1.0.0\n© 2025 Tüm hakları saklıdır.',
      [{ text: 'Tamam' }]
    );
  };

  // Profil düzenleme fonksiyonları
  const handleEditProfile = () => {
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!profileData.fullName.trim()) {
      Alert.alert('Hata', 'Ad Soyad alanı boş olamaz.');
      return;
    }

    if (!profileData.phone.trim()) {
      Alert.alert('Hata', 'Telefon numarası alanı boş olamaz.');
      return;
    }

    try {
      const success = await updateProfile(profileData);
      
      if (success) {
        Alert.alert(
          'Profil Güncellendi',
          'Profil bilgileriniz başarıyla güncellendi.',
          [{ text: 'Tamam', onPress: () => setShowProfileModal(false) }]
        );
      } else {
        Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleCancelProfile = () => {
    setShowProfileModal(false);
    // Form verilerini mevcut kullanıcı bilgileriyle sıfırla
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profil Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.full_name}</Text>
              <Text style={styles.profileBusiness}>{business?.name}</Text>
              <Text style={styles.profileUsername}>@{user?.username}</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
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

      {/* Profil Düzenleme Modalı */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelProfile}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>Profil Düzenle</Text>
              
              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Ad Soyad *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={profileData.fullName}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, fullName: text }))}
                    placeholder="Ad soyadınızı giriniz"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>E-posta</Text>
                  <TextInput
                    style={styles.formInput}
                    value={profileData.email}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                    placeholder="E-posta adresinizi giriniz"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Telefon *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={profileData.phone}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                    placeholder="Telefon numaranızı giriniz"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Kullanıcı Adı</Text>
                  <TextInput
                    style={[styles.formInput, styles.disabledInput]}
                    value={user?.username || ''}
                    editable={false}
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.formHelpText}>Kullanıcı adı değiştirilemez</Text>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelProfile}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  scrollContent: {
    paddingBottom: 120, // Bottom navigation için makul boşluk
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
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '100%',
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  formHelpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
