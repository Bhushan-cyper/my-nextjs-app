import CryptoJS from 'crypto-js';

export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

// Generate a key from user's master password
export function generateKey(masterPassword: string, salt: string): string {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 100000
  }).toString();
}

// Encrypt vault item data
export function encryptData(data: VaultItemData, key: string): string {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
  return encrypted;
}

// Decrypt vault item data
export function decryptData(encryptedData: string, key: string): VaultItemData | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as VaultItemData;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Generate a random salt for each user
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(128/8).toString();
}
