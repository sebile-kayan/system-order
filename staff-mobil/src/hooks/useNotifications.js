/** HOOK KLASÖRÜNÜN AMACI: State yönetimi ve logic paylaşımı. Birden fazla bileşende kullanılan logic'ler.
 * NOTIFICATION HOOK - Bildirim Yönetimi
 * 
 * Uygulama içi bildirimler için ayarlar ve yönetim fonksiyonları.
 * Push bildirimler yerine sadece uygulama içi bildirimler kullanılır.
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bildirim ayarları için storage anahtarları
const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  SOUND_ENABLED: 'sound_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
  ORDER_NOTIFICATIONS: 'order_notifications',
  PAYMENT_NOTIFICATIONS: 'payment_notifications',
  SYSTEM_NOTIFICATIONS: 'system_notifications',
};

// Bildirim ayarları varsayılan değerleri
const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  orderNotifications: true,
  paymentNotifications: true,
  systemNotifications: true,
};

// Expo Go'da çalışacak basit bildirim sistemi
// Gerçek push bildirimler yerine Alert kullanıyoruz

export const useNotifications = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Ayarları yükle
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedSettings = { ...DEFAULT_SETTINGS };

      for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        const value = await AsyncStorage.getItem(storageKey);
        if (value !== null) {
          loadedSettings[key] = JSON.parse(value);
        }
      }

      setSettings(loadedSettings);
    } catch (error) {
      console.error('Bildirim ayarları yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ayarı güncelle
  const updateSetting = useCallback(async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // AsyncStorage'a kaydet
      const storageKey = STORAGE_KEYS[key];
      if (storageKey) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Bildirim ayarı güncellenirken hata:', error);
      Alert.alert('Hata', 'Ayar güncellenirken bir hata oluştu.');
    }
  }, [settings]);

  // Uygulama içi bildirim göster (Expo Go uyumlu)
  const showInAppNotification = useCallback((title, message, type = 'info') => {
    if (!settings.notificationsEnabled) return;

    // Expo Go'da Alert kullanarak bildirim göster
    Alert.alert(
      title,
      message,
      [
        { text: 'Tamam', style: 'default' }
      ],
      { cancelable: true }
    );
  }, [settings.notificationsEnabled]);

  // Sipariş bildirimi
  const showOrderNotification = useCallback((orderData) => {
    if (!settings.orderNotifications) return;

    const { tableNumber, items, total } = orderData;
    const itemNames = items.map(item => item.name).join(', ');
    
    showInAppNotification(
      'Yeni Sipariş',
      `Masa ${tableNumber}: ${itemNames} - ₺${total}`,
      'order'
    );
  }, [settings.orderNotifications, showInAppNotification]);

  // Ödeme bildirimi
  const showPaymentNotification = useCallback((paymentData) => {
    if (!settings.paymentNotifications) return;

    const { tableNumber, amount, method } = paymentData;
    
    showInAppNotification(
      'Ödeme Alındı',
      `Masa ${tableNumber}: ₺${amount} (${method})`,
      'payment'
    );
  }, [settings.paymentNotifications, showInAppNotification]);

  // Sistem bildirimi
  const showSystemNotification = useCallback((title, message) => {
    if (!settings.systemNotifications) return;

    showInAppNotification(title, message, 'system');
  }, [settings.systemNotifications, showInAppNotification]);

  // Bildirim izinlerini kontrol et (Expo Go için her zaman true)
  const checkPermissions = useCallback(async () => {
    // Expo Go'da her zaman izin var (Alert kullandığımız için)
    return true;
  }, []);

  // Bildirim izni iste (Expo Go için her zaman true)
  const requestPermissions = useCallback(async () => {
    // Expo Go'da her zaman izin var (Alert kullandığımız için)
    return true;
  }, []);

  // Tüm ayarları sıfırla
  const resetSettings = useCallback(async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      
      // AsyncStorage'dan sil
      for (const storageKey of Object.values(STORAGE_KEYS)) {
        await AsyncStorage.removeItem(storageKey);
      }
      
      Alert.alert('Başarılı', 'Bildirim ayarları sıfırlandı.');
    } catch (error) {
      console.error('Ayarlar sıfırlanırken hata:', error);
      Alert.alert('Hata', 'Ayarlar sıfırlanırken bir hata oluştu.');
    }
  }, []);

  // Component mount olduğunda ayarları yükle
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    updateSetting,
    showInAppNotification,
    showOrderNotification,
    showPaymentNotification,
    showSystemNotification,
    checkPermissions,
    requestPermissions,
    resetSettings,
  };
};
