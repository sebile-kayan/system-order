/**  HOOK KLASÖRÜNÜN AMACI: State yönetimi ve logic paylaşımı. Birden fazla bileşende kullanılan logic'ler. Logic'i paketler, fonksiyon sağlar
 * USE FORM - Form Yönetimi Hook'u
 * 
 * Form state'lerini ve validasyonlarını yönetmek için ortak hook.
 * Form verilerini kolayca yönetir.
 */
import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.requiredMessage || `${name} alanı zorunludur`;
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.minLengthMessage || `${name} en az ${rule.minLength} karakter olmalıdır`;
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      return rule.maxLengthMessage || `${name} en fazla ${rule.maxLength} karakter olmalıdır`;
    }

    if (rule.pattern && value && value.toString().trim() !== '' && !rule.pattern.test(value)) {
      return rule.patternMessage || `${name} geçerli bir format değil`;
    }

    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value, values);
      if (customError) return customError;
    }

    return null;
  }, [validationRules, values]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleChange = useCallback((name, value) => {
    setValue(name, value);
  }, [setValue]);

  const handleBlur = useCallback((name) => {
    setFieldTouched(name);
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [setFieldTouched, validateField, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    handleChange,
    handleBlur,
  };
};

export default useForm;
