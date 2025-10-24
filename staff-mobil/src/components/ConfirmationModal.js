/**
 * CONFIRMATION MODAL - Web Uyumlu Onay Modalı
 * 
 * React Native Web'de Alert.alert çalışmadığı için
 * web uyumlu onay modal sistemi
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { Colors } from '../constants/Colors';

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  type = 'default', // 'default', 'danger', 'warning'
  isLoading = false,
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'danger':
        return styles.dangerButton;
      case 'warning':
        return styles.warningButton;
      default:
        return styles.primaryButton;
    }
  };

  const getButtonTextStyle = () => {
    switch (type) {
      case 'danger':
        return styles.dangerButtonText;
      case 'warning':
        return styles.warningButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, getButtonStyle(), isLoading && styles.disabledButton]}
                onPress={onConfirm}
                disabled={isLoading}
              >
                <Text style={[getButtonTextStyle(), isLoading && styles.disabledButtonText]}>
                  {isLoading ? 'İşleniyor...' : confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10000,
    width: '100vw',
    height: '100vh',
    display: 'flex',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    zIndex: 10001,
    position: 'relative',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
    elevation: 8,
    zIndex: 10002,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  warningButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default ConfirmationModal;
