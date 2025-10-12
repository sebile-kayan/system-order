/**
 * PAYMENT BUTTON COMPONENT - Floating Ödeme Butonu
 * 
 * Bu bileşen sağ alt köşede sabit duran toplam tutar göstergesidir.
 * 
 * İÇERİK:
 * - 💳 Para ikonu
 * - Toplam tutar bilgisi
 * - Responsive metin (mobilde sadece tutar, desktop'ta "Toplam: ₺X")
 * 
 * ÖZELLİKLER:
 * - Her zaman görünür (sepet boş olsa bile)
 * - Sipariş verildikten sonra da tutarı gösterir
 * - Floating (sabit) pozisyon
 * - Responsive tasarım
 * - Yeşil renk teması
 * - Tıklanamaz (sadece bilgi amaçlı)
 * 
 * TUTAR HESAPLAMA:
 * - Sipariş verilmişse: Kaydedilen tutarı gösterir (orderTotal)
 * - Sipariş verilmemişse: Sepet tutarını gösterir (calculateTotal)
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri her zaman toplam tutarı görebilir
 * 2. Sepet durumu değişse bile tutar görünür kalır
 * 3. Sipariş verildikten sonra da tutar bilgisi korunur
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PaymentButton = () => {
  const { calculateTotal, hasOrdered, orderTotal, cart, isPaid } = useCart();
  const navigate = useNavigate();
  
  // Ödeme mantığı:
  // 1. Sipariş verilmiş ama ödeme alınmamışsa: Sadece sipariş verilen tutar ödenir
  // 2. Hiç sipariş verilmemişse veya ödeme alınmışsa: sepet tutarı
  const currentCartTotal = calculateTotal();
  let paymentTotal = 0; // Ödenecek tutar
  let hasNewItems = false; // Yeni sepette ürün var mı?
  
  if (hasOrdered && !isPaid) {
    paymentTotal = orderTotal; // Sadece sipariş verilen tutar ödenir
    hasNewItems = currentCartTotal > 0; // Yeni sepette ürün varsa
  } else {
    paymentTotal = currentCartTotal; // Normal sepet tutarı
  }

  // Ödeme sayfasına yönlendir
  const handlePaymentClick = () => {
    if (paymentTotal > 0) {
      navigate('/payment');
    }
  };

  // Buton her zaman görünür olacak, sepet boş olsa bile
  return (
    <div 
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        paymentTotal > 0 ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
      }`}
      onClick={paymentTotal > 0 ? handlePaymentClick : undefined}
      title={paymentTotal > 0 ? 'Ödeme yapmak için tıklayın' : 'Sepetiniz boş'}
    >
      <div className={`relative bg-white rounded-xl shadow-lg border transition-all duration-300 ${
        paymentTotal > 0 
          ? 'border-green-400 hover:border-green-500 hover:shadow-xl' 
          : 'border-gray-200'
      }`}>
        {/* Ana ödeme kartı */}
        <div className={`px-4 py-3 rounded-xl transition-all duration-300 ${
          paymentTotal > 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'
        }`}>
          <div className="flex items-center gap-2">
            {/* Kredi kartı ikonu */}
            <div className="bg-white/20 p-1.5 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
            </div>
            
            {/* Tutar bilgisi */}
            <div className="text-white">
              <div className="font-bold text-base">
                ₺{paymentTotal.toFixed(0)}
              </div>
              <div className="text-xs opacity-90">
                {hasOrdered ? 'Ödenecek' : 'Sepet'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Yeni sepet bilgisi (varsa) */}
        {hasNewItems && (
          <div className="bg-orange-50 border-t border-orange-100 px-4 py-2 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-orange-700">
                <div className="text-xs font-medium">Yeni: ₺{currentCartTotal.toFixed(0)}</div>
              </div>
              <div className="text-orange-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* Pulse efekti (sadece ödeme varsa) */}
        {paymentTotal > 0 && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default PaymentButton;
