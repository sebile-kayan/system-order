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
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthRolesContext';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

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

        <Card style={styles.form}>
          <Input
            label="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
            placeholder="Kullanıcı adınızı giriniz"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Kullanıcı adı"
            testID="username-input"
          />

          <Input
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Şifrenizi giriniz"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Şifre"
            testID="password-input"
          />

          <Button
            title={isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            style={styles.loginButton}
          />
        </Card>

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
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  title: {
    ...Typography.styles.h1,
    color: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
  },
  form: {
    padding: Spacing['2xl'],
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  footerText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  testUsersTitle: {
    ...Typography.styles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  testUsersText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    textAlign: 'left',
    lineHeight: 16,
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testNote: {
    ...Typography.styles.caption,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.errorLight + '20',
    borderRadius: Spacing.radius.sm,
    borderWidth: 1,
    borderColor: Colors.errorLight,
  },
});

export default LoginScreen;
