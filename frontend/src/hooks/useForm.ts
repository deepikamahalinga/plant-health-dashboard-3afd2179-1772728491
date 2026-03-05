// useForm.ts

import { useState, ChangeEvent, FormEvent } from 'react';

export type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: T[K]) => boolean;
    errorMessage?: string;
  };
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormOutput<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [K in keyof T]?: boolean };
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isValid: boolean;
  resetForm: () => void;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void
): UseFormOutput<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});

  const validateField = (name: keyof T, value: any): string => {
    if (!validationRules || !validationRules[name]) return '';

    const rules = validationRules[name]!;

    if (rules.required && !value) {
      return rules.errorMessage || 'This field is required';
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.errorMessage || 'Invalid format';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.errorMessage || `Minimum length is ${rules.minLength}`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.errorMessage || `Maximum length is ${rules.maxLength}`;
    }

    if (rules.custom && !rules.custom(value)) {
      return rules.errorMessage || 'Invalid value';
    }

    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof T]) {
      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const error = validateField(name as keyof T, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      onSubmit(values);
    }
  };

  const resetForm = (): void => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid: Object.keys(errors).length === 0,
    resetForm
  };
};