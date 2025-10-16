/**
 * CARD - Ortak Kart Bileşeni
 * 
 * Uygulama genelinde kullanılan tüm kartlar için ortak bileşen.
 * Farklı varyantlar ve gölge seviyeleri destekler.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';

const Card = ({
  children,
  variant = 'default',
  shadow = 'md',
  style = {},
  ...props
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[`${variant}Card`], styles[`${shadow}Shadow`]];
    return [...baseStyle, style];
  };

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  // Variants
  defaultCard: {
    backgroundColor: Colors.surface,
  },
  elevatedCard: {
    backgroundColor: Colors.surface,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filledCard: {
    backgroundColor: Colors.gray50,
  },
  
  // Shadow Levels
  smShadow: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  mdShadow: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  lgShadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  xlShadow: {
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  noShadow: {
    boxShadow: 'none',
    elevation: 0,
  },
});

export default Card;
