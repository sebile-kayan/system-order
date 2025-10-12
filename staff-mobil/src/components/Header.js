/**
 * HEADER - Dashboard Başlığı
 * 
 * Tüm dashboard'larda kullanılan ortak header bileşeni.
 * Kullanıcı bilgileri, işletme adı, aktif rol ve çıkış butonu içerir.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ 
  user, 
  business, 
  currentRole, 
  onLogout, 
  badgeText = null, 
  badgeColor = '#dc2626',
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
          <Text style={styles.logoutButtonText}>⏻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 1,
  },
  currentRoleText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
