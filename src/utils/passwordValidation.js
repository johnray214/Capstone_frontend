/**
 * Password validation and strength utilities
 */

// For checking password strength (weak, medium, strong)
export const getPasswordStrength = (password) => {
   if (!password) return '';

   // Basic validation - must be at least 8 characters
   if (password.length < 8) return 'weak';

   // Check for different character types
   const hasUpperCase = /[A-Z]/.test(password);
   const hasLowerCase = /[a-z]/.test(password);
   const hasNumber = /\d/.test(password);

   // Score calculation
   let strength = 0;
   if (password.length > 4) strength++;
   if (password.length > 7) strength++;
   if (hasUpperCase) strength++;
   if (hasLowerCase) strength++;
   if (hasNumber) strength++;

   if (strength <= 2) return 'weak';
   if (strength <= 4) return 'medium';
   return 'strong';
};

// For validating password rules before saving
export const validatePasswordForSave = (password) => {
   const errors = [];

   if (!password || password.trim() === '') {
      errors.push('Password is required');
   } else {
      if (password.length < 8) {
         errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
         errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
         errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
         errors.push('Password must contain at least one number');
      }
   }

   return {
      isValid: errors.length === 0,
      errors,
   };
};

// Export alias for backward compatibility
export const validatePassword = validatePasswordForSave;

// For validating password when it's optional (like in edit forms)
export const validateOptionalPassword = (password) => {
   // If password is empty or just whitespace, it's valid (means keep current password)
   if (!password || password.trim() === '') {
      return {
         isValid: true,
         errors: [],
      };
   }

   // If password is provided, validate it with full rules
   return validatePasswordForSave(password);
};

export const getPasswordRequirements = () => [
   'At least 8 characters long',
   'At least one uppercase letter (A-Z)',
   'At least one lowercase letter (a-z)',
   'At least one number (0-9)',
];

// Get password strength with color coding
export const getPasswordStrengthWithColor = (password) => {
   const strength = getPasswordStrength(password);

   switch (strength) {
      case 'weak':
         return { strength, color: '#ef4444', text: 'Weak' };
      case 'medium':
         return { strength, color: '#f59e0b', text: 'Medium' };
      case 'strong':
         return { strength, color: '#10b981', text: 'Strong' };
      default:
         return { strength: '', color: '#6b7280', text: '' };
   }
};
