/**
 * CART CONTEXT - Sepet Yönetim Sistemi
 * 
 * Bu context sepet işlemlerini ve sipariş durumunu yönetir.
 * 
 * İÇERİK:
 * - Sepet ürünleri listesi
 * - Sipariş durumu (hasOrdered)
 * - Sipariş tutarı (orderTotal)
 * - LocalStorage entegrasyonu
 * 
 * FONKSİYONLAR:
 * - addToCart: Ürün sepete ekler
 * - removeFromCart: Ürünü sepetten çıkarır
 * - updateQuantity: Ürün miktarını günceller
 * - clearCart: Sepeti temizler
 * - calculateTotal: Toplam tutarı hesaplar
 * - placeOrder: Sipariş verir (hasOrdered=true yapar)
 * - resetOrderStatus: Sipariş durumunu sıfırlar
 * 
 * ÖZELLİKLER:
 * - LocalStorage ile kalıcı veri saklama
 * - Sipariş verildikten sonra sepet temizlenir
 * - Sipariş tutarı korunur (ödeme için)
 * - Oturum sonlandırıldığında tüm veriler temizlenir
 * 
 * KULLANIM:
 * - Tüm sayfalarda sepet işlemleri için
 * - Sipariş durumu kontrolü için
 * - Tutar hesaplamaları için
 */
import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];

    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload);

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity < 1) return state;
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [hasOrdered, setHasOrdered] = React.useState(() => {
    // localStorage'dan sipariş durumunu oku
    const stored = localStorage.getItem('hasOrdered');
    return stored === 'true';
  });
  const [orderTotal, setOrderTotal] = React.useState(() => {
    // localStorage'dan sipariş tutarını oku
    const stored = localStorage.getItem('orderTotal');
    return stored ? parseFloat(stored) : 0;
  });
  const [isPaid, setIsPaid] = React.useState(() => {
    // localStorage'dan ödeme durumunu oku
    const stored = localStorage.getItem('isPaid');
    return stored === 'true';
  });

  // isPaid değişikliklerini localStorage ile senkronize et
  React.useEffect(() => {
    localStorage.setItem('isPaid', isPaid.toString());
  }, [isPaid]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    
    // Eğer ödeme yapıldıysa (isPaid: true) ve yeni ürün ekleniyorsa
    // Bu yeni bir sipariş başlangıcıdır, isPaid'i false yap
    const storedIsPaid = localStorage.getItem('isPaid') === 'true';
    if (isPaid || storedIsPaid) {
      setIsPaid(false);
      localStorage.setItem('isPaid', 'false');
    }
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const placeOrder = () => {
    const currentTotal = calculateTotal();
    const newOrderTotal = hasOrdered ? orderTotal + currentTotal : currentTotal;
    
    setHasOrdered(true);
    setOrderTotal(newOrderTotal);
    setIsPaid(false);
    localStorage.setItem('hasOrdered', 'true');
    localStorage.setItem('orderTotal', newOrderTotal.toString());
    localStorage.setItem('isPaid', 'false');
    dispatch({ type: 'CLEAR_CART' });
  };

  const markAsPaid = () => {
    setIsPaid(true);
    setHasOrdered(false);
    setOrderTotal(0);
    dispatch({ type: 'CLEAR_CART' });
    localStorage.setItem('isPaid', 'true');
    localStorage.removeItem('hasOrdered');
    localStorage.removeItem('orderTotal');
  };

  const resetOrderStatus = () => {
    setHasOrdered(false);
    setOrderTotal(0);
    setIsPaid(false);
    localStorage.removeItem('hasOrdered');
    localStorage.removeItem('orderTotal');
    localStorage.removeItem('isPaid');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotal,
    getCartItemCount,
    hasOrdered,
    orderTotal,
    isPaid,
    placeOrder,
    markAsPaid,
    resetOrderStatus
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
