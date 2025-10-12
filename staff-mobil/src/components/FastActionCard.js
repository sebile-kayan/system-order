/**
 * FAST ACTION CARD - Hızlı İşlem Kartı
 * 
 * Dashboard'larda kullanılan hızlı işlem butonları için ortak bileşen.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FastActionCard = ({ 
  title, 
  description, 
  icon, 
  color = '#dc2626', 
  onPress,
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionCard,
        disabled && styles.disabledActionCard
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disabledActionCard: {
    opacity: 0.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 24,
    color: '#ffffff',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default FastActionCard;
