# Sipariş Sistemi

Modern React tabanlı restoran sipariş yönetim sistemi.

## 🚀 Özellikler

- React 18 ile modern UI/UX
- Tailwind CSS ile responsive tasarım
- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Nginx ile production deployment

## 🛠️ Teknolojiler

- **Frontend**: React 18, React Router, Tailwind CSS
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx

---


## 📦 Kurulum

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

### Docker ile Çalıştırma

```bash
# Docker'ı başlat
npm run docker

# Development mode
npm run docker:dev

# Sadece build
npm run docker:build

# Container'ı durdur
npm run docker:down
```

### Manuel Docker Komutları

```bash
# Image build et
docker build -t order-system .

# Container çalıştır
docker run -p 3000:80 order-system

# Docker Compose ile çalıştır
docker-compose up -d
```

## 🌐 Erişim

- **Development**: http://localhost:3000
- **Docker Production**: http://localhost:3000

## 🔧 Environment Variables

`.env` dosyası oluşturun ve `env.example` dosyasındaki değişkenleri kopyalayın:

```bash
cp env.example .env
```

## 🚀 CI/CD

Proje GitHub Actions ile otomatik CI/CD pipeline'a sahiptir:

- **Test**: Her push/PR'da testler çalışır
- **Build**: Docker image otomatik build edilir
- **Deploy**: Main branch'e push'ta otomatik deploy

---


## 📁 Proje Yapısı

```
├── src/               # React kaynak kodları
├── public/            # Public dosyalar
├── .github/workflows/ # CI/CD workflows
├── Dockerfile         # Docker konfigürasyonu
├── docker-compose.yml # Docker Compose
└── nginx.conf         # Web server konfigürasyonu
```

## 🤝 Katkıda Bulunma

1. Repository'yi fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişiklikleri commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---


# Order System

Modern React-based restaurant order management system.

## 🚀 Features

- Modern UI/UX with React 18
- Responsive design with Tailwind CSS
- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Production deployment with Nginx

## 🛠️ Technologies

- **Frontend**: React 18, React Router, Tailwind CSS
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx

## 📦 Installation

### Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Running with Docker

```bash
# Start Docker
npm run docker

# Development mode
npm run docker:dev

# Build only
npm run docker:build

# Stop container
npm run docker:down
```

### Manual Docker Commands

```bash
# Build image
docker build -t order-system .

# Run container
docker run -p 3000:80 order-system

# Run with Docker Compose
docker-compose up -d
```

## 🌐 Access

- **Development**: http://localhost:3000
- **Docker Production**: http://localhost:3000

## 🔧 Environment Variables

Create `.env` file and copy variables from `env.example`:

```bash
cp env.example .env
```

## 🚀 CI/CD

The project has an automated CI/CD pipeline with GitHub Actions:

- **Test**: Tests run on every push/PR
- **Build**: Docker image is automatically built
- **Deploy**: Automatic deploy on main branch push


## 📁 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── context/       # Context API
│   └── assets/        # Static files
├── public/            # Public files
├── .github/workflows/ # CI/CD workflows
├── Dockerfile         # Production Docker image
├── Dockerfile.dev     # Development Docker image
├── docker-compose.yml # Docker Compose configuration
└── nginx.conf         # Nginx configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request
