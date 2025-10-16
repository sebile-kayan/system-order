/** CONSTANTS KLASÖRÜNÜN AMACI: Tutarlı tasarım sistemi. Tek yerden değiştirilebilir değerler.
 * TYPOGRAPHY - Tipografi Sistemi
 * 
 * Uygulama genelinde kullanılan tüm font boyutları, ağırlıkları ve satır yüksekliklerini merkezi olarak yönetir.
 * Tutarlı tipografi kullanımı sağlar.
 */

export const Typography = {
  // Font Boyutları
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Font Ağırlıkları
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Satır Yükseklikleri
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 28,
  },
  
  // Önceden Tanımlanmış Stiller
  styles: {
    // Başlık Stilleri
    h1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    
    // Metin Stilleri
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    
    // Buton Stilleri
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
    },
    
    // Label Stilleri
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
  },
};

export default Typography;
