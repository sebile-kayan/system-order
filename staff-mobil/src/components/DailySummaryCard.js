/**
 * DAILY SUMMARY CARD - Günlük Özet Kartı
 * 
 * Dashboard'larda kullanılan günlük özet istatistik kartları için ortak bileşen.
 * Sayı ve etiket desteği ile özelleştirilebilir renk seçenekleri sunar.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DailySummaryCard = ({ number, label, color = '#1e3a8a' }) => {
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
    backgroundColor: '#f9fafb',
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
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default DailySummaryCard;
