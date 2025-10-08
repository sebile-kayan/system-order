import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function CashierDashboard() {
  const { user, availableRoles, switchRole, logout } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Kasiyer Paneli</Title>
            <Paragraph>Hoş geldin {user?.full_name}!</Paragraph>
          </Card.Content>
        </Card>

        {/* Rol Değiştirme */}
        {availableRoles.length > 1 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Roller</Title>
              {availableRoles.map((role) => (
                <Button
                  key={role}
                  mode="outlined"
                  onPress={() => switchRole(role)}
                  style={styles.roleButton}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Kasiyer İşlemleri */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Ödeme Yönetimi</Title>
            <Button mode="contained" style={styles.menuButton}>
              Bekleyen Ödemeler
            </Button>
            <Button mode="contained" style={styles.menuButton}>
              Ödeme Al
            </Button>
            <Button mode="contained" style={styles.menuButton}>
              Günlük Rapor
            </Button>
          </Card.Content>
        </Card>

        <Button mode="outlined" onPress={logout} style={styles.logoutButton}>
          Çıkış Yap
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  roleButton: {
    marginVertical: 4,
  },
  menuButton: {
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});
