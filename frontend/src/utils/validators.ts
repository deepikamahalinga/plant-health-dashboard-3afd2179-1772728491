// Types
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// Email validation
export const isEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? undefined : 'Invalid email format'
  };
};

// URL validation
export const isUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return {
      isValid: true
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid URL format'
    };
  }
};

// Phone number validation
export const isPhoneNumber = (phone: string): ValidationResult => {
  // Supports formats: +1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? undefined : 'Invalid phone number format'
  };
};

// Minimum length validation
export const minLength = (value: string, min: number): ValidationResult => {
  return {
    isValid: value.length >= min,
    message: value.length >= min ? undefined : `Minimum length should be ${min} characters`
  };
};

// Maximum length validation
export const maxLength = (value: string, max: number): ValidationResult => {
  return {
    isValid: value.length <= max,
    message: value.length <= max ? undefined : `Maximum length should be ${max} characters`
  };
};

// Combined length validation
export const isLength = (value: string, min: number, max: number): ValidationResult => {
  const minCheck = minLength(value, min);
  if (!minCheck.isValid) return minCheck;
  
  const maxCheck = maxLength(value, max);
  if (!maxCheck.isValid) return maxCheck;
  
  return {
    isValid: true
  };
};

// Required field validation
export const isRequired = (value: any): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== '';
  return {
    isValid,
    message: isValid ? undefined : 'This field is required'
  };
};

// Number validation
export const isNumber = (value: any): ValidationResult => {
  const isValid = !isNaN(Number(value));
  return {
    isValid,
    message: isValid ? undefined : 'Value must be a number'
  };
};

// Integer validation
export const isInteger = (value: any): ValidationResult => {
  const isValid = Number.isInteger(Number(value));
  return {
    isValid,
    message: isValid ? undefined : 'Value must be an integer'
  };
};