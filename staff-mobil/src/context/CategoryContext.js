/**
 * CATEGORY CONTEXT - Global Kategori Yönetimi
 * 
 * Tüm uygulamada kategori verilerini merkezi olarak yönetir.
 * Kategori ekleme, silme, düzenleme, birleştirme ve bölme işlemlerini içerir.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const CategoryContext = createContext();

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  // Kategori verileri
  const [categories, setCategories] = useState([
    { id: 1, name: 'Ana Yemek', is_active: true, display_order: 1, color: '#dc2626' },
    { id: 2, name: 'Çorba', is_active: true, display_order: 2, color: '#f59e0b' },
    { id: 3, name: 'Meze', is_active: true, display_order: 3, color: '#10b981' },
    { id: 4, name: 'Salata', is_active: true, display_order: 4, color: '#3b82f6' },
    { id: 5, name: 'Tatlı', is_active: true, display_order: 5, color: '#8b5cf6' },
    { id: 6, name: 'Sıcak İçecek', is_active: true, display_order: 6, color: '#ef4444' },
    { id: 7, name: 'Soğuk İçecek', is_active: true, display_order: 7, color: '#06b6d4' },
  ]);

  // Mock ürün verileri
  const [products, setProducts] = useState([
    { 
      id: 1, 
      name: 'Adana Kebab', 
      category_id: 1, 
      category: 'Ana Yemek',
      description: 'Acılı kıyma kebabı, pilav ve salata ile',
      price: 55.00,
      is_available: true,
      preparation_time: 15,
      image_url: null,
      is_vegetarian: false,
    },
    { 
      id: 2, 
      name: 'Mercimek Çorbası', 
      category_id: 2, 
      category: 'Çorba',
      description: 'Kırmızı mercimek çorbası, limon ve nane ile',
      price: 18.00,
      is_available: true,
      preparation_time: 10,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 3, 
      name: 'Humus', 
      category_id: 3, 
      category: 'Meze',
      description: 'Nohut püresi, tahin ve zeytinyağı ile',
      price: 25.00,
      is_available: true,
      preparation_time: 5,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 4, 
      name: 'Çoban Salata', 
      category_id: 4, 
      category: 'Salata',
      description: 'Domates, salatalık, soğan, maydanoz ve zeytinyağı',
      price: 22.00,
      is_available: true,
      preparation_time: 8,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 5, 
      name: 'Sütlaç', 
      category_id: 5, 
      category: 'Tatlı',
      description: 'Fırın sütlacı, tarçın ile',
      price: 15.00,
      is_available: true,
      preparation_time: 12,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 6, 
      name: 'Türk Kahvesi', 
      category_id: 6, 
      category: 'Sıcak İçecek',
      description: 'Geleneksel Türk kahvesi, lokum ile',
      price: 12.00,
      is_available: true,
      preparation_time: 5,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 7, 
      name: 'Ayran', 
      category_id: 7, 
      category: 'Soğuk İçecek',
      description: 'Ev yapımı ayran',
      price: 8.00,
      is_available: true,
      preparation_time: 2,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 8, 
      name: 'Cola', 
      category_id: 7, 
      category: 'Soğuk İçecek',
      description: '330ml kutu kola',
      price: 10.00,
      is_available: true,
      preparation_time: 1,
      image_url: null,
      is_vegetarian: true,
    },
    { 
      id: 9, 
      name: 'Çay', 
      category_id: 6, 
      category: 'Sıcak İçecek',
      description: 'Demli çay',
      price: 6.00,
      is_available: true,
      preparation_time: 3,
      image_url: null,
      is_vegetarian: true,
    },
  ]);

  // Kategori ekleme
  const addCategory = useCallback((categoryData) => {
    const newCategory = {
      ...categoryData,
      id: Date.now(),
      display_order: categories.length + 1,
      color: categoryData.color || '#dc2626',
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, [categories.length]);

  // Ürün ekleme
  const addProduct = useCallback((productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  // Kategori silme
  const deleteCategory = useCallback((categoryId) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  // Kategori güncelleme
  const updateCategory = useCallback((categoryId, updates) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, ...updates }
          : cat
      )
    );
  }, []);

  // Kategori durumu değiştirme
  const toggleCategoryStatus = useCallback((categoryId) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, is_active: !cat.is_active }
          : cat
      )
    );
  }, []);

  // Kategori sıralama
  const reorderCategories = useCallback((fromIndex, toIndex) => {
    setCategories(prev => {
      const newCategories = [...prev];
      const [movedCategory] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, movedCategory);
      
      // Display order'ları güncelle
      return newCategories.map((cat, index) => ({
        ...cat,
        display_order: index + 1
      }));
    });
  }, []);

  // Kategori birleştirme
  const mergeCategories = useCallback((categoryIds, mergedName) => {
    if (categoryIds.length < 2) return;
    
    // Birleştirilecek kategorileri bul
    const categoriesToMerge = categories.filter(cat => categoryIds.includes(cat.id));
    const firstCategory = categoriesToMerge[0];
    
    // Yeni birleşik kategori oluştur
    const mergedCategory = {
      ...firstCategory,
      name: mergedName,
      display_order: Math.min(...categoriesToMerge.map(cat => cat.display_order)),
    };
    
    // Eski kategorileri sil, yeni kategoriyi ekle
    setCategories(prev => {
      const filtered = prev.filter(cat => !categoryIds.includes(cat.id));
      return [...filtered, mergedCategory].sort((a, b) => a.display_order - b.display_order);
    });
    
    // Ürünleri de güncelle
    setProducts(prevProducts => 
      prevProducts.map(item => {
        if (categoryIds.includes(item.category_id)) {
          return {
            ...item,
            category_id: mergedCategory.id,
            category: mergedCategory.name
          };
        }
        return item;
      })
    );
    
    return mergedCategory;
  }, [categories]);

  // Kategori bölme
  const splitCategory = useCallback((categoryId, newCategories, productAssignments = [], deletedProductIds = []) => {
    const originalCategory = categories.find(cat => cat.id === categoryId);
    if (!originalCategory) return;
    
    // Yeni kategorileri oluştur
    const splitCategories = newCategories.map((name, index) => ({
      id: Date.now() + index,
      name,
      is_active: originalCategory.is_active,
      display_order: originalCategory.display_order + index,
      color: originalCategory.color,
    }));
    
    // Eski kategoriyi sil, yeni kategorileri ekle
    setCategories(prev => {
      const filtered = prev.filter(cat => cat.id !== categoryId);
      return [...filtered, ...splitCategories].sort((a, b) => a.display_order - b.display_order);
    });
    
    // Silinecek ürünleri kaldır
    if (deletedProductIds && deletedProductIds.length > 0) {
      setProducts(prevProducts => 
        prevProducts.filter(product => !deletedProductIds.includes(product.id))
      );
    }
    
    // Ürünleri yeni kategorilere ata
    if (productAssignments && productAssignments.length > 0) {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.category_id === categoryId) {
            const assignment = productAssignments.find(pa => pa.productId === product.id);
            if (assignment) {
              const newCategory = splitCategories.find(cat => cat.name === assignment.categoryName);
              if (newCategory) {
                return {
                  ...product,
                  category_id: newCategory.id,
                  category: newCategory.name
                };
              }
            }
          }
          return product;
        })
      );
    }
    
    return splitCategories;
  }, [categories]);

  // Toplu fiyat güncelleme
  const bulkUpdatePrices = useCallback((increasePercent) => {
    setProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        price: Math.round((product.price * (1 + increasePercent / 100)) * 100) / 100
      }))
    );
  }, []);

  // Aktif kategorileri getir
  const getActiveCategories = useCallback(() => {
    return categories.filter(cat => cat.is_active).sort((a, b) => a.display_order - b.display_order);
  }, [categories]);

  const value = {
    categories,
    products,
    addCategory,
    addProduct,
    deleteCategory,
    updateCategory,
    toggleCategoryStatus,
    reorderCategories,
    mergeCategories,
    splitCategory,
    bulkUpdatePrices,
    getActiveCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
