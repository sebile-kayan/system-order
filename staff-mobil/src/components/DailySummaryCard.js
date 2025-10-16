/**
 * DAILY SUMMARY CARD - Günlük Özet Kartı
 * 
 * Dashboard'larda kullanılan günlük özet istatistik kartları için ortak bileşen.
 * Sayı ve etiket desteği ile özelleştirilebilir renk seçenekleri sunar.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const DailySummaryCard = ({ number, label, color = Colors.primary }) => {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default DailySummaryCard;
