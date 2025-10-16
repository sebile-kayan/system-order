/**
 * BUTTON - Ortak Buton Bileşeni
 * 
 * Uygulama genelinde kullanılan tüm butonlar için ortak bileşen.
 * Farklı varyantlar ve boyutlar destekler.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  style = {},
  textStyle = {},
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`${variant}Button`], styles[`${size}Button`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseTextStyle = [
      styles.buttonText,
      styles[`${variant}ButtonText`],
      styles[`${size}ButtonText`]
    ];
    
    if (disabled || loading) {
      baseTextStyle.push(styles.disabledButtonText);
    }
    
    return [...baseTextStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.white : Colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  
  // Sizes
  smallButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 32,
  },
  mediumButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 40,
  },
  largeButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 48,
  },
  
  // States
  disabledButton: {
    backgroundColor: Colors.gray200,
    borderColor: Colors.gray200,
  },
  
  // Text Styles
  buttonText: {
    ...Typography.styles.button,
    textAlign: 'center',
  },
  smallButtonText: {
    ...Typography.styles.buttonSmall,
  },
  mediumButtonText: {
    ...Typography.styles.button,
  },
  largeButtonText: {
    ...Typography.styles.button,
    fontSize: Typography.fontSize.lg,
  },
  
  // Text Variants
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
  },
  outlineButtonText: {
    color: Colors.primary,
  },
  ghostButtonText: {
    color: Colors.primary,
  },
  dangerButtonText: {
    color: Colors.white,
  },
  disabledButtonText: {
    color: Colors.gray400,
  },
  
  // Icon
  buttonIcon: {
    marginRight: Spacing.sm,
    fontSize: Typography.fontSize.base,
  },
});

export default Button;
