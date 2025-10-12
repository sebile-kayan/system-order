/**
 * TABLE CONTEXT - Masa Oturum Yönetim Sistemi
 * 
 * Bu context masa oturumunu ve QR kod sistemini yönetir.
 * 
 * İÇERİK:
 * - Masa bilgileri (tableInfo)
 * - Oturum bilgileri (sessionInfo)
 * - QR kod verisi
 * - Loading ve hata durumları
 * 
 * FONKSİYONLAR:
 * - startMockSession: Mock masa oturumu başlatır
 * - endSession: Oturumu sonlandırır
 * - isSessionActive: Oturumun aktif olup olmadığını kontrol eder
 * - extractTableInfoFromURL: URL'den masa bilgilerini çıkarır
 * 
 * ÖZELLİKLER:
 * - Mock QR kod sistemi (gerçek QR yok)
 * - LocalStorage ile oturum kalıcılığı
 * - URL parametrelerinden masa bilgisi çıkarma
 * - Oturum sonlandırıldığında tüm verileri temizleme
 * - Otomatik oturum başlatma
 * 
 * QR KOD SİSTEMİ:
 * - Mock veri: businessId_tableId_sessionToken
 * - URL formatı: ?qr=EsSe_5_abc123
 * - Otomatik oturum başlatma
 * - Masa bilgisi çıkarma
 * 
 * KULLANIM:
 * - Tüm sayfalarda masa bilgisi için
 * - Oturum kontrolü için
 * - QR kod işlemleri için
 * - Çıkış işlemleri için
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TableContext = createContext();

const tableReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TABLE_INFO':
      return { ...state, tableInfo: action.payload };
    case 'SET_SESSION_INFO':
      return { ...state, sessionInfo: action.payload };
    case 'CLEAR_SESSION':
      return { ...state, tableInfo: null, sessionInfo: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const TableProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, {
    tableInfo: null,
    sessionInfo: null,
    isLoading: false,
    error: null,
  });

  // Mock QR kod verisi - gerçek projede URL'den gelecek
  const mockQRData = {
    businessId: 1,
    tableId: 5,
    sessionToken: `mock_session_${Date.now()}`
  };

  // URL'den masa bilgilerini çıkar (şu an mock kullanıyoruz)
  const initializeFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const qrData = urlParams.get('qr');

    if (qrData) {
      // QR kod formatı: businessId_tableId_sessionToken
      const [businessId, tableId, sessionToken] = qrData.split('_');

      if (businessId && tableId && sessionToken) {
        dispatch({ type: 'SET_TABLE_INFO', payload: { id: parseInt(tableId), businessId: parseInt(businessId) } });
        dispatch({ type: 'SET_SESSION_INFO', payload: { token: sessionToken, startedAt: new Date().toISOString() } });
        return true;
      }
    }
    return false;
  };

  // Mock masa oturumu başlat
  const startMockSession = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const sessionData = {
        tableId: mockQRData.tableId,
        businessId: mockQRData.businessId,
        sessionToken: mockQRData.sessionToken,
        startedAt: new Date().toISOString()
      };

      dispatch({ type: 'SET_TABLE_INFO', payload: { id: mockQRData.tableId, businessId: mockQRData.businessId } });
      dispatch({ type: 'SET_SESSION_INFO', payload: { token: mockQRData.sessionToken, startedAt: sessionData.startedAt } });

      // URL'yi güncelle (QR formatında)
      const newUrl = `${window.location.origin}${window.location.pathname}?qr=${mockQRData.businessId}_${mockQRData.tableId}_${mockQRData.sessionToken}`;
      window.history.replaceState({}, '', newUrl);

      // LocalStorage'a kaydet
      localStorage.setItem('tableSession', JSON.stringify(sessionData));

      return sessionData;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Oturum başlatılırken bir hata oluştu.' });
      console.error('Failed to start session:', err);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Masa oturumu başlat (gerçek QR için)
  const startSession = async (tableId, businessId, providedSessionToken = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Session token'ı al (QR koddan geliyorsa kullan, yoksa oluştur)
      const sessionToken = providedSessionToken || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const sessionData = {
        tableId,
        businessId,
        sessionToken,
        startedAt: new Date().toISOString()
      };

      dispatch({ type: 'SET_TABLE_INFO', payload: { id: tableId, businessId: businessId } });
      dispatch({ type: 'SET_SESSION_INFO', payload: { token: sessionToken, startedAt: sessionData.startedAt } });

      // URL'yi güncelle (QR formatında)
      const newUrl = `${window.location.origin}${window.location.pathname}?qr=${businessId}_${tableId}_${sessionToken}`;
      window.history.replaceState({}, '', newUrl);

      // LocalStorage'a kaydet
      localStorage.setItem('tableSession', JSON.stringify(sessionData));

      return sessionData;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Oturum başlatılırken bir hata oluştu.' });
      console.error('Failed to start session:', err);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Oturumu sonlandır
  const endSession = () => {
    localStorage.removeItem('tableSession');
    // NOT: Sepet verilerini (hasOrdered, orderTotal) silmiyoruz
    // Çünkü müşteri ödeme yapana kadar sepet korunmalı
    dispatch({ type: 'CLEAR_SESSION' });
    // URL'deki QR parametresini temizle
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    // Menü sayfasına yönlendir
    window.location.href = '/';
  };

  // Oturumun aktif olup olmadığını kontrol et
  const isSessionActive = () => {
    return !!state.tableInfo && !!state.sessionInfo;
  };

  useEffect(() => {
    const storedSession = localStorage.getItem('tableSession');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      dispatch({ type: 'SET_TABLE_INFO', payload: { id: sessionData.tableId, businessId: sessionData.businessId } });
      dispatch({ type: 'SET_SESSION_INFO', payload: { token: sessionData.sessionToken, startedAt: sessionData.startedAt } });
    } else {
      // Eğer localStorage'da oturum yoksa, URL'den kontrol et
      const urlHasQR = initializeFromURL();
      
      // Eğer URL'de de QR yoksa, mock oturum başlat
      if (!urlHasQR) {
        startMockSession();
      }
    }
  }, []);

  return (
    <TableContext.Provider value={{ 
      ...state, 
      startSession, 
      startMockSession,
      endSession, 
      isSessionActive 
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
