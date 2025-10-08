/**
 * ORDER CONFIRMATION PAGE - Sipariş Onay Sayfası
 * 
 * Bu sayfa sipariş verildikten sonra müşteriye onay mesajı gösterir.
 * 
 * İÇERİK:
 * - Başarı ikonu (yeşil tik)
 * - "Siparişiniz Verildi!" başlığı
 * - Açıklama metni (garson siparişi getirecek)
 * - Tahmini süre bilgisi (15-20 dakika)
 * - Rastgele sipariş numarası
 * - "Menüye Dön" butonu
 * 
 * ÖZELLİKLER:
 * - Tek buton tasarımı (sadece menüye dön)
 * - Rastgele sipariş numarası üretimi
 * - Responsive tasarım
 * - Temiz ve anlaşılır mesajlaşma
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri sipariş verir
 * 2. Bu sayfaya yönlendirilir
 * 3. Sipariş onayını görür
 * 4. Menüye dönerek yeni sipariş verebilir
 */
import React from "react";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full flex flex-col items-center">
          {/* Başarı İkonu */}
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" />
            </svg>
          </div>
          {/* Başlık */}
          <h1 className="text-2xl font-bold mb-4 text-center">Siparişiniz Verildi!</h1>
          {/* Açıklama */}
          <p className="text-gray-600 mb-6 text-center">
            Siparişiniz başarıyla alındı. Garson siparişinizi getirene kadar bekleyin.
          </p>
          {/* Ek Bilgiler */}
          <div className="w-full mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">Tahmini Süre:</span>
              <span className="text-gray-900">15-20 dakika</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Sipariş No:</span>
              <span className="text-gray-900">#{Math.floor(Math.random() * 10000)}</span>
            </div>
          </div>
          {/* Butonlar */}
          <div className="w-full space-y-3">
            <Link to="/" className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 text-center font-medium block">
              🍽️ Menüye Dön
            </Link>
            <Link to="/orders" className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-center font-medium block">
              📋 Siparişlerim
            </Link>
          </div>
        </div>
    </div>
  );
};

export default OrderConfirmation;
