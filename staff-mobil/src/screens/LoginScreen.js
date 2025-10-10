/**
 * LOGIN SCREEN - Giriş Ekranı
 * 
 * Bu ekran çalışanların kullanıcı adı ve şifre ile giriş yapmasını sağlar.
 * Admin tarafından atanan kullanıcı adı ile giriş yapılır. Giriş başarılı olduktan sonra
 * kullanıcının rollerine göre uygun dashboard'a yönlendirilir.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adı ve şifre giriniz.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login({ username: username.trim(), password });
      
      if (success) {
        // Giriş başarılı, navigation otomatik olarak AuthContext tarafından yönetilecek
        // Burada manuel navigation yapmaya gerek yok
      } else {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Restoran Yönetimi</Text>
          <Text style={styles.subtitle}>Çalışan Girişi</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Kullanıcı adınızı giriniz"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Şifrenizi giriniz"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Giriş bilgilerinizi admin'den alabilirsiniz
          </Text>
          <Text style={styles.testUsersTitle}>Test Kullanıcıları (Şifre: 123):</Text>
          <Text style={styles.testUsersText}>
            • admin / 123 (Sadece Admin){'\n'}
            • chef / 123 (Sadece Şef){'\n'}
            • waiter / 123 (Sadece Garson){'\n'}
            • cashier / 123 (Sadece Kasiyer){'\n'}
            • chef_waiter / 123 (Şef + Garson){'\n'}
            • waiter_cashier / 123 (Garson + Kasiyer){'\n'}
            • all_roles / 123 (Tüm Roller - ROL DEĞİŞTİRME İÇİN)
          </Text>
          <Text style={styles.testNote}>
            💡 Rol değiştirme butonlarının hepsini görmek için "all_roles" kullanıcısı ile giriş yapın!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  loginButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  testUsersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  testUsersText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'left',
    lineHeight: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testNote: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
});

export default LoginScreen;
