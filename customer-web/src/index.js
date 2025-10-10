/**
 * INDEX.JS - Uygulama Giriş Noktası
 * 
 * Bu dosya React uygulamasının ana giriş noktasıdır. DOM'a render eder ve Service Worker'ı kaydeder.
 * PWA özelliklerini etkinleştirir ve uygulama başlatma işlemlerini yönetir.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA Service Worker başarıyla kaydedildi
