import { EncodingEngine } from './encoding';
import { DEFAULTS, STORAGE_KEYS } from '../constants/app';

export class SecurityManager {
  private static readonly SECRET_KEY_STORAGE = STORAGE_KEYS.SECRET_KEY;
  private static readonly PANIC_MODE_STORAGE = STORAGE_KEYS.PANIC_MODE;
  private static readonly PRIVATE_MODE_STORAGE = STORAGE_KEYS.PRIVATE_MODE;

  static setSecretKey(key: string): void {
    try {
      localStorage.setItem(this.SECRET_KEY_STORAGE, key);
    } catch (error) {
      console.error('Failed to store secret key:', error);
    }
  }

  static getSecretKey(): string {
    try {
      const key = localStorage.getItem(this.SECRET_KEY_STORAGE);
      return key || DEFAULTS.SECRET_KEY; // Default fallback
    } catch (error) {
      console.error('Failed to retrieve secret key:', error);
      return DEFAULTS.SECRET_KEY;
    }
  }

  static setPanicMode(enabled: boolean): void {
    try {
      localStorage.setItem(this.PANIC_MODE_STORAGE, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to store panic mode state:', error);
    }
  }

  static getPanicMode(): boolean {
    try {
      const state = localStorage.getItem(this.PANIC_MODE_STORAGE);
      return state ? JSON.parse(state) : false;
    } catch (error) {
      console.error('Failed to retrieve panic mode state:', error);
      return false;
    }
  }

  static setPrivateMode(enabled: boolean): void {
    try {
      localStorage.setItem(this.PRIVATE_MODE_STORAGE, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to store private mode state:', error);
    }
  }

  static getPrivateMode(): boolean {
    try {
      const state = localStorage.getItem(this.PRIVATE_MODE_STORAGE);
      return state ? JSON.parse(state) : true;
    } catch (error) {
      console.error('Failed to retrieve private mode state:', error);
      return true;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.SECRET_KEY_STORAGE);
      localStorage.removeItem(this.PANIC_MODE_STORAGE);
      localStorage.removeItem(this.PRIVATE_MODE_STORAGE);
    } catch (error) {
      console.error('Failed to clear security data:', error);
    }
  }

  static validateSecretKey(key: string): boolean {
    // Basic validation - key should be at least 8 characters
    return Boolean(key && key.length >= 8);
  }

  static generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async encryptMessage(message: string, customKey?: string): Promise<string> {
    const key = customKey || await this.getSecretKey();
    return Promise.resolve(EncodingEngine.encode(message, key));
  }

  static async decryptMessage(encodedMessage: string, customKey?: string): Promise<string> {
    const key = customKey || await this.getSecretKey();
    return Promise.resolve(EncodingEngine.decode(encodedMessage, key));
  }

  static isEncodedMessage(message: string): boolean {
    return EncodingEngine.isValidEncodedMessage(message);
  }
}
