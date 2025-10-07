export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar and might be confusing
// const SIMILAR_CHARS = 'il1Lo0O';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  
  if (options.includeUppercase) {
    charset += options.excludeSimilar ? 
      UPPERCASE.replace(/[IL]/g, '') : UPPERCASE;
  }
  
  if (options.includeLowercase) {
    charset += options.excludeSimilar ? 
      LOWERCASE.replace(/[il]/g, '') : LOWERCASE;
  }
  
  if (options.includeNumbers) {
    charset += options.excludeSimilar ? 
      NUMBERS.replace(/[10]/g, '') : NUMBERS;
  }
  
  if (options.includeSymbols) {
    charset += SYMBOLS;
  }
  
  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }
  
  let password = '';
  
  // Ensure at least one character from each selected type
  const requiredChars: string[] = [];
  
  if (options.includeUppercase) {
    const upperChars = options.excludeSimilar ? 
      UPPERCASE.replace(/[IL]/g, '') : UPPERCASE;
    requiredChars.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
  }
  
  if (options.includeLowercase) {
    const lowerChars = options.excludeSimilar ? 
      LOWERCASE.replace(/[il]/g, '') : LOWERCASE;
    requiredChars.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
  }
  
  if (options.includeNumbers) {
    const numberChars = options.excludeSimilar ? 
      NUMBERS.replace(/[10]/g, '') : NUMBERS;
    requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  
  if (options.includeSymbols) {
    requiredChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }
  
  // Add required characters
  password += requiredChars.join('');
  
  // Fill the rest randomly
  for (let i = password.length; i < options.length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string;
} {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push('Use at least 8 characters');
  
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');
  
  if (/[0-9]/.test(password)) score += 20;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  else feedback.push('Add symbols');
  
  return {
    score: Math.min(score, 100),
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password!'
  };
}
