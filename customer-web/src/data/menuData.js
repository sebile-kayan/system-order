/**
 * MENU DATA - Restoran Menü Verileri
 * 
 * Bu dosya restoran menüsündeki tüm ürünleri içerir.
 * 
 * İÇERİK:
 * - Ürün adları ve açıklamaları
 * - Fiyat bilgileri
 * - Ürün resimleri (assets/images klasöründe)
 * - Kategori bilgileri (çoklu kategori desteği)
 * - Vejetaryen durumu
 * 
 * KATEGORİLER:
 * - Ana Yemek: Pizza, Burger, Kebab vb.
 * - Çorba: Mercimek, Yayla vb.
 * - Meze: Humus, Baba Gannuş vb.
 * - Salata: Çoban, Akdeniz vb.
 * - Vejetaryen: Vejetaryen ürünler (🌱 etiketi)
 * - Tatlı: Baklava, Sütlaç vb.
 * - Sıcak İçecek: Kahve, Çay vb.
 * - Soğuk İçecek: Su, Ayran vb.
 * 
 * ÖZELLİKLER:
 * - Çoklu kategori desteği (bir ürün birden fazla kategoride)
 * - Vejetaryen ürün işaretlemesi
 * - Gerçekçi fiyatlandırma
 * - Türkçe ürün isimleri
 * - Detaylı açıklamalar
 * 
 * RESİM SİSTEMİ:
 * - Her ürün için uygun resim
 * - assets/images klasöründe saklanır
 * - JPEG formatında
 * - Ürün türüne göre isimlendirme
 * 
 * KULLANIM:
 * - MenuPage'de ürün listesi için
 * - Kategori filtreleme için
 * - Arama fonksiyonu için
 * - Sepet işlemleri için
 */
const menuData = [
  // Pizza Kategorisi
  { 
    id: 1, 
    name: "Margherita Pizza", 
    price: 80, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Ana Yemek", "Vejetaryen"],
    description: "Taze mozzarella, domates sosu ve fesleğen ile hazırlanan klasik pizza"
  },
  { 
    id: 2, 
    name: "Pepperoni Pizza", 
    price: 95, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Ana Yemek"],
    description: "Sucuk ve mozzarella peyniri ile hazırlanan nefis pizza"
  },
  { 
    id: 3, 
    name: "Quattro Stagioni", 
    price: 110, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Ana Yemek"],
    description: "Mantar, zeytin, enginar ve prosciutto ile dört mevsim pizza"
  },
  { 
    id: 4, 
    name: "Karışık Pizza", 
    price: 120, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Ana Yemek"],
    description: "Sucuk, salam, mantar, zeytin ve mozzarella ile karışık pizza"
  },

  // Burger Kategorisi
  { 
    id: 5, 
    name: "Cheeseburger", 
    price: 65, 
    image: "/images/cheeseburger.jpeg",
    categories: [ "Ana Yemek"],
    description: "Etli köfte, cheddar peyniri, marul ve domates ile klasik burger"
  },
  { 
    id: 6, 
    name: "Chicken Burger", 
    price: 55, 
    image: "/images/cheeseburger.jpeg",
    categories: [ "Ana Yemek"],
    description: "Tavuk göğsü, marul, domates ve özel sos ile hazırlanan burger"
  },
  { 
    id: 7, 
    name: "Vejetaryen Burger", 
    price: 45, 
    image: "/images/cheeseburger.jpeg",
    categories: [ "Ana Yemek", "Vejetaryen"],
    description: "Sebze köftesi, avokado, marul ve humus ile vejetaryen burger"
  },
  { 
    id: 8, 
    name: "Barbekü Burger", 
    price: 75, 
    image: "/images/cheeseburger.jpeg",
    categories: [ "Ana Yemek"],
    description: "Barbekü sosu, soğan halkaları ve cheddar ile nefis burger"
  },

  // Soğuk İçecekler
  { 
    id: 9, 
    name: "Cola", 
    price: 20, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Gazlı İçecek"],
    description: "Klasik kola içeceği"
  },
  { 
    id: 10, 
    name: "Fanta", 
    price: 20, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Gazlı İçecek"],
    description: "Portakal aromalı gazlı içecek"
  },
  { 
    id: 11, 
    name: "Sprite", 
    price: 20, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Gazlı İçecek"],
    description: "Limon aromalı gazlı içecek"
  },
  { 
    id: 12, 
    name: "Su", 
    price: 8, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Vejetaryen"],
    description: "Doğal kaynak suyu"
  },
  { 
    id: 13, 
    name: "Ayran", 
    price: 15, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Vejetaryen"],
    description: "Ev yapımı ayran"
  },
  { 
    id: 14, 
    name: "Meyve Suyu", 
    price: 25, 
    image: "/images/kola.jpeg",
    categories: ["Soğuk İçecek", "Vejetaryen"],
    description: "Taze meyve suyu (portakal, elma, vişne)"
  },

  // Sıcak İçecekler
  { 
    id: 15, 
    name: "Türk Kahvesi", 
    price: 18, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Kahve", "Vejetaryen"],
    description: "Geleneksel Türk kahvesi"
  },
  { 
    id: 16, 
    name: "Americano", 
    price: 22, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Kahve", "Vejetaryen"],
    description: "Espresso bazlı sade kahve"
  },
  { 
    id: 17, 
    name: "Cappuccino", 
    price: 28, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Kahve", "Vejetaryen"],
    description: "Espresso, sıcak süt ve köpük ile"
  },
  { 
    id: 18, 
    name: "Latte", 
    price: 30, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Kahve", "Vejetaryen"],
    description: "Espresso ve bol sıcak süt"
  },
  { 
    id: 19, 
    name: "Çay", 
    price: 12, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Çay", "Vejetaryen"],
    description: "Türk çayı"
  },
  { 
    id: 20, 
    name: "Bitki Çayı", 
    price: 16, 
    image: "/images/kola.jpeg",
    categories: ["Sıcak İçecek", "Çay", "Vejetaryen"],
    description: "Papatya, nane, adaçayı seçenekleri"
  },

  // Salatalar
  { 
    id: 21, 
    name: "Çoban Salatası", 
    price: 35, 
    image: "/images/kola.jpeg",
    categories: ["Salata", "Vejetaryen"],
    description: "Domates, salatalık, soğan, maydanoz ve zeytinyağı"
  },
  { 
    id: 22, 
    name: "Sezar Salata", 
    price: 45, 
    image: "/images/kola.jpeg",
    categories: ["Salata"],
    description: "Marul, parmesan, kruton ve sezar sosu"
  },
  { 
    id: 23, 
    name: "Tavuk Salata", 
    price: 50, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Salata"],
    description: "Izgara tavuk, roka, cherry domates ve balsamik"
  },
  { 
    id: 24, 
    name: "Akdeniz Salatası", 
    price: 40, 
    image: "/images/kola.jpeg",
    categories: ["Salata", "Vejetaryen"],
    description: "Roka, domates, salatalık, zeytin ve feta peyniri"
  },

  // Ana Yemekler
  { 
    id: 25, 
    name: "Adana Kebab", 
    price: 85, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Ana Yemek"],
    description: "Acılı kıyma kebabı, bulgur pilavı ve ayran"
  },
  { 
    id: 26, 
    name: "Urfa Kebab", 
    price: 85, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Ana Yemek"],
    description: "Acısız kıyma kebabı, bulgur pilavı ve ayran"
  },
  { 
    id: 27, 
    name: "Tavuk Şiş", 
    price: 75, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Ana Yemek"],
    description: "Marine edilmiş tavuk göğsü, pilav ve salata"
  },
  { 
    id: 28, 
    name: "Mantı", 
    price: 60, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Ana Yemek"],
    description: "Ev yapımı mantı, yoğurt ve tereyağı sosu"
  },
  { 
    id: 29, 
    name: "Lahmacun", 
    price: 25, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Ana Yemek"],
    description: "İnce hamur üzerine kıyma, soğan ve domates"
  },

  // Tatlılar
  { 
    id: 30, 
    name: "Tiramisu", 
    price: 35, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Tatlı", "Vejetaryen"],
    description: "İtalyan usulü kahveli tiramisu"
  },
  { 
    id: 31, 
    name: "Cheesecake", 
    price: 30, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Tatlı", "Vejetaryen"],
    description: "Krem peynirli New York usulü cheesecake"
  },
  { 
    id: 32, 
    name: "Baklava", 
    price: 40, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Tatlı", "Vejetaryen"],
    description: "Ev yapımı cevizli baklava"
  },
  { 
    id: 33, 
    name: "Künefe", 
    price: 45, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Tatlı", "Vejetaryen"],
    description: "Peynirli künefe, kaymak ile"
  },
  { 
    id: 34, 
    name: "Sütlaç", 
    price: 20, 
    image: "/images/margherita-pizza.jpeg",
    categories: ["Tatlı", "Vejetaryen"],
    description: "Ev yapımı sütlaç, tarçın ile"
  },

  // Çorbalar
  { 
    id: 35, 
    name: "Mercimek Çorbası", 
    price: 25, 
    image: "/images/kola.jpeg",
    categories: ["Çorba", "Vejetaryen"],
    description: "Ev yapımı kırmızı mercimek çorbası"
  },
  { 
    id: 36, 
    name: "Yayla Çorbası", 
    price: 30, 
    image: "/images/kola.jpeg",
    categories: ["Çorba", "Vejetaryen"],
    description: "Yoğurt, pirinç ve nane ile yayla çorbası"
  },
  { 
    id: 37, 
    name: "Tavuk Çorbası", 
    price: 35, 
    image: "/images/cheeseburger.jpeg",
    categories: ["Çorba"],
    description: "Tavuk etli şehriye çorbası"
  },

  // Mezeler
  { 
    id: 38, 
    name: "Humus", 
    price: 25, 
    image: "/images/kola.jpeg",
    categories: ["Meze", "Vejetaryen"],
    description: "Nohut püresi, tahin ve zeytinyağı"
  },
  { 
    id: 39, 
    name: "Baba Gannuş", 
    price: 30, 
    image: "/images/kola.jpeg",
    categories: ["Meze", "Vejetaryen"],
    description: "Patlıcan püresi, tahin ve zeytinyağı"
  },
  { 
    id: 40, 
    name: "Muhammara", 
    price: 28, 
    image: "/images/kola.jpeg",
    categories: ["Meze", "Vejetaryen"],
    description: "Ceviz, kırmızı biber ve ekmek içi"
  }
];

export default menuData;
