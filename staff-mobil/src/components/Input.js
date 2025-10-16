/**
 * INPUT - Ortak Input Bileşeni
 * 
 * Uygulama genelinde kullanılan tüm input'lar için ortak bileşen.
 * Farklı varyantlar ve durumlar destekler.
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  style = {},
  inputStyle = {},
  ...props
}) => {
  const getInputStyle = () => {
    const baseStyle = [styles.input, styles[`${multiline ? 'multiline' : 'single'}Input`]];
    
    if (error) {
      baseStyle.push(styles.errorInput);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledInput);
    }
    
    return [...baseStyle, inputStyle];
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, error && styles.errorLabel]}>
          {label}
        </Text>
      )}
      
      <TextInput
        style={getInputStyle()}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  
  label: {
    ...Typography.styles.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  
  errorLabel: {
    color: Colors.error,
  },
  
  input: {
    ...Typography.styles.body,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    paddingHorizontal: Spacing.inputPadding,
    paddingVertical: Spacing.inputPadding,
    color: Colors.textPrimary,
  },
  
  singleInput: {
    height: 48,
  },
  
  multilineInput: {
    minHeight: 80,
    paddingTop: Spacing.inputPadding,
  },
  
  errorInput: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight + '10',
  },
  
  disabledInput: {
    backgroundColor: Colors.gray100,
    color: Colors.gray400,
    borderColor: Colors.gray200,
  },
  
  errorText: {
    ...Typography.styles.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default Input;
