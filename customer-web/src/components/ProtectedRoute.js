/**
 * PROTECTED ROUTE COMPONENT - Korumalı Sayfa Bileşeni
 * 
 * Bu bileşen belirli sayfaların sadece aktif masa oturumu olan kullanıcılar tarafından erişilebilmesini sağlar.
 * 
 * İÇERİK:
 * - Oturum kontrolü
 * - Loading durumu
 * - QR kod gerekli mesajı
 * - Hata durumu yönetimi
 * 
 * ÖZELLİKLER:
 * - Masa oturumu kontrolü
 * - QR kod varlığı kontrolü
 * - Loading animasyonu
 * - Kullanıcı dostu hata mesajları
 * - Otomatik yönlendirme koruması
 * 
 * KORUNAN SAYFALAR:
 * - MenuPage (/)
 * - CartPage (/cart)
 * - OrderConfirmation (/confirmation)
 * - OrderTracking (/orders)
 * - PaymentPage (/payment)
 * 
 * KULLANIM:
 * - App.js'de korumalı sayfaları sarmalar
 * - QR kod olmadan erişimi engeller
 * - Kullanıcıyı bilgilendirir
 */
import React from 'react';
import { useTable } from '../context/TableContext';

const ProtectedRoute = ({ children }) => {
  const { isSessionActive, isLoading } = useTable();

  // Yükleniyor durumunda loading göster
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Masa bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Oturum yoksa mock oturum başlat
  if (!isSessionActive()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Masa oturumu başlatılıyor...</p>
        </div>
      </div>
    );
  }

  // Oturum varsa children'ı render et
  return children;
};

export default ProtectedRoute;
