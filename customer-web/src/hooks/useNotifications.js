/**
 * USE NOTIFICATIONS HOOK - Push Bildirim Hook'u
 * Bu hook push notification özelliklerini yönetir. Bildirim izni ister, subscription oluşturur ve test bildirimleri gönderir.
 * Service Worker ile entegre çalışır ve kullanıcıya sipariş durumu bildirimleri gönderebilir.
 */
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!isSupported || permission !== 'granted') return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For now, we'll just enable local notifications
      // In a real app, you'd subscribe to a push service here
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return false;
    }
  };

  const showNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return;

    const defaultOptions = {
      body: 'Yeni sipariş bildirimi!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      ...options
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
  };

  const testNotification = () => {
    showNotification('Test Bildirimi', {
      body: 'Bildirim sistemi çalışıyor!',
      tag: 'test-notification'
    });
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    showNotification,
    testNotification
  };
};
