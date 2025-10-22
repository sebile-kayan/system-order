/**
 * QR CODE SERVICE - QR Kod Oluşturma ve Yönetimi   MOCK KODLARI KULLANILIYOR
 * 
 * Her masa için benzersiz QR kod oluşturur ve yönetir.
 * QR kod formatı: https://restoran.com/masa/{business_code}/{table_number}
 * 
 * Örnek: https://restoran.com/masa/REST001/5
 */

import { Alert } from 'react-native';

// QR kod oluşturma fonksiyonu
export const generateQRCode = (businessCode, tableNumber) => {
  // QR kod formatı: https://restoran.com/masa/{business_code}/{table_number}
  const qrCodeUrl = `https://restoran.com/masa/${businessCode}/${tableNumber}`;
  return qrCodeUrl;
};

// QR kod doğrulama fonksiyonu
export const validateQRCode = (qrCodeUrl) => {
  try {
    const url = new URL(qrCodeUrl);
    
    // URL formatını kontrol et
    if (url.hostname !== 'restoran.com') {
      return { valid: false, error: 'Geçersiz QR kod formatı' };
    }
    
    // Path'i parse et: /masa/{business_code}/{table_number}
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length !== 3 || pathParts[0] !== 'masa') {
      return { valid: false, error: 'Geçersiz QR kod formatı' };
    }
    
    const businessCode = pathParts[1];
    const tableNumber = pathParts[2];
    
    return {
      valid: true,
      businessCode,
      tableNumber,
      qrCodeUrl
    };
  } catch (error) {
    return { valid: false, error: 'Geçersiz QR kod' };
  }
};

// QR kod görüntüleme için metin oluşturma
export const generateQRDisplayText = (businessCode, tableNumber) => {
  return `Masa ${tableNumber}\nQR: ${generateQRCode(businessCode, tableNumber)}`;
};

// QR kod oluşturma onayı
export const confirmQRCodeGeneration = (tableNumber, businessCode) => {
  return new Promise((resolve) => {
    Alert.alert(
      'QR Kod Oluşturuldu',
      `Masa ${tableNumber} için QR kod oluşturuldu.\n\nQR Kod: ${generateQRCode(businessCode, tableNumber)}\n\nBu QR kodu yazdırabilir veya masa üzerine yapıştırabilirsiniz.`,
      [
        {
          text: 'Tamam',
          onPress: () => resolve(true)
        }
      ]
    );
  });
};

// QR kod test fonksiyonu (geliştirme için)
export const testQRCode = (businessCode, tableNumber) => {
  const qrCode = generateQRCode(businessCode, tableNumber);
  const validation = validateQRCode(qrCode);
  
  console.log('QR Kod Test:', {
    businessCode,
    tableNumber,
    qrCode,
    validation
  });
  
  return { qrCode, validation };
};

export default {
  generateQRCode,
  validateQRCode,
  generateQRDisplayText,
  confirmQRCodeGeneration,
  testQRCode
};
