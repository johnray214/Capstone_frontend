/**
 * Password validation utility
 * Requirements: 8 characters minimum, 1 uppercase letter, 1 number
 */

export const validatePassword = (password) => {
  const errors = []
  
  if (!password) {
    errors.push('Password is required')
    return { isValid: false, errors }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getPasswordRequirements = () => {
  return [
    'At least 8 characters long',
    'At least one uppercase letter (A-Z)',
    'At least one number (0-9)'
  ]
}
