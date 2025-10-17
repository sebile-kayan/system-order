/**
 * MAIN APP COMPONENT - Ana Uygulama Bileşeni
 * 
 * Bu bileşen tüm uygulamanın ana yapısını oluşturur. Router yapılandırması, context provider'ları ve tüm sayfaları içerir.
 * PWA özelliklerini başlatır ve bildirim izni ister. ProtectedRoute ile sayfa koruması sağlar.
 */
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { TableProvider } from "./context/TableContext";
import Header from "./components/Header";
import PaymentButton from "./components/PaymentButton";
import InstallButton from "./components/InstallButton";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import PaymentPage from "./pages/PaymentPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useNotifications } from "./hooks/useNotifications";

function App() {
  const { requestPermission, subscribeToNotifications } = useNotifications();

  useEffect(() => {
    // Request notification permission on app load
    const initializeNotifications = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await subscribeToNotifications();
      }
    };

    initializeNotifications();
  }, [requestPermission, subscribeToNotifications]);

  return (
    <TableProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 overflow-y-auto">
              <Routes>
              {/* Ana sayfa - Menü (Mock QR ile) */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              } />

              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />

              <Route path="/confirmation" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />

              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />

              <Route path="/payment" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              </Routes>
            </div>
            <PaymentButton />
            <InstallButton />
          </div>
        </Router>
      </CartProvider>
    </TableProvider>
  );
}

export default App;
