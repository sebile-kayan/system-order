# RESTORAN YÖNETİM SİSTEMİ - PROJE TASARIM RAPORU

## 📋 PROJE ÖZETİ

Bu proje, modern restoran işletmeleri için kapsamlı bir dijital çözüm sunmaktadır. Sistem, müşteriler ve çalışanlar için ayrı uygulamalar içerir ve QR kod tabanlı masa yönetimi ile rol tabanlı çalışan sistemi sağlar.

## 🎯 PROJE HEDEFLERİ

### Ana Hedefler
- **Müşteri Deneyimi**: QR kod ile hızlı menü erişimi ve sipariş verme
- **Çalışan Verimliliği**: Rol tabanlı dashboard'lar ile iş akışı optimizasyonu
- **İşletme Yönetimi**: Kapsamlı raporlama ve yönetim araçları
- **Ölçeklenebilirlik**: Farklı büyüklükteki işletmelere uyum sağlama

### Teknik Hedefler
- **Modern Teknoloji Stack**: Node.js, React, MySQL
- **Mobil Uyumluluk**: Responsive tasarım ve PWA desteği
- **Gerçek Zamanlı İletişim**: WebSocket ile anlık bildirimler
- **Güvenlik**: JWT tabanlı kimlik doğrulama

## 🏗️ SİSTEM MİMARİSİ

### Teknoloji Stack
```
Frontend (Müşteri): React + Tailwind CSS + PWA
Frontend (Çalışan): React Native + Expo
Backend: Node.js + Express.js
Veritabanı: MySQL 8.0
Gerçek Zamanlı: Socket.io
Kimlik Doğrulama: JWT
```

### Proje Yapısı
```
restaurant-management-system/
├── customer-web/          # Müşteri web uygulaması
├── staff-mobile/          # Çalışan mobil uygulaması
├── backend-api/           # Node.js API servisi
├── database/              # MySQL şemaları ve migrasyonlar
└── shared/                # Ortak tip tanımları
```

## 👥 KULLANICI ROLERİ VE YETKİLERİ

### 1. MÜŞTERİ (Customer)
**Giriş Yöntemi**: QR kod okutma (masa bazlı)
**Yetkiler**:
- Menü görüntüleme
- Sepete ürün ekleme/çıkarma
- Sipariş verme
- Sipariş durumu takibi
- Ödeme talebi gönderme
- Bildirim alma

### 2. ÇALIŞAN ROLERİ

#### 2.1 ADMIN (Yönetici)
**Giriş Yöntemi**: Kullanıcı adı (admin tarafından atanan)
**Yetkiler**:
- Çalışan ekleme/düzenleme/silme
- Menü yönetimi (ürün ekleme/düzenleme/silme)
- Masa yönetimi (QR kod oluşturma)
- Raporlama (günlük/haftalık/yıllık)
- İşletme ayarları
- Tüm roller arası geçiş

#### 2.2 ŞEF (Chef)
**Giriş Yöntemi**: Kullanıcı adı
**Yetkiler**:
- Yemek siparişlerini görüntüleme
- Sipariş durumu güncelleme (hazırlanıyor/hazır)
- Stok takibi
- Diğer roller arası geçiş (varsa)

#### 2.3 GARSON (Waiter)
**Giriş Yöntemi**: Kullanıcı adı
**Yetkiler**:
- Masa durumu takibi
- Sipariş teslimi
- Masa temizleme işaretleme
- Müşteri hizmetleri
- Diğer roller arası geçiş (varsa)

#### 2.4 KASİYER (Cashier)
**Giriş Yöntemi**: Kullanıcı adı
**Yetkiler**:
- Ödeme işlemleri
- Masa ödeme durumu güncelleme
- Günlük kasa raporu
- Diğer roller arası geçiş (varsa)

## 🗄️ VERİTABANI TASARIMI

### Ana Tablolar

#### 1. businesses (İşletmeler)
```sql
CREATE TABLE businesses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. users (Kullanıcılar - Çalışanlar)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    roles JSON NOT NULL, -- ['admin', 'chef', 'waiter', 'cashier']
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT, -- Admin kullanıcı ID'si
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 3. tables (Masalar)
```sql
CREATE TABLE tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    table_number VARCHAR(10) NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    UNIQUE KEY unique_table_business (business_id, table_number)
);
```

#### 4. menu_categories (Menü Kategorileri)
```sql
CREATE TABLE menu_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);
```

#### 5. menu_items (Menü Ürünleri)
```sql
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INT DEFAULT 15, -- dakika
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);
```

#### 6. orders (Siparişler)
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    table_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    customer_notes TEXT,
    staff_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);
```

#### 7. order_items (Sipariş Kalemleri)
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
```

#### 8. payments (Ödemeler)
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'digital') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    processed_by INT, -- Kasiyer kullanıcı ID'si
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);
```

#### 9. notifications (Bildirimler)
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    user_id INT NULL, -- NULL ise tüm çalışanlara
    order_id INT NULL,
    type ENUM('order_new', 'order_ready', 'payment_request', 'table_cleaning', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### 10. table_sessions (Masa Oturumları)
```sql
CREATE TABLE table_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id)
);
```

## 🔌 API ENDPOİNTLERİ

### Kimlik Doğrulama
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Müşteri API'leri
```
GET  /api/customer/menu/:businessId
POST /api/customer/orders
GET  /api/customer/orders/:orderId
GET  /api/customer/orders/table/:tableId
POST /api/customer/payment-request
GET  /api/customer/notifications/:tableId
```

### Çalışan API'leri
```
# Çalışan Yönetimi (Admin)
GET    /api/staff/users
POST   /api/staff/users
PUT    /api/staff/users/:id
DELETE /api/staff/users/:id

# Menü Yönetimi (Admin)
GET    /api/staff/menu
POST   /api/staff/menu
PUT    /api/staff/menu/:id
DELETE /api/staff/menu/:id

# Sipariş Yönetimi
GET    /api/staff/orders
PUT    /api/staff/orders/:id/status
GET    /api/staff/orders/:id

# Masa Yönetimi
GET    /api/staff/tables
POST   /api/staff/tables
PUT    /api/staff/tables/:id
DELETE /api/staff/tables/:id

# Ödeme İşlemleri
POST   /api/staff/payments
GET    /api/staff/payments

# Raporlar (Admin)
GET    /api/staff/reports/daily
GET    /api/staff/reports/weekly
GET    /api/staff/reports/monthly
```

### Bildirimler (WebSocket)
```
Socket Events:
- order:new
- order:status_changed
- payment:request
- notification:new
```

## 📱 UYGULAMA ÖZELLİKLERİ

### Müşteri Web Uygulaması
1. **QR Kod Okutma**: Masa bazlı otomatik giriş
2. **Menü Görüntüleme**: Kategorilere ayrılmış ürün listesi
3. **Sepet Yönetimi**: Ürün ekleme/çıkarma, miktar değiştirme
4. **Sipariş Verme**: Tek tıkla sipariş gönderme
5. **Sipariş Takibi**: Gerçek zamanlı durum güncellemeleri
6. **Ödeme Talebi**: Masaya ödeme için çağrı
7. **Bildirimler**: Sipariş durumu bildirimleri

### Çalışan Mobil Uygulaması
1. **Rol Tabanlı Dashboard**: Her rol için özel arayüz
2. **Hızlı Rol Değiştirme**: Üst menüde rol geçiş butonları
3. **Gerçek Zamanlı Bildirimler**: Tüm roller için birleşik bildirim sistemi
4. **Sipariş Yönetimi**: Rol bazlı sipariş işlemleri
5. **Masa Takibi**: Masa durumu ve temizlik işlemleri
6. **Raporlama**: Admin için detaylı raporlar

## 🔄 İŞ AKIŞI

### Müşteri Sipariş Süreci
1. Müşteri QR kodu okutur
2. Sistem masa bilgisini alır ve menüyü gösterir
3. Müşteri ürünleri sepete ekler
4. Sipariş verilir ve çalışanlara bildirim gider
5. Şef siparişi hazırlar, durumu günceller
6. Garson siparişi teslim eder
7. Müşteri ödeme talebi gönderir
8. Kasiyer masaya gelir, ödeme alır
9. Masa temizlenir, yeni müşteriler için hazır hale gelir

### Çalışan İş Akışı
1. Çalışan kullanıcı adı ile giriş yapar
2. Sistem kullanıcının rollerini yükler
3. Ana rol dashboard'ı gösterilir
4. Çalışan ihtiyaca göre rol değiştirebilir
5. Her rolde ilgili işlemleri yapar
6. Bildirimler tüm roller için görünür
7. Admin işletme yönetimi yapar

## 🚀 GELİŞTİRME PLANI

### Faz 1: Temel Altyapı (2 hafta)
- [ ] Veritabanı şeması oluşturma
- [ ] Node.js API temel yapısı
- [ ] JWT kimlik doğrulama
- [ ] Temel CRUD işlemleri

### Faz 2: Müşteri Uygulaması (3 hafta)
- [ ] QR kod okutma sistemi
- [ ] Menü görüntüleme
- [ ] Sepet ve sipariş sistemi
- [ ] Gerçek zamanlı bildirimler

### Faz 3: Çalışan Uygulaması (4 hafta)
- [ ] Rol tabanlı dashboard'lar
- [ ] Sipariş yönetimi
- [ ] Bildirim sistemi
- [ ] Admin paneli

### Faz 4: Gelişmiş Özellikler (2 hafta)
- [ ] Raporlama sistemi
- [ ] Masa yönetimi
- [ ] Ödeme entegrasyonu
- [ ] Test ve optimizasyon

## 🔒 GÜVENLİK ÖNLEMLERİ

1. **JWT Token**: Güvenli kimlik doğrulama
2. **Role-Based Access Control**: Rol bazlı yetkilendirme
3. **Input Validation**: Tüm girişlerin doğrulanması
4. **SQL Injection Koruması**: Parametreli sorgular
5. **CORS Ayarları**: Güvenli cross-origin istekleri
6. **Rate Limiting**: API istek limitleri

## 📊 PERFORMANS HEDEFLERİ

- **Sayfa Yükleme**: < 2 saniye
- **API Yanıt Süresi**: < 500ms
- **Gerçek Zamanlı Bildirim**: < 1 saniye
- **Eş Zamanlı Kullanıcı**: 1000+ kullanıcı
- **Veritabanı Sorgu Süresi**: < 100ms

## 🧪 TEST STRATEJİSİ

1. **Unit Tests**: Bireysel fonksiyon testleri
2. **Integration Tests**: API endpoint testleri
3. **E2E Tests**: Kullanıcı senaryo testleri
4. **Performance Tests**: Yük ve stres testleri
5. **Security Tests**: Güvenlik açığı taramaları

## 📈 ÖLÇEKLENEBİLİRLİK

### Dikey Ölçeklendirme
- Daha güçlü sunucu donanımı
- Veritabanı optimizasyonu
- Cache stratejileri

### Yatay Ölçeklendirme
- Load balancer kullanımı
- Mikroservis mimarisi
- Veritabanı sharding

## 🎨 KULLANICI DENEYİMİ

### Tasarım Prensipleri
- **Basitlik**: Karmaşık işlemler için basit arayüz
- **Hız**: Minimum tıklama ile maksimum işlem
- **Görsel Geri Bildirim**: Her işlem için görsel onay
- **Erişilebilirlik**: Tüm kullanıcılar için uygun tasarım

### Responsive Tasarım
- Mobil öncelikli yaklaşım
- Tablet ve desktop uyumluluğu
- Touch-friendly arayüzler

## 📋 SONUÇ

Bu proje, modern restoran işletmelerinin dijital dönüşüm ihtiyaçlarını karşılayacak kapsamlı bir çözümdür. Rol tabanlı çalışan sistemi, QR kod tabanlı müşteri deneyimi ve gerçek zamanlı bildirimler ile işletme verimliliğini artıracaktır.

Proje, Node.js, React ve MySQL teknolojileri kullanılarak geliştirilecek ve farklı büyüklükteki işletmelere uyum sağlayacak şekilde tasarlanmıştır.

---

**Proje Başlangıç Tarihi**: [Tarih]  
**Tahmini Tamamlanma**: [Tarih]  
**Geliştirici**: [İsim]  
**Versiyon**: 1.0.0
