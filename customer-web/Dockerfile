#Container Oluşturma → Dockerfile  AMAÇ: DOCKER VE CONTAİNER NASIL KURULUR?

# Multi-stage build for React application
FROM node:18-alpine as build  
#Linux container'ı oluşturur ve Node.js 18 kurar

# Set working directory
WORKDIR /app
# Container içinde /app klasörü oluşturur

# Copy package files
COPY package*.json ./
# package.json ve package-lock.json dosyalarını container'a kopyalar 

# Install all dependencies (including dev dependencies for build)
RUN npm ci
# package.json'daki tüm bağımlılıkları yükler: Yüklenenler:
#React
#React-DOM
#React-Router-DOM
#Tailwind CSS
#Web-vitals
#UUID

# Copy source code
COPY . .
#Tüm src/ klasörünü container'a (/app) kopyalar

# Build the application
RUN npm run build
#React uygulamasını production için build eder
#Sonuç: build/ klasörü oluşur (HTML, CSS, JS dosyaları)

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Production stage
FROM nginx:alpine
#Yeni bir container oluşturur ve Nginx web server kurar

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
