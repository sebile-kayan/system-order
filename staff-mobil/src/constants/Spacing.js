/** CONSTANTS KLASÖRÜNÜN AMACI: Tutarlı tasarım sistemi. Tek yerden değiştirilebilir değerler.
 * SPACING - Boşluk Sistemi
 * 
 * Uygulama genelinde kullanılan tüm padding, margin ve gap değerlerini merkezi olarak yönetir.
 * Tutarlı boşluk kullanımı sağlar.
 */

export const Spacing = {
  // Temel Boşluklar (4px base)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  
  // Özel Boşluklar
  screenPadding: 20,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  
  // Border Radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },
  
  // Gölge Değerleri
  shadow: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

export default Spacing;
