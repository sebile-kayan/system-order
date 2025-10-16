/**
 * MODAL - Ortak Modal Bileşeni
 * 
 * Uygulama genelinde kullanılan tüm modaller için ortak bileşen.
 * Farklı boyutlar ve animasyonlar destekler.
 */
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from './Button';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeButtonText = 'Kapat',
  primaryButtonText,
  onPrimaryPress,
  primaryButtonStyle,
  secondaryButtonText,
  onSecondaryPress,
  scrollable = false,
  style = {},
  ...props
}) => {
  const getModalStyle = () => {
    const baseStyle = [styles.modalContent, styles[`${size}Modal`]];
    return [...baseStyle, style];
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return children;
  };

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      {...props}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={getModalStyle()}>
            {/* Header */}
            {title && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Content */}
            {renderContent()}
            
            {/* Footer */}
            {(primaryButtonText || secondaryButtonText || closeButtonText) && (
              <View style={styles.modalFooter}>
                <View style={styles.modalButtons}>
                  {secondaryButtonText && (
                    <Button
                      title={secondaryButtonText}
                      variant="outline"
                      size="medium"
                      onPress={onSecondaryPress}
                      style={styles.modalButton}
                    />
                  )}
                  
                  {primaryButtonText && (
                    <Button
                      title={primaryButtonText}
                      variant="primary"
                      size="medium"
                      onPress={onPrimaryPress}
                      style={[styles.modalButton, primaryButtonStyle]}
                    />
                  )}
                  
                  {!primaryButtonText && !secondaryButtonText && showCloseButton && (
                    <Button
                      title={closeButtonText}
                      variant="outline"
                      size="medium"
                      onPress={onClose}
                      style={styles.modalButton}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
  },
  
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radius.xl,
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.25)',
    elevation: 8,
    zIndex: 10000,
  },
  
  // Sizes
  smallModal: {
    maxWidth: 300,
  },
  mediumModal: {
    maxWidth: 500,
  },
  largeModal: {
    maxWidth: 800,
    maxHeight: '95%',
  },
  fullModal: {
    width: '100%',
    maxHeight: '100%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  modalTitle: {
    ...Typography.styles.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  closeButtonText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray500,
    fontWeight: Typography.fontWeight.bold,
  },
  
  scrollView: {
    maxHeight: 400,
  },
  
  modalFooter: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  modalButton: {
    flex: 1,
  },
});

export default Modal;
