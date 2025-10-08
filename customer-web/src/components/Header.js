/**
 * HEADER COMPONENT - Ana Navigasyon Bileşeni
 * 
 * Bu bileşen tüm sayfalarda görünen üst navigasyon çubuğudur.
 * 
 * İÇERİK:
 * - Hamburger menü (sol taraf, her zaman görünür)
 * - Logo ve ikon (EsSe + 🍽️, tıklanabilir)
 * - Masa bilgisi (Masa X Ödeme İste)
 * - Navigasyon linkleri (Menü, Sepet, Siparişlerim, Çıkış)
 * - Mobil sidebar (hamburger menüden açılır)
 * 
 * ÖZELLİKLER:
 * - Responsive tasarım (mobil/desktop farklı görünüm)
 * - Aktif sayfa vurgulaması (renkli arka plan)
 * - Sepet sayısı göstergesi
 * - Mobil sidebar ile tam menü
 * - Oturum yönetimi (çıkış butonu)
 * - QR kod sistemi entegrasyonu
 * 
 * MOBİL GÖRÜNÜM:
 * - Hamburger + Logo + Sepet + Siparişlerim + Ödeme İste
 * - Sidebar: Menü, Sepet, Siparişlerim, Ödeme İste, Çıkış
 * 
 * DESKTOP GÖRÜNÜM:
 * - Hamburger + Logo + Menü + Sepet + Siparişlerim + Ödeme İste + Çıkış
 * - Tüm linkler yan yana görünür
 * 
 * KULLANICI DENEYİMİ:
 * 1. Müşteri hangi sayfada olduğunu görebilir
 * 2. Hızlı navigasyon yapabilir
 * 3. Sepet durumunu takip edebilir
 * 4. Oturumu sonlandırabilir
 */
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTable } from "../context/TableContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useCart();
  const { tableInfo, sessionInfo, endSession } = useTable();
  const cartItemCount = getCartItemCount();
  const navigate = useNavigate();
  const location = useLocation();

  // Aktif sayfa kontrolü
  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const goToMenu = () => {
    navigate("/");
    closeMobileMenu();
  };
  return (
    <header className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-white shadow-md">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Hamburger Menü - Modern ve kenara yakın */}
        <button
          onClick={toggleMobileMenu}
          className="p-1.5 -ml-1 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300 group"
          aria-label="Menüyü Aç"
        >
          <div className="w-4 h-4 flex flex-col justify-center space-y-1">
            <div
              className={`h-0.5 w-4 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen
                  ? "rotate-45 translate-y-1"
                  : "group-hover:scale-110"
              }`}
            ></div>
            <div
              className={`h-0.5 w-4 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "opacity-0" : "group-hover:scale-110"
              }`}
            ></div>
            <div
              className={`h-0.5 w-4 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen
                  ? "-rotate-45 -translate-y-1"
                  : "group-hover:scale-110"
              }`}
            ></div>
          </div>
        </button>

        {/* Logo ve İkon - Tıklanabilir */}
        <button
          onClick={goToMenu}
          className="flex items-center gap-2 md:gap-3 hover:bg-orange-50 rounded-lg px-2 py-1 transition-colors duration-200 group"
        >
          <div className="w-7 h-7 md:w-9 md:h-9 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-200">
            <span className="text-white text-base md:text-lg font-bold">
              🍽️
            </span>
          </div>
          <h1 className="text-base md:text-xl font-bold text-gray-800 m-0 font-sans group-hover:text-orange-600 transition-colors duration-200">
            EsSe
          </h1>
        </button>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile - Sepet, Siparişlerim ve Masa Bilgisi */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/cart"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-200 relative ${
              isActive("/cart")
                ? "bg-green-50 text-green-600"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            <span className="text-lg">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-200 ${
              isActive("/orders")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            <span className="text-lg">📝</span>
          </Link>

          {/* Masa Bilgisi - Mobile */}
          {tableInfo && (
            <Link
              to="/payment"
              className={`text-xs px-2 py-1 rounded-lg transition-colors duration-200 ${
                isActive("/payment")
                  ? "bg-purple-50 text-purple-600 font-semibold"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <span className="font-semibold">M{tableInfo.id} Ödeme İste</span>
            </Link>
          )}
        </div>

        {/* Desktop Menü - Responsive */}
        <div className="hidden sm:flex items-center gap-2 md:gap-4">
          {/* Menü */}
          <Link
            to="/"
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg transition-colors duration-200 ${
              isActive("/")
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <span className="text-base md:text-lg">🍽️</span>
            <span className="text-sm md:text-base font-medium">Menü</span>
          </Link>

          {/* Sepet */}
          <Link
            to="/cart"
            className={`relative flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg font-medium transition-colors duration-200 ${
              isActive("/cart")
                ? "bg-green-50 text-green-600"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <span className="text-base md:text-lg">🛒</span>
            <span className="text-sm md:text-base">Sepet</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Sipariş Takibi */}
          <Link
            to="/orders"
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 rounded-lg transition-colors duration-200 ${
              isActive("/orders")
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            <span className="text-base md:text-lg">📋</span>
            <span className="text-sm md:text-base font-medium">
              Siparişlerim
            </span>
          </Link>

          {/* Masa Bilgisi - Desktop */}
          {tableInfo && (
            <Link
              to="/payment"
              className={`text-sm px-2 md:px-3 py-1 md:py-2 rounded-lg transition-colors duration-200 ${
                isActive("/payment")
                  ? "bg-purple-50 text-purple-600 font-semibold"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <span className="font-semibold">
                Masa {tableInfo.id} Ödeme İste
              </span>
            </Link>
          )}

          {/* Çıkış */}
          {tableInfo && (
            <button
              onClick={endSession}
              className="flex items-center gap-1 md:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 md:px-3 py-1 md:py-2 rounded-lg transition-colors duration-200"
            >
              <span className="text-base md:text-lg">❌</span>
              <span className="text-sm md:text-base font-medium">Çıkış</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Menü</h2>
          <button
            onClick={closeMobileMenu}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Masa Bilgisi */}
        {tableInfo && (
          <div className="px-6 py-4 bg-orange-50 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-800">
              Masa {tableInfo.id}
            </div>
            <div className="text-xs text-gray-500">Aktif Oturum</div>
          </div>
        )}

        {/* Menü Linkleri */}
        <div className="py-4">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`flex items-center gap-4 px-6 py-4 transition-colors duration-200 ${
              isActive("/")
                ? "bg-orange-100 text-orange-700 border-r-4 border-orange-500"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <span className="text-2xl">🍽️</span>
            <div>
              <div className="font-semibold text-lg">Menü</div>
              <div className="text-sm text-gray-500">Yemekleri görüntüle</div>
            </div>
          </Link>

          <Link
            to="/cart"
            onClick={closeMobileMenu}
            className={`flex items-center gap-4 px-6 py-4 transition-colors duration-200 ${
              isActive("/cart")
                ? "bg-green-100 text-green-700 border-r-4 border-green-500"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <span className="text-2xl">🛒</span>
            <div className="flex-1">
              <div className="font-semibold text-lg">Sepet</div>
              <div className="text-sm text-gray-500">Siparişi tamamla</div>
            </div>
            {cartItemCount > 0 && (
              <span className="bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          <Link
            to="/orders"
            onClick={closeMobileMenu}
            className={`flex items-center gap-4 px-6 py-4 transition-colors duration-200 ${
              isActive("/orders")
                ? "bg-blue-100 text-blue-700 border-r-4 border-blue-500"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-semibold text-lg">Siparişlerim</div>
              <div className="text-sm text-gray-500">Sipariş durumunu takip et</div>
            </div>
          </Link>

          {/* Masaya Ödeme İste */}
          {tableInfo && (
            <Link
              to="/payment"
              onClick={closeMobileMenu}
              className={`flex items-center gap-4 px-6 py-4 transition-colors duration-200 ${
                isActive("/payment")
                  ? "bg-purple-100 text-purple-700 border-r-4 border-purple-500"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-semibold text-lg">Ödeme İste</div>
                <div className="text-sm text-gray-500">
                  Masaya çalışanı çağırın
                </div>
              </div>
        </Link>
          )}
        </div>

        {/* Çıkış Butonu */}
        {tableInfo && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                endSession();
                closeMobileMenu();
              }}
              className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full text-left rounded-lg"
            >
              <span className="text-2xl">❌</span>
              <div>
                <div className="font-semibold text-lg">Oturumu Sonlandır</div>
                <div className="text-sm text-gray-500">Çıkış yap</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}
    </header>
  );
};

export default Header;
