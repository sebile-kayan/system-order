/** HOOK KLASÖRÜNÜN AMACI: State yönetimi ve logic paylaşımı. Birden fazla bileşende kullanılan logic'ler.
 * USE MODAL - Modal Yönetimi Hook'u
 * 
 * Modal state'lerini yönetmek için ortak hook.
 * Açma/kapama işlemlerini kolaylaştırır.
 */
import { useState, useCallback } from 'react';

const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const openModal = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return {
    isVisible,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default useModal;
