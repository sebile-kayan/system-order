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
import { useCart } from '../context/CartContext';

const PaymentButton = () => {
  const { calculateTotal, hasOrdered, orderTotal, cart, isPaid } = useCart();
  
  // Ödeme mantığı:
  // 1. Sipariş verilmiş ama ödeme alınmamışsa (hasOrdered=true, isPaid=false): 
  //    - Yeni ürün varsa: önceki tutar + yeni tutar
  //    - Yeni ürün yoksa: önceki tutar
  // 2. Hiç sipariş verilmemişse veya ödeme alınmışsa: sepet tutarı
  const currentCartTotal = calculateTotal();
  let total = 0;
  
  if (hasOrdered && !isPaid) {
    total = orderTotal + currentCartTotal; // Önceki tutar + yeni ürünler
    console.log('Payment Button: Sipariş verilmiş, toplam:', total);
  } else {
    total = currentCartTotal; // Normal sepet tutarı (yeni sipariş başlangıcı)
    console.log('Payment Button: Normal sepet tutarı:', total);
  }

  // Debug için console log
  React.useEffect(() => {
    console.log('PAYMENT BUTTON DEBUG:', { isPaid, hasOrdered, orderTotal, cartLength: cart.length });
    console.log('Current Total:', total);
  }, [isPaid, hasOrdered, orderTotal, cart, total]);

  // Buton her zaman görünür olacak, sepet boş olsa bile
  return (
    <div 
      className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center gap-2 font-medium"
    >
      <span className="text-xl">💳</span>
      <span className="hidden sm:inline">Toplam: ₺{total.toFixed(0)}</span>
      <span className="sm:hidden">₺{total.toFixed(0)}</span>
    </div>
  );
};

export default PaymentButton;
