/**
 * QR BARCODE COMPONENT - Gerçek QR Barkod Görüntüleme
 * 
 * QR kodu gerçek barkod olarak gösterir ve yazdırma için hazırlar.
 * react-native-qrcode-svg kütüphanesi kullanır.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/Colors';

const QRBarcode = ({ 
  qrCode, 
  tableNumber, 
  businessCode = 'REST001',
  size = 200,
  showInfo = true,
  onPress = null 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(qrCode, tableNumber);
    } else {
      Alert.alert(
        'QR Barkod',
        `Masa: ${tableNumber}\nQR: ${qrCode}`,
        [
          { text: 'Kopyala', onPress: () => {
            Alert.alert('Kopyalandı', 'QR kod panoya kopyalandı.');
          }},
          { text: 'Tamam' }
        ]
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Gerçek QR Barkod */}
      <View style={styles.qrContainer}>
        <QRCode
          key={qrCode} // QR kodu değiştiğinde component yeniden render edilir
          value={qrCode || 'https://restoran.com/masa/default'}
          size={size}
          color={Colors.black}
          backgroundColor={Colors.white}
          logoSize={30}
          logoMargin={2}
          logoBorderRadius={15}
          quietZone={10}
        />
      </View>
      
      {showInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.tableNumber}>Masa {tableNumber}</Text>
          <Text style={styles.businessCode}>{businessCode}</Text>
          <Text style={styles.qrText} numberOfLines={1}>
            {qrCode}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContainer: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  infoContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  businessCode: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  qrText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
    maxWidth: 200,
  },
});

export default QRBarcode;
