/**
 * CART PAGE - Sepet Sayfası
 * 
 * Bu sayfa müşterinin sepetindeki ürünleri gösterir ve sipariş vermesini sağlar.
 * 
 * İÇERİK:
 * - Sepetteki ürünlerin listesi
 * - Her ürün için: resim, ad, fiyat, miktar
 * - Miktar artırma/azaltma butonları
 * - Ürün silme butonu
 * - Toplam tutar hesaplama
 * - "Sipariş Ver" butonu
 * - Sepet boşsa: boş sepet mesajı ve menüye dön butonu
 * 
 * ÖZELLİKLER:
 * - Gerçek zamanlı fiyat güncelleme
 * - Sipariş verme sırasında loading animasyonu
 * - Sipariş verildikten sonra otomatik yönlendirme
 * - Sepet temizleme (sipariş verildikten sonra)
 * - Sipariş durumu takibi (hasOrdered state)
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri sepetindeki ürünleri görür
 * 2. Miktarları ayarlar veya ürünleri siler
 * 3. Toplam tutarı kontrol eder
 * 4. "Sipariş Ver" butonuna tıklar
 * 5. Sipariş onay sayfasına yönlendirilir
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, calculateTotal, clearCart, placeOrder: placeOrderContext } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();
  const total = calculateTotal();

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    // Simüle edilmiş sipariş işlemi
    await new Promise(resolve => setTimeout(resolve, 2000));
    placeOrderContext(); // Context'teki placeOrder fonksiyonunu çağır
    navigate("/confirmation");
  };

  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Sepetiniz</h2>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg mb-6">Sepetiniz boş</p>
              <Link to="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">Menüye Dön</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Sepet Öğeleri */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center border-b pb-4">
                  <div className="w-20 h-20 flex-shrink-0 mr-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">Lezzetli ve taze</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                      </button>
                      <span className="px-3 py-1 border rounded bg-gray-100">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+
                      </button>
                    </div>
                    <div className="text-orange-600 font-bold mb-2">₺{item.price}</div>
                    <button 
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      onClick={() => removeFromCart(item.id)}
                    >Kaldır
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Sipariş Özeti */}
            <div className="flex justify-between items-center border-t pt-4 mb-4">
              <span className="font-semibold">Toplam:</span>
              <span className="text-xl font-bold text-orange-600">₺{total.toFixed(2)}</span>
            </div>
            {/* Sipariş Ver Butonu */}
            <button 
              className={`w-full py-3 font-bold rounded transition ${
                isPlacingOrder 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
              onClick={placeOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Sipariş Veriliyor...' : 'Sipariş Ver'}
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;