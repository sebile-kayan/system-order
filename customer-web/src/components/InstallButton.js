/**
 * INSTALL BUTTON COMPONENT - PWA Yükleme Butonu
 * 
 * Bu bileşen header'ın altında PWA yükleme butonu gösterir. Kullanıcılar uygulamayı cihazlarına yükleyebilir.
 * Sadece yüklenebilir durumda görünür ve yükleme işlemi tamamlandıktan sonra gizlenir.
 */
import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const InstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  // Debug için console log
  React.useEffect(() => {
    console.log('Install Button Debug:', { isInstallable, isInstalled });
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        console.log('App installed successfully');
      }
    } catch (error) {
      console.error('Error installing app:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return null; // Don't show button if already installed
  }

  if (!isInstallable) {
    return null; // Don't show button if not installable
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className="fixed top-20 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2 z-[60]"
      style={{
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
      }}
    >
      {isInstalling ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Yükleniyor...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Uygulamayı Yükle</span>
        </>
      )}
    </button>
  );
};

export default InstallButton;
