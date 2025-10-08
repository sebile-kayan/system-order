/**
 * ORDER TRACKING PAGE - Sipariş Takip Sayfası
 * 
 * Bu sayfa müşterinin verdiği siparişlerin durumunu takip etmesini sağlar.
 * 
 * İÇERİK:
 * - Sipariş listesi (hazırlanıyor, hazır, teslim edildi)
 * - Her sipariş için: sipariş numarası, tarih, ürünler, toplam tutar
 * - Sipariş durumu (renkli etiketler ve ikonlar)
 * - Tahmini hazırlık süresi
 * - Boş durumda: "Henüz siparişiniz bulunmuyor" mesajı
 * 
 * ÖZELLİKLER:
 * - Mock veri sistemi (gerçek backend yok)
 * - 3 farklı sipariş durumu: Hazırlanıyor, Hazır, Teslim Edildi
 * - Dinamik durum ikonları (👨‍🍳, ✅, 🍽️)
 * - Renkli durum etiketleri
 * - Responsive tasarım
 * - Loading animasyonu
 * 
 * DURUM AÇIKLAMALARI:
 * - Hazırlanıyor: Sipariş mutfakta hazırlanıyor
 * - Hazır: Sipariş hazır, garson getiriyor
 * - Teslim Edildi: Sipariş müşteriye ulaştı
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri sipariş takip sayfasına girer
 * 2. Verdiği siparişleri görür
 * 3. Her siparişin durumunu takip eder
 * 4. Yeni sipariş vermek için menüye dönebilir
 */
import React, { useState, useEffect } from 'react';

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simüle edilmiş sipariş verileri - Gerçek restoran mantığı
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'Sipariş-001',
        items: [
          { name: 'Margherita Pizza', quantity: 1 },
          { name: 'Cola', quantity: 2 },
          { name: 'Çoban Salatası', quantity: 1 }
        ],
        total: 135.00,
        status: 'preparing',
        statusText: 'Hazırlanıyor',
        createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 dakika önce
        estimatedTime: 15,
        progress: 60
      },
      {
        id: 2,
        orderNumber: 'Sipariş-002',
        items: [
          { name: 'Cheeseburger', quantity: 1 },
          { name: 'Fanta', quantity: 1 },
          { name: 'Patates Kızartması', quantity: 1 }
        ],
        total: 95.00,
        status: 'ready',
        statusText: 'Hazır',
        createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 dakika önce
        estimatedTime: 0,
        progress: 100
      },
      {
        id: 3,
        orderNumber: 'Sipariş-003',
        items: [
          { name: 'Adana Kebab', quantity: 1 },
          { name: 'Ayran', quantity: 1 },
          { name: 'Baklava', quantity: 2 }
        ],
        total: 165.00,
        status: 'completed',
        statusText: 'Teslim Edildi',
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 dakika önce
        estimatedTime: 0,
        progress: 100
      },
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'completed': return '🍽️';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-center">Sipariş Takibi</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg mb-4">Henüz siparişiniz bulunmuyor.</p>
          <p className="text-gray-400 text-sm">Menüden sipariş vererek başlayabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              {/* Sipariş Başlığı */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {order.createdAt.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center gap-1`}>
                    <span>{getStatusIcon(order.status)}</span>
                    {order.statusText}
                  </div>
                  {order.estimatedTime > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tahmini süre: {order.estimatedTime} dk
                    </p>
                  )}
                </div>
              </div>


              {/* Sipariş İçeriği */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-700">Sipariş İçeriği:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                          {item.quantity}x
                        </span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt Bilgi */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold text-orange-600">
                  Toplam: ₺{order.total.toFixed(2)}
                </span>
                {order.status === 'ready' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">✅ Siparişiniz hazır!</span>
                  </div>
                )}
                {order.status === 'completed' && (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">🍽️ Teslim edildi</span>
                  </div>
                )}
                {order.status === 'preparing' && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">👨‍🍳 Hazırlanıyor</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;