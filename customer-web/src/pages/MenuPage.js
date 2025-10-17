/**
 * MENU PAGE - Ana Menü Sayfası
 * 
 * Bu sayfa restoran menüsünü gösterir ve müşterilerin sipariş vermesini sağlar.
 * 
 * İÇERİK:
 * - Restoran menü ürünleri (yemekler, içecekler, tatlılar vb.)
 * - Kategori filtreleme (Çorba, Ana Yemek, Salata, İçecekler, Tatlı vb.)
 * - Vejetaryen ürünler için özel filtre
 * - Arama fonksiyonu (ürün adı ve açıklamasında arama)
 * - Ürün resimleri ve fiyat bilgileri
 * - "Sepete Ekle" butonu (her ürün için)
 * - Sepete ekleme bildirimi (geçici popup)
 * - Responsive tasarım (mobil: 2 sütun, desktop: 3 sütun)
 * 
 * ÖZELLİKLER:
 * - Çoklu kategori desteği (bir ürün birden fazla kategoride olabilir)
 * - Dinamik kategori sıralaması (restoran menü sırası)
 * - Vejetaryen ürünler için yeşil etiket ve 🌱 ikonu
 * - Gerçek zamanlı filtreleme ve arama
 * - Sepet sayısı göstergesi
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri menüye girer
 * 2. Kategori seçerek ürünleri filtreler
 * 3. İstediği ürünleri sepete ekler
 * 4. Sepete giderek siparişi tamamlar
 */
import React, { useState } from "react";
import menuData from "../data/menuData";
import { useCart } from "../context/CartContext";

const MenuPage = () => {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [addedItem, setAddedItem] = useState("");
  
  // Restoran menü sıralaması
  const categoryOrder = [
    "all",
    "Çorba",
    "Meze", 
    "Ana Yemek",
    "Salata",
    "Vejetaryen",
    "Tatlı",
    "Sıcak İçecek",
    "Soğuk İçecek"
  ];
  
  const allCategories = new Set();
  menuData.forEach(item => {
    item.categories.forEach(cat => allCategories.add(cat));
  });
  
  // Kategorileri restoran sırasına göre düzenle
  const categories = categoryOrder.filter(cat => 
    cat === "all" || allCategories.has(cat)
  );
  
  const filteredItems = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categories.includes(selectedCategory);
    const matchesVegetarian = !showVegetarianOnly || item.categories.includes("Vejetaryen");
    return matchesSearch && matchesCategory && matchesVegetarian;
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedItem(item.name);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 pb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">EsSe Menü</h2>
        
        {/* Arama ve Filtreleme */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Yemek ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Tüm Kategoriler" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Vejetaryen Filtresi */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showVegetarianOnly}
                onChange={(e) => setShowVegetarianOnly(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                🌱 Sadece Vejetaryen Ürünler
              </span>
            </label>
            
            {showVegetarianOnly && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {filteredItems.length} vejetaryen ürün bulundu
              </div>
            )}
          </div>
        </div>

        {/* Menü Öğeleri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="w-full h-48">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                
                {/* Kategoriler */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.map((category, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          category === "Vejetaryen" 
                            ? "bg-green-100 text-green-700 font-medium" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category === "Vejetaryen" ? "🌱 " : ""}{category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-orange-600 font-bold text-lg">₺{item.price}</p>
                  <button 
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold"
                    onClick={() => handleAddToCart(item)}
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
          </div>
        )}

        {/* Sepete Ekleme Bildirimi */}
        {showNotification && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-medium">{addedItem} sepete eklendi!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
