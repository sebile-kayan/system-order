/**
 * PAYMENT PAGE - Ödeme İsteği Sayfası
 * 
 * Bu sayfa müşterinin ödeme için çalışanı çağırmasını sağlar.
 * 
 * İÇERİK:
 * - Ödeme ikonu ve başlık
 * - Masa numarası bilgisi
 * - Toplam tutar gösterimi
 * - "Çalışanı Çağır" butonu (sadece sipariş verildikten sonra aktif)
 * - Başarı mesajı sayfası (garson çağırıldıktan sonra)
 * - "Geri Dön" butonu
 * 
 * ÖZELLİKLER:
 * - Sipariş durumu kontrolü (hasOrdered)
 * - Koşullu buton aktifliği (sipariş yoksa devre dışı)
 * - Güzel başarı mesajı (alert yerine sayfa)
 * - Otomatik yönlendirme (3 saniye sonra)
 * - Loading animasyonu
 * - Tutar bilgisi (sipariş verildikten sonra korunur)
 * 
 * BUTON DURUMLARI:
 * - Sipariş verilmişse: "🛎️ Çalışanı Çağır" (aktif, yeşil)
 * - Sipariş verilmemişse: "⚠️ Önce Sipariş Verin" (devre dışı, gri)
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri ödeme sayfasına girer
 * 2. Sipariş verilmişse garson çağırabilir
 * 3. Güzel başarı mesajı görür
 * 4. Otomatik olarak menüye yönlendirilir
 */
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTable } from '../context/TableContext';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const { calculateTotal, cart, hasOrdered, orderTotal, markAsPaid } = useCart();
  const { tableInfo } = useTable();
  const navigate = useNavigate();
  
  // Ödeme sayfasında sadece sipariş verilen tutarı göster
  const currentCartTotal = calculateTotal();
  let total = 0;
  
  if (hasOrdered) {
    total = orderTotal; // Sadece sipariş verilen tutar (sepetteki ürünler dahil değil)
    console.log('PAYMENT PAGE DEBUG:', { 
      hasOrdered, 
      orderTotal, 
      currentCartTotal, 
      total,
      cartLength: cart.length 
    });
  } else {
    total = currentCartTotal; // Sadece sepet tutarı
    console.log('PAYMENT PAGE DEBUG (No Order):', { 
      currentCartTotal, 
      total,
      cartLength: cart.length 
    });
  }
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  const requestPayment = () => {
    // Ödeme tutarını kaydet (markAsPaid çağrılmadan önce)
    setPaidAmount(total);
    // Ödeme işlemini tamamla - Payment Button'ı sıfırla
    markAsPaid();
    setShowSuccessMessage(true);
    // 3 saniye sonra menüye yönlendir
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">Ödeme Tamamlandı!</h1>
            <p className="text-gray-600 mb-6">
              Masa {tableInfo.id} için <span className="font-bold text-orange-600">₺{paidAmount.toFixed(2)}</span> tutarında ödeme tamamlandı.
            </p>
            <p className="text-gray-500 text-sm">
              Yeni siparişler için menüye yönlendiriliyorsunuz...
            </p>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
          >
            🍽️ Menüye Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödeme İsteği</h1>
          <p className="text-gray-600">Ödeme için çalışanı çağır butonuna tıklayınız</p>
        </div>

        {tableInfo && (
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Masa</div>
            <div className="text-2xl font-bold text-orange-600">Masa {tableInfo.id}</div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">Toplam Tutar</div>
          <div className="text-3xl font-bold text-gray-800">₺{total.toFixed(2)}</div>
        </div>

        <div className="space-y-3">
          {hasOrdered ? (
            <button
              onClick={requestPayment}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
            >
              🛎️ Çalışanı Çağır
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              ⚠️ Önce Sipariş Verin
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
          >
            Geri Dön
          </button>
        </div>

        {hasOrdered && (
          <div className="mt-6 text-sm text-gray-500">
            <p>✅ Ödeme için çalışanı çağırabilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
