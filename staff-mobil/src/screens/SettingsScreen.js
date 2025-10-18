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
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { useNotifications } from '../hooks/useNotifications';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import useModal from '../hooks/useModal';

const SettingsScreen = () => {
  const { user, business, hasRole, switchRole, logout, updateProfile, currentRole } = useAuth();
  const { 
    settings: notificationSettings, 
    updateSetting, 
    isLoading: notificationsLoading,
    resetSettings 
  } = useNotifications();
  const [darkMode, setDarkMode] = useState(false);
  
  // Profil düzenleme modalı
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [profileErrors, setProfileErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // İşletme bilgileri düzenleme modalı
  const [showBusinessEditModal, setShowBusinessEditModal] = useState(false);
  const [businessData, setBusinessData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [businessErrors, setBusinessErrors] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // İşletme bilgileri modalı (sadece görüntüleme)
  const businessModal = useModal();


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
    const roleNames = {
      'admin': 'Yönetici',
      'chef': 'Şef',
      'waiter': 'Garson',
      'cashier': 'Kasiyer'
    };
    
    // Eğer zaten bu roldeyse uyarı ver
    if (currentRole === role) {
      Alert.alert(
        'Rol Değiştir',
        `Zaten ${roleNames[role]} rolündesiniz.`,
        [{ text: 'Tamam' }]
      );
      return;
    }
    
    Alert.alert(
      'Rol Değiştir',
      `${roleNames[role]} rolüne geçmek istediğinizden emin misiniz?`,
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

  // Bildirim ayarlarını sıfırla
  const handleResetNotifications = () => {
    Alert.alert(
      'Bildirim Ayarlarını Sıfırla',
      'Tüm bildirim ayarları varsayılan değerlere döndürülecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla', onPress: resetSettings, style: 'destructive' }
      ]
    );
  };

  // İşletme bilgileri modalı (sadece görüntüleme)
  const handleBusinessInfo = () => {
    businessModal.openModal();
  };

  const handleEditBusiness = () => {
    // Mevcut işletme bilgilerini form'a yükle
    setBusinessData({
      name: business?.name || '',
      address: business?.address || '',
      phone: business?.phone || '',
      email: business?.email || '',
    });
    setBusinessErrors({});
    setShowBusinessEditModal(true);
  };

  const handleBusinessFieldChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Hata varsa temizle
    if (businessErrors[field]) {
      setBusinessErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateBusinessForm = () => {
    const errors = {};
    let isValid = true;

    if (!businessData.name.trim()) {
      errors.name = 'İşletme adı zorunludur';
      isValid = false;
    }

    if (!businessData.address.trim()) {
      errors.address = 'Adres zorunludur';
      isValid = false;
    }

    if (!businessData.phone.trim()) {
      errors.phone = 'Telefon zorunludur';
      isValid = false;
    } else if (!/^[0-9\s\-\(\)]+$/.test(businessData.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
      isValid = false;
    }

    if (businessData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessData.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
      isValid = false;
    }

    setBusinessErrors(errors);
    return isValid;
  };

  const handleSaveBusiness = async () => {
    if (!validateBusinessForm()) {
      return;
    }

    try {
      // TODO: API çağrısı yapılacak
      Alert.alert('Başarılı', 'İşletme bilgileri güncellendi');
      setShowBusinessEditModal(false);
    } catch (error) {
      Alert.alert('Hata', 'İşletme bilgileri güncellenirken bir hata oluştu');
    }
  };


  // Profil düzenleme fonksiyonları
  const handleEditProfile = () => {
    console.log('Profil düzenle butonuna tıklandı');
    
    // Mevcut kullanıcı bilgilerini yükle
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      
      // Error state'leri temizle
      setProfileErrors({
        fullName: '',
        email: '',
        phone: '',
      });
    }
    
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    // Error state'leri temizle
    setProfileErrors({
      fullName: '',
      email: '',
      phone: '',
    });

    let hasError = false;
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
    };

    // Ad Soyad kontrolü
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Ad Soyad alanı zorunludur';
      hasError = true;
    }

    // E-posta kontrolü (isteğe bağlı - sadece format kontrolü)
    if (profileData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        hasError = true;
      }
    }

    // Telefon kontrolü
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Telefon numarası alanı zorunludur';
      hasError = true;
    } else {
      // Telefon format kontrolü
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(profileData.phone)) {
        newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        hasError = true;
      }
    }

    // Hata varsa error state'leri güncelle ve çık
    if (hasError) {
      setProfileErrors(newErrors);
      return;
    }

    try {
      const success = await updateProfile(profileData);
      
      if (success) {
        // Error state'leri temizle
        setProfileErrors({
          fullName: '',
          email: '',
          phone: '',
        });
        
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
    
    // Error state'leri temizle
    setProfileErrors({
      fullName: '',
      email: '',
      phone: '',
    });
    
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
                  style={[
                    styles.roleCard, 
                    { borderLeftColor: role.color },
                    currentRole === role.id && styles.currentRoleCard
                  ]}
                  onPress={() => handleRoleSwitch(role.id)}
                >
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <View style={styles.roleInfo}>
                    <View style={styles.roleNameContainer}>
                      <Text style={styles.roleName}>{role.name}</Text>
                      {currentRole === role.id && (
                        <View style={styles.currentRoleBadge}>
                          <Text style={styles.currentRoleText}>Bu roldesiniz</Text>
                        </View>
                      )}
                    </View>
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
              <Text style={styles.settingTitle}>Uygulama İçi Bildirimler</Text>
              <Text style={styles.settingDescription}>Sipariş ve ödeme bildirimleri</Text>
            </View>
            <Switch
              value={notificationSettings.notificationsEnabled}
              onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationSettings.notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              disabled={notificationsLoading}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ses Uyarıları</Text>
              <Text style={styles.settingDescription}>Bildirim sesleri</Text>
            </View>
            <Switch
              value={notificationSettings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationSettings.soundEnabled ? '#ffffff' : '#f4f3f4'}
              disabled={notificationsLoading || !notificationSettings.notificationsEnabled}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sipariş Bildirimleri</Text>
              <Text style={styles.settingDescription}>Yeni sipariş uyarıları</Text>
            </View>
            <Switch
              value={notificationSettings.orderNotifications}
              onValueChange={(value) => updateSetting('orderNotifications', value)}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationSettings.orderNotifications ? '#ffffff' : '#f4f3f4'}
              disabled={notificationsLoading || !notificationSettings.notificationsEnabled}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ödeme Bildirimleri</Text>
              <Text style={styles.settingDescription}>Ödeme tamamlama uyarıları</Text>
            </View>
            <Switch
              value={notificationSettings.paymentNotifications}
              onValueChange={(value) => updateSetting('paymentNotifications', value)}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationSettings.paymentNotifications ? '#ffffff' : '#f4f3f4'}
              disabled={notificationsLoading || !notificationSettings.notificationsEnabled}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sistem Bildirimleri</Text>
              <Text style={styles.settingDescription}>Sistem durumu uyarıları</Text>
            </View>
            <Switch
              value={notificationSettings.systemNotifications}
              onValueChange={(value) => updateSetting('systemNotifications', value)}
              trackColor={{ false: '#e5e7eb', true: '#1e3a8a' }}
              thumbColor={notificationSettings.systemNotifications ? '#ffffff' : '#f4f3f4'}
              disabled={notificationsLoading || !notificationSettings.notificationsEnabled}
            />
          </View>

          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetNotifications}
            disabled={notificationsLoading}
          >
            <Text style={styles.resetButtonText}>Bildirim Ayarlarını Sıfırla</Text>
          </TouchableOpacity>
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
          <Card variant="outlined" style={styles.section}>
            <Text style={styles.sectionTitle}>İşletme Yönetimi</Text>
            <TouchableOpacity style={styles.adminAction} onPress={handleBusinessInfo}>
              <Text style={styles.adminActionIcon}>🏢</Text>
              <Text style={styles.adminActionText}>İşletme Bilgileri</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Yardım ve Destek */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>Yardım ve Destek</Text>
          <TouchableOpacity style={styles.helpAction} onPress={handleContactSupport}>
            <Text style={styles.helpActionIcon}>📞</Text>
            <Text style={styles.helpActionText}>Destek İletişim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpAction} onPress={handleAbout}>
            <Text style={styles.helpActionIcon}>ℹ️</Text>
            <Text style={styles.helpActionText}>Uygulama Hakkında</Text>
          </TouchableOpacity>
        </Card>

        {/* Çıkış */}
        <Card style={styles.section}>
          <Button
            title="Çıkış Yap"
            variant="danger"
            size="large"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>

      {/* Profil Düzenleme Modalı */}
      <Modal
        visible={showProfileModal}
        onClose={handleCancelProfile}
        title="Profil Düzenle"
        size="large"
        showCloseButton={false}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveProfile}
        secondaryButtonText="İptal"
        onSecondaryPress={handleCancelProfile}
        scrollable={true}
      >
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Ad Soyad *</Text>
            <TextInput
              style={[styles.formInput, profileErrors.fullName && styles.errorInput]}
              value={profileData.fullName}
              onChangeText={(text) => {
                setProfileData(prev => ({ ...prev, fullName: text }));
                if (profileErrors.fullName) {
                  setProfileErrors(prev => ({ ...prev, fullName: '' }));
                }
              }}
              placeholder="Ad soyadınızı giriniz"
              placeholderTextColor="#9ca3af"
            />
            {profileErrors.fullName && (
              <Text style={styles.formErrorText}>{profileErrors.fullName}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>E-posta</Text>
            <TextInput
              style={[styles.formInput, profileErrors.email && styles.errorInput]}
              value={profileData.email}
              onChangeText={(text) => {
                setProfileData(prev => ({ ...prev, email: text }));
                if (profileErrors.email) {
                  setProfileErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              placeholder="E-posta adresinizi giriniz"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {profileErrors.email && (
              <Text style={styles.formErrorText}>{profileErrors.email}</Text>
            )}
            <Text style={styles.formHelpText}>
              E-posta adresi isteğe bağlıdır
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Telefon *</Text>
            <TextInput
              style={[styles.formInput, profileErrors.phone && styles.errorInput]}
              value={profileData.phone}
              onChangeText={(text) => {
                setProfileData(prev => ({ ...prev, phone: text }));
                if (profileErrors.phone) {
                  setProfileErrors(prev => ({ ...prev, phone: '' }));
                }
              }}
              placeholder="Telefon numaranızı giriniz"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
            {profileErrors.phone && (
              <Text style={styles.formErrorText}>{profileErrors.phone}</Text>
            )}
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
      </Modal>

      {/* İşletme Bilgileri Modalı (Sadece Görüntüleme) */}
      <Modal
        visible={businessModal.isVisible}
        onClose={businessModal.closeModal}
        title="İşletme Bilgileri"
        size="medium"
        showCloseButton={false}
        primaryButtonText={hasRole('admin') ? "Düzenle" : null}
        onPrimaryPress= {hasRole('admin') ? handleEditBusiness : null}
        primaryButtonStyle= {hasRole('admin') ? styles.editButton : null}
        secondaryButtonText="Kapat"
        onSecondaryPress={businessModal.closeModal} 
        secondaryButtonStyle={styles.softBlueButton}
        scrollable={true}
      >
        <View style={styles.businessInfoContainer}>
              
              <View style={styles.businessInfoContainer}>
                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>İşletme Kodu</Text>
                  <Text style={styles.businessInfoValue}>{business?.business_code || 'REST001'}</Text>
                </View>
                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>İşletme Adı</Text>
                  <Text style={styles.businessInfoValue}>{business?.name || 'Belirtilmemiş'}</Text>
                </View>

                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>Adres</Text>
                  <Text style={styles.businessInfoValue}>{business?.address || 'Belirtilmemiş'}</Text>
                </View>

                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>Telefon</Text>
                  <Text style={styles.businessInfoValue}>{business?.phone || 'Belirtilmemiş'}</Text>
                </View>

                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>E-posta</Text>
                  <Text style={styles.businessInfoValue}>{business?.email || 'Belirtilmemiş'}</Text>
                </View>

                <View style={styles.businessInfoItem}>
                  <Text style={styles.businessInfoLabel}>Durum</Text>
                  <Text style={[
                    styles.businessInfoValue,
                    { color: business?.is_active ? '#059669' : '#dc2626' }
                  ]}>
                    {business?.is_active ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>

              </View>

        </View>
      </Modal>

      {/* İşletme Düzenleme Modalı */}
      <Modal
        visible={showBusinessEditModal}
        onClose={() => setShowBusinessEditModal(false)}
        title="İşletme Bilgilerini Düzenle"
        size="large"
        showCloseButton={false}
        primaryButtonText="Kaydet"
        onPrimaryPress={handleSaveBusiness}
        secondaryButtonText="İptal"
        onSecondaryPress={() => setShowBusinessEditModal(false)}
        scrollable={true}
      >
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>İşletme Adı *</Text>
            <TextInput
              style={[styles.formInput, businessErrors.name && styles.formInputError]}
              value={businessData.name}
              onChangeText={(value) => handleBusinessFieldChange('name', value)}
              placeholder="İşletme adını giriniz"
            />
            {businessErrors.name && (
              <Text style={styles.formErrorText}>{businessErrors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Adres *</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea, businessErrors.address && styles.formInputError]}
              value={businessData.address}
              onChangeText={(value) => handleBusinessFieldChange('address', value)}
              placeholder="İşletme adresini giriniz"
              multiline
              numberOfLines={3}
            />
            {businessErrors.address && (
              <Text style={styles.formErrorText}>{businessErrors.address}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Telefon *</Text>
            <TextInput
              style={[styles.formInput, businessErrors.phone && styles.formInputError]}
              value={businessData.phone}
              onChangeText={(value) => handleBusinessFieldChange('phone', value)}
              placeholder="Telefon numarasını giriniz"
              keyboardType="phone-pad"
            />
            {businessErrors.phone && (
              <Text style={styles.formErrorText}>{businessErrors.phone}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>E-posta</Text>
            <TextInput
              style={[styles.formInput, businessErrors.email && styles.formInputError]}
              value={businessData.email}
              onChangeText={(value) => handleBusinessFieldChange('email', value)}
              placeholder="E-posta adresini giriniz"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {businessErrors.email && (
              <Text style={styles.formErrorText}>{businessErrors.email}</Text>
            )}
            <Text style={styles.formHelpText}>E-posta adresi isteğe bağlıdır</Text>
          </View>
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
    backgroundColor: Colors.white,
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
  editButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editButtonText: {
    fontSize: 14,
    color: '#6b7280',
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
  roleNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  currentRoleCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  currentRoleBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentRoleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
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
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)',
    elevation: 6,
  },
  logoutButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '100%',
    padding: 20,
  },
  modalScrollView: {
    maxHeight: 500,
    marginBottom: 20,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: Spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  errorInput: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  formHelpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  formErrorText: {
    fontSize: 12,
    color: '#ef4444',
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
  resetButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  businessInfoContainer: {
    padding: Spacing.md,
    marginBottom: 5,
    flex: 1,
  },
  softBlueButton: {
    backgroundColor: '#60a5fa', // Soft blue
    borderColor: '#60a5fa',
  },
  businessInfoItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  businessInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  businessInfoValue: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
    elevation: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalButtonsCentered: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});

export default SettingsScreen;
