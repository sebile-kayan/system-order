/**
 * WAITER DASHBOARD - Garson Ana Ekranı
 *
 * Bu ekran garson rolündeki kullanıcılar için tasarlanmıştır. Masa durumu takibi,
 * sipariş teslimi, müşteri hizmetleri ve masa yönetimi araçlarına erişim sağlar.
 */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import {
  useAuth,
  getAvailableRoles,
  getRoleConfig,
} from "../../context/AuthRolesContext";
import { Colors } from "../../constants/Colors";
import Header from "../../components/Header";
import DailySummaryCard from "../../components/DailySummaryCard";

const WaiterDashboard = () => {
  const { user, business, currentRole, hasRole, switchRole, logout } =
    useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("tables"); // 'tables' veya 'food'
  const [tables, setTables] = useState([
    {
      id: 1,
      tableNumber: "Masa 1",
      status: "empty", // Resimdeki: Masa BOŞ
      customerCount: 0,
      lastActivity: "15 dk önce",
      orderItems: [],
    },
    {
      id: 2,
      tableNumber: "Masa 2",
      status: "occupied", // Resimdeki: Masa DOLU
      customerCount: 2,
      lastActivity: "5 dk önce",
      orderItems: ["Margherita Pizza x1", "Salata x1"],
    },
    {
      id: 3,
      tableNumber: "Masa 3",
      status: "occupied", // Müşteri yemek yiyor
      customerCount: 4,
      lastActivity: "2 dk önce",
      orderItems: ["Adana Kebab x2", "Ayran x2", "Salata x1"],
    },
    {
      id: 4,
      tableNumber: "Masa 4",
      status: "payment_completed", // Resimdeki: Masa ÖDEME ALINDI
      customerCount: 3,
      lastActivity: "1 dk önce",
      orderItems: ["Lahmacun x3", "Ayran x3"],
    },
    {
      id: 5,
      tableNumber: "Masa 5",
      status: "cleaning", // Resimdeki: Masa TEMİZLENDİ
      customerCount: 2,
      lastActivity: "3 dk önce",
      orderItems: ["Pizza x2", "Kola x2"],
    },
  ]);

  // Yemek durumu mock verileri
  const [foodOrders, setFoodOrders] = useState([
    {
      id: 1,
      tableNumber: "Masa 2",
      orderId: "ORD-001",
      items: [
        {
          name: "Margherita Pizza",
          quantity: 1,
          status: "ready",
          time: "5 dk önce",
        },
        {
          name: "Caesar Salata",
          quantity: 1,
          status: "preparing",
          time: "3 dk önce",
        },
      ],
      totalAmount: 125.5,
      orderTime: "10 dk önce",
      estimatedTime: "2 dk",
    },
    {
      id: 2,
      tableNumber: "Masa 3",
      orderId: "ORD-002",
      items: [
        {
          name: "Adana Kebab",
          quantity: 2,
          status: "ready",
          time: "2 dk önce",
        },
        { name: "Ayran", quantity: 2, status: "ready", time: "1 dk önce" },
        {
          name: "Mevsim Salata",
          quantity: 1,
          status: "preparing",
          time: "1 dk önce",
        },
      ],
      totalAmount: 245.0,
      orderTime: "15 dk önce",
      estimatedTime: "1 dk",
    },
    {
      id: 3,
      tableNumber: "Masa 4",
      orderId: "ORD-003",
      items: [
        { name: "Lahmacun", quantity: 3, status: "served", time: "5 dk önce" },
        { name: "Ayran", quantity: 3, status: "served", time: "5 dk önce" },
      ],
      totalAmount: 180.0,
      orderTime: "20 dk önce",
      estimatedTime: "Teslim edildi",
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // API'den güncel masa durumlarını çek
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getTableStatusColor = (table) => {
    switch (table.status) {
      case "empty":
        return Colors.gray500; // Boş Masalar: Gri renk
      case "occupied":
        return Colors.info; // Dolu Masalar: Mavi renk
      case "payment_completed":
        return Colors.warning; // Ödeme Alındı: Sarı renk
      case "cleaning":
        return Colors.success; // Temizlendi: Yeşil renk
      default:
        return Colors.gray500;
    }
  };

  const getTableStatusText = (table) => {
    switch (table.status) {
      case "empty":
        return "Boş";
      case "occupied":
        return "Dolu";
      case "payment_completed":
        return "Ödeme Alındı";
      case "cleaning":
        return "Temizlendi";
      default:
        return "Bilinmiyor";
    }
  };

  const getTableActionText = (table) => {
    switch (table.status) {
      case "empty":
        return "DOLU İŞARETLE";
      case "occupied":
        return null; // Dolu masalarda buton yok, sadece durum gösterimi
      case "payment_completed":
        return "MÜŞTERİ KALKTI TEMİZLENDİ İŞARETLE";
      case "cleaning":
        return "BOŞ İŞARETLE";
      default:
        return "Bekliyor";
    }
  };

  const handleTableAction = (table) => {
    if (table.status === "empty") {
      // Resimdeki: Masa BOŞ → "Dolu işaretle" → Masa DOLU
      Alert.alert(
        "Masa Dolu İşaretle",
        `${table.tableNumber} masasını dolu olarak işaretlemek istediğinizden emin misiniz?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "DOLU İŞARETLE",
            onPress: () => {
              setTables((prevTables) =>
                prevTables.map((t) =>
                  t.id === table.id
                    ? {
                        ...t,
                        status: "occupied",
                        customerCount: 1, // Varsayılan müşteri sayısı
                        lastActivity: "Şimdi",
                      }
                    : t
                )
              );
            },
          },
        ]
      );
    } else if (table.status === "occupied") {
      // Dolu masalarda hiçbir işlem yapılmaz, sadece durum gösterimi
      return;
    } else if (table.status === "payment_completed") {
      // Resimdeki: Masa ÖDEME ALINDI → "Müşteri Kalktı temizlendi işaretle" → Masa TEMİZLENDİ
      Alert.alert(
        "Müşteri Kalktı Temizlendi İşaretle",
        `${table.tableNumber} masasındaki müşteriler kalktı mı? Temizlik yapıldı mı?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "MÜŞTERİ KALKTI TEMİZLENDİ İŞARETLE",
            onPress: () => {
              setTables((prevTables) =>
                prevTables.map((t) =>
                  t.id === table.id
                    ? {
                        ...t,
                        status: "cleaning",
                        lastActivity: "Şimdi",
                      }
                    : t
                )
              );
            },
          },
        ]
      );
    } else if (table.status === "cleaning") {
      // Resimdeki: Masa TEMİZLENDİ → "Boş işaretle" → Masa BOŞ
      Alert.alert(
        "Masa Boş İşaretle",
        `${table.tableNumber} masası temizlendi mi? Masa boş olarak işaretlenecek.`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "BOŞ İŞARETLE",
            onPress: () => {
              setTables((prevTables) =>
                prevTables.map((t) =>
                  t.id === table.id
                    ? {
                        ...t,
                        status: "empty",
                        customerCount: 0,
                        orderItems: [],
                        lastActivity: "Şimdi",
                      }
                    : t
                )
              );
            },
          },
        ]
      );
    }
  };

  const roleButtons = [
    { id: "admin", name: "Yönetici", icon: "👑", color: Colors.error },
    { id: "chef", name: "Şef", icon: "👨‍🍳", color: Colors.warning },
    { id: "cashier", name: "Kasiyer", icon: "💰", color: Colors.secondary },
  ];

  const availableRoles = useMemo(() => {
    if (!user?.roles) return [];
    return roleButtons.filter((role) => user.roles.includes(role.id));
  }, [user?.roles]);

  const handleLogout = () => {
    // Direkt logout çağır
    logout();
  };

  const occupiedTables = tables.filter((table) => table.status === "occupied");
  const emptyTables = tables.filter((table) => table.status === "empty");
  const paymentCompletedTables = tables.filter(
    (table) => table.status === "payment_completed"
  );
  const cleaningTables = tables.filter((table) => table.status === "cleaning");

  return (
    <View style={styles.container}>
      {/* İçerik - Kaydırılabilir */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - Kaydırıldıkça kaybolacak */}
        <Header
          user={user}
          business={business}
          currentRole={currentRole}
          onLogout={handleLogout}
          badgeText={getRoleConfig(currentRole)?.badgeText}
          badgeColor={getRoleConfig(currentRole)?.color}
          sticky={false} // Header kaydırıldıkça kaybolacak
        />

        {/* Hızlı Rol Değiştirme */}
        {availableRoles.length > 0 && (
          <View style={styles.roleSwitchSection}>
            <Text style={styles.roleSwitchTitle}>Hızlı Rol Değiştirme</Text>
            <View style={styles.roleSwitchButtons}>
              {availableRoles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleSwitchButton,
                    { backgroundColor: role.color },
                    currentRole === role.id && styles.activeRoleButton,
                  ]}
                  onPress={() => switchRole(role.id)}
                >
                  <Text style={styles.roleSwitchIcon}>{role.icon}</Text>
                  <Text style={styles.roleSwitchText}>{role.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "tables" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("tables")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "tables" && styles.activeTabButtonText,
              ]}
            >
              🪑 Masa Durumu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "food" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("food")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "food" && styles.activeTabButtonText,
              ]}
            >
              🍽️ Yemek Durumu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Masa Durumu Tab */}
        {activeTab === "tables" && (
          <>
            {/* Servis Durumu */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Masa Durumu</Text>
              <View style={styles.statsGrid}>
                <DailySummaryCard
                  number={occupiedTables.length}
                  label="Dolu Masalar"
                  color={Colors.info}
                />
                <DailySummaryCard
                  number={paymentCompletedTables.length}
                  label="Ödeme Alındı - Temizlik Bekliyor"
                  color={Colors.warning}
                />
                <DailySummaryCard
                  number={cleaningTables.length}
                  label="Temizlik Yapılıyor"
                  color={Colors.success}
                />
                <DailySummaryCard
                  number={emptyTables.length}
                  label="Boş Masalar"
                  color={Colors.gray500}
                />
              </View>
            </View>

            {/* Boş Masalar - EN ÜSTTE */}
            {emptyTables.length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#f9fafb", borderLeftColor: "#6b7280" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#374151" }]}>
                  🪑 Boş Masalar{" "}
                </Text>
                {emptyTables.map((table) => (
                  <View
                    key={table.id}
                    style={[
                      styles.urgentCard,
                      { backgroundColor: "#f9fafb", borderColor: "#d1d5db" },
                    ]}
                  >
                    <View style={styles.urgentInfo}>
                      <Text
                        style={[styles.urgentTableNumber, { color: "#374151" }]}
                      >
                        {table.tableNumber}
                      </Text>
                      <Text style={[styles.urgentTime, { color: "#374151" }]}>
                        {table.lastActivity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.urgentButton,
                        { backgroundColor: "#6b7280" },
                      ]}
                      onPress={() => handleTableAction(table)}
                    >
                      <Text style={styles.urgentButtonText}>
                        Müşteri geldi- Dolu işaretle
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Dolu Masalar - Sadece Bilgilendirme */}
            {occupiedTables.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>🍽️ Dolu Masalar</Text>
                {occupiedTables.map((table) => (
                  <View key={table.id} style={styles.infoCard}>
                    <View style={styles.infoHeader}>
                      <Text style={styles.infoTableNumber}>
                        {table.tableNumber}
                      </Text>
                      <Text style={styles.infoStatus}>
                        Müşteri masada- Müdahale edilemez
                      </Text>
                    </View>
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoText}>
                        {table.customerCount} kişi • {table.lastActivity}
                      </Text>
                      {table.orderItems.length > 0 && (
                        <Text style={styles.infoText}>
                          Sipariş: {table.orderItems.join(", ")}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Ödeme Alındı Masalar - Resimdeki: Masa ÖDEME ALINDI */}
            {paymentCompletedTables.length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#fef3c7", borderLeftColor: "#f59e0b" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#92400e" }]}>
                  💰 Ödeme Alınmış Masalar
                </Text>
                {paymentCompletedTables.map((table) => (
                  <View
                    key={table.id}
                    style={[
                      styles.urgentCard,
                      { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
                    ]}
                  >
                    <View style={styles.urgentInfo}>
                      <Text
                        style={[styles.urgentTableNumber, { color: "#92400e" }]}
                      >
                        {table.tableNumber}
                      </Text>
                      <Text style={[styles.urgentTime, { color: "#92400e" }]}>
                        {table.lastActivity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.urgentButton,
                        { backgroundColor: "#f59e0b" },
                      ]}
                      onPress={() => handleTableAction(table)}
                    >
                      <Text style={styles.urgentButtonText}>
                        Müşteri kalktı - Temizlik yapılıyor işaretle
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Temizleniyor Masalar - Resimdeki: Masa TEMİZLENDİ */}
            {cleaningTables.length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#f0fdf4", borderLeftColor: "#10b981" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#065f46" }]}>
                  🧹 Temizlik Yapılan Masalar
                </Text>
                {cleaningTables.map((table) => (
                  <View
                    key={table.id}
                    style={[
                      styles.urgentCard,
                      { backgroundColor: "#f0fdf4", borderColor: "#6ee7b7" },
                    ]}
                  >
                    <View style={styles.urgentInfo}>
                      <Text
                        style={[styles.urgentTableNumber, { color: "#065f46" }]}
                      >
                        {table.tableNumber}
                      </Text>
                      <Text style={[styles.urgentTime, { color: "#065f46" }]}>
                        {table.lastActivity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.urgentButton,
                        { backgroundColor: "#10b981" },
                      ]}
                      onPress={() => handleTableAction(table)}
                    >
                      <Text style={styles.urgentButtonText}>
                        Temizlik bitti - Masa boş işaretle
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Yemek Durumu Tab */}
        {activeTab === "food" && (
          <>
            {/* Yemek Durumu İstatistikleri */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Yemek Durumu</Text>
              <View style={styles.statsGrid}>
                <DailySummaryCard
                  number={
                    foodOrders.filter((order) =>
                      order.items.some((item) => item.status === "ready")
                    ).length
                  }
                  label="Hazır Sipariş"
                  color={Colors.success}
                />
                <DailySummaryCard
                  number={
                    foodOrders.filter((order) =>
                      order.items.some((item) => item.status === "preparing")
                    ).length
                  }
                  label="Hazırlanıyor"
                  color={Colors.warning}
                />
                <DailySummaryCard
                  number={
                    foodOrders.filter((order) =>
                      order.items.every((item) => item.status === "served")
                    ).length
                  }
                  label="Teslim Edildi"
                  color={Colors.info}
                />
                <DailySummaryCard
                  number={foodOrders.length}
                  label="Toplam Sipariş"
                  color={Colors.secondary}
                />
              </View>
            </View>

            {/* Hazır Siparişler */}
            {foodOrders.filter((order) =>
              order.items.some((item) => item.status === "ready")
            ).length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#f0fdf4", borderLeftColor: "#10b981" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#065f46" }]}>
                  ✅ Hazır Siparişler
                </Text>
                {foodOrders
                  .filter((order) =>
                    order.items.some((item) => item.status === "ready")
                  )
                  .map((order) => (
                    <View
                      key={order.id}
                      style={[
                        styles.urgentCard,
                        { backgroundColor: "#f0fdf4", borderColor: "#6ee7b7" },
                      ]}
                    >
                      <View style={styles.urgentInfo}>
                        <Text
                          style={[
                            styles.urgentTableNumber,
                            { color: "#065f46" },
                          ]}
                        >
                          {order.tableNumber}
                        </Text>
                        <Text style={[styles.urgentTime, { color: "#065f46" }]}>
                          Sipariş: {order.orderId}
                        </Text>
                      </View>
                      <View style={styles.orderItems}>
                        {order.items
                          .filter((item) => item.status === "ready")
                          .map((item, index) => (
                            <Text
                              key={index}
                              style={[
                                styles.orderItemText,
                                { color: "#065f46" },
                              ]}
                            >
                              ✓ {item.name} x{item.quantity}
                            </Text>
                          ))}
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.urgentButton,
                          { backgroundColor: "#10b981" },
                        ]}
                        onPress={() => {}}
                      >
                        <Text style={styles.urgentButtonText}>TESLİM ET</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}

            {/* Hazırlanan Siparişler */}
            {foodOrders.filter((order) =>
              order.items.some((item) => item.status === "preparing")
            ).length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#fef3c7", borderLeftColor: "#f59e0b" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#92400e" }]}>
                  ⏳ Hazırlanan Siparişler
                </Text>
                {foodOrders
                  .filter((order) =>
                    order.items.some((item) => item.status === "preparing")
                  )
                  .map((order) => (
                    <View
                      key={order.id}
                      style={[
                        styles.urgentCard,
                        { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
                      ]}
                    >
                      <View style={styles.urgentInfo}>
                        <Text
                          style={[
                            styles.urgentTableNumber,
                            { color: "#92400e" },
                          ]}
                        >
                          {order.tableNumber}
                        </Text>
                        <Text style={[styles.urgentTime, { color: "#92400e" }]}>
                          Tahmini: {order.estimatedTime}
                        </Text>
                      </View>
                      <View style={styles.orderItems}>
                        {order.items
                          .filter((item) => item.status === "preparing")
                          .map((item, index) => (
                            <Text
                              key={index}
                              style={[
                                styles.orderItemText,
                                { color: "#92400e" },
                              ]}
                            >
                              ⏳ {item.name} x{item.quantity}
                            </Text>
                          ))}
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* Teslim Edilen Siparişler */}
            {foodOrders.filter((order) =>
              order.items.every((item) => item.status === "served")
            ).length > 0 && (
              <View
                style={[
                  styles.urgentSection,
                  { backgroundColor: "#f0f9ff", borderLeftColor: "#3b82f6" },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: "#1e40af" }]}>
                  ✅ Teslim Edilen Siparişler
                </Text>
                {foodOrders
                  .filter((order) =>
                    order.items.every((item) => item.status === "served")
                  )
                  .map((order) => (
                    <View
                      key={order.id}
                      style={[
                        styles.urgentCard,
                        { backgroundColor: "#f0f9ff", borderColor: "#93c5fd" },
                      ]}
                    >
                      <View style={styles.urgentInfo}>
                        <Text
                          style={[
                            styles.urgentTableNumber,
                            { color: "#1e40af" },
                          ]}
                        >
                          {order.tableNumber}
                        </Text>
                        <Text style={[styles.urgentTime, { color: "#1e40af" }]}>
                          Teslim: {order.estimatedTime}
                        </Text>
                      </View>
                      <View style={styles.orderItems}>
                        {order.items.map((item, index) => (
                          <Text
                            key={index}
                            style={[styles.orderItemText, { color: "#1e40af" }]}
                          >
                            ✓ {item.name} x{item.quantity}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
    height: '100%', // Web için height ekle
  },
  scrollContent: {
    paddingBottom: 180, // Bottom navigation için çok daha fazla boşluk
    flexGrow: 1, // Web için flexGrow ekle
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 70,
  },
  headerLeft: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  businessName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  waiterBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  waiterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  roleSwitchSection: {
    padding: 16,
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roleSwitchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  roleSwitchButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roleSwitchButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    opacity: 0.8,
  },
  activeRoleButton: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    elevation: 4,
  },
  roleSwitchIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  roleSwitchText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.success,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  urgentSection: {
    padding: 20,
    backgroundColor: "#fef2f2",
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  urgentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  urgentInfo: {
    flex: 1,
  },
  urgentTableNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  urgentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  urgentButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  urgentButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tablesSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
  },
  tableCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  tableInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tableDetails: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginTop: 8,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: Colors.gray50,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  infoSection: {
    padding: 20,
    backgroundColor: "#f0f9ff",
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTableNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  infoStatus: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  infoDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.white,
  },
  orderItems: {
    marginVertical: 8,
  },
  orderItemText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default WaiterDashboard;
