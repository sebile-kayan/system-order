/**
 * HEADER - Dashboard Başlığı
 * 
 * Tüm dashboard'larda kullanılan ortak header bileşeni.
 * Kullanıcı bilgileri, işletme adı, aktif rol ve çıkış butonu içerir.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const Header = ({ 
  user, 
  business, 
  currentRole, 
  onLogout, 
  badgeText = null, 
  badgeColor = Colors.error,
  sticky = false  // Yeni prop: sticky header için
}) => {
  const insets = useSafeAreaInsets();
  
  // Sticky header için absolute positioning, normal header için relative
  const headerStyle = sticky ? {
    paddingTop: insets.top,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 8
  } : {
    paddingTop: insets.top
  };
  
  return (
    <View style={[styles.header, headerStyle]}>
      <View style={styles.headerContent}>
        <Text style={styles.welcomeText}>
          Hoş Geldin, {user?.full_name || 'Kullanıcı'}!
        </Text>
        <Text style={styles.businessName}>
          {business?.name || 'İşletme Adı'}
        </Text>
        {currentRole && (
          <Text style={styles.currentRoleText}>
            Aktif Rol: {currentRole}
          </Text>
        )}
      </View>
      <View style={styles.headerRight}>
        {badgeText && (
          <View style={[styles.roleBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.roleBadgeText}>{badgeText}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 150,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  headerContent: {
    flex: 1,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  businessName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  currentRoleText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    backgroundColor: Colors.gray50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 30,
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  roleBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
  },
  logoutButtonText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Header;
