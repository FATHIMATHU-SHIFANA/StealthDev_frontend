import { EncodingOptions, EncodingStyle } from '../types';

export class EncodingEngine {
  private static readonly SECRET_KEY = 'stealth_dev_key_2024';
  
  // Code-style templates
  private static readonly CODE_TEMPLATES = [
    'fn_{function}({params}) // {hash}',
    'const {variable} = await {operation}({params}); // {hash}',
    'if ({condition}) { action } // {hash}',
    'api.{method}({params}).then(res => console.log(res)); // {hash}',
    'cache.set("{key}", {value}); // {hash}',
    'dispatch({type}: "{action}", payload: {data}); // {hash}',
  ];

  // Log-style templates
  private static readonly LOG_TEMPLATES = [
    '[{level}] {message} // {hash}',
    '[{timestamp}] {event}: {details} // {hash}',
    'LOG: {operation} completed in {time}ms // {hash}',
    '[SYSTEM] {process} - {status} // {hash}',
  ];

  // Commit-style templates
  private static readonly COMMIT_TEMPLATES = [
    'feat: {message} // {hash}',
    'fix: {message} // {hash}',
    'refactor: {message} // {hash}',
    'chore: {message} // {hash}',
  ];

  // Debug-style templates
  private static readonly DEBUG_TEMPLATES = [
    'DEBUG: {variable} = {value} // {hash}',
    'BREAKPOINT: {function} line {line} // {hash}',
    'TRACE: {module}.{method}({args}) // {hash}',
    'ASSERT: {condition} failed // {hash}',
  ];

  private static generateHash(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 4);
  }

  private static xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result);
  }

  private static xorDecrypt(encryptedText: string, key: string): string {
    try {
      const text = atob(encryptedText);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch {
      return '';
    }
  }

  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static generateFakeCode(message: string): string {
    const template = this.getRandomElement(this.CODE_TEMPLATES);
    const words = message.split(' ');
    const hash = this.generateHash(message);
    
    return template
      .replace('{function}', `sync_${words[0] || 'data'}`)
      .replace('{variable}', words[0] || 'temp')
      .replace('{operation}', words[1] || 'process')
      .replace('{method}', words[0] || 'fetch')
      .replace('{params}', `id_${Math.random().toString(36).substring(7)}`)
      .replace('{condition}', `user_${Math.random().toString(36).substring(7)}`)
      .replace('{action}', words[2] || 'execute')
      .replace('{key}', `cache_${words[0] || 'temp'}`)
      .replace('{value}', JSON.stringify(words.slice(1).join('_') || 'null'))
      .replace('{type}', words[0] || 'action')
      .replace('{action}', words[1] || 'update')
      .replace('{data}', JSON.stringify(words.slice(2).join('_') || '{}'))
      .replace('{hash}', hash);
  }

  private static generateFakeLog(message: string): string {
    const template = this.getRandomElement(this.LOG_TEMPLATES);
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const events = ['API_CALL', 'CACHE_UPDATE', 'AUTH_EVENT', 'SYNC_START'];
    const processes = ['background_sync', 'data_processor', 'auth_handler', 'cache_manager'];
    const hash = this.generateHash(message);
    
    return template
      .replace('{level}', this.getRandomElement(levels))
      .replace('{message}', message.split(' ').slice(0, 3).join('_').toUpperCase())
      .replace('{timestamp}', new Date().toISOString().split('T')[1].split('.')[0])
      .replace('{event}', this.getRandomElement(events))
      .replace('{details}', message.split(' ').slice(0, 2).join('_'))
      .replace('{operation}', message.split(' ')[0] || 'process')
      .replace('{time}', Math.floor(Math.random() * 500 + 50).toString())
      .replace('{process}', this.getRandomElement(processes))
      .replace('{status}', Math.random() > 0.5 ? 'SUCCESS' : 'PENDING')
      .replace('{hash}', hash);
  }

  private static generateFakeCommit(message: string): string {
    const template = this.getRandomElement(this.COMMIT_TEMPLATES);
    const hash = this.generateHash(message);
    
    return template
      .replace('{message}', message.split(' ').slice(0, 5).join('_'))
      .replace('{hash}', hash);
  }

  private static generateFakeDebug(message: string): string {
    const template = this.getRandomElement(this.DEBUG_TEMPLATES);
    const variables = ['user_id', 'session_token', 'api_key', 'cache_size'];
    const modules = ['auth', 'api', 'cache', 'utils'];
    const methods = ['validate', 'process', 'fetch', 'update'];
    const hash = this.generateHash(message);
    
    return template
      .replace('{variable}', this.getRandomElement(variables))
      .replace('{value}', JSON.stringify(message.split(' ').slice(0, 2).join('_')))
      .replace('{function}', this.getRandomElement(methods))
      .replace('{line}', Math.floor(Math.random() * 100 + 1).toString())
      .replace('{module}', this.getRandomElement(modules))
      .replace('{method}', this.getRandomElement(methods))
      .replace('{args}', message.split(' ').slice(0, 3).join(', '))
      .replace('{condition}', `${this.getRandomElement(variables)} !== null`)
      .replace('{hash}', hash);
  }

  public static encode(message: string, key: string = this.SECRET_KEY, options: Partial<EncodingOptions> = {}): string {
    const defaultOptions: EncodingOptions = {
      style: 'code',
      includeTimestamp: true,
      includeHash: true,
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // First encrypt the message
    const encrypted = this.xorEncrypt(message, key);
    
    // Then encode it as fake developer content
    let fakeContent = '';
    
    switch (finalOptions.style) {
      case 'code':
        fakeContent = this.generateFakeCode(message);
        break;
      case 'logs':
        fakeContent = this.generateFakeLog(message);
        break;
      case 'commits':
        fakeContent = this.generateFakeCommit(message);
        break;
      case 'debug':
        fakeContent = this.generateFakeDebug(message);
        break;
      default:
        fakeContent = this.generateFakeCode(message);
    }
    
    // Embed the encrypted message in a way that's not obvious
    const encodedMessage = `${fakeContent}|${encrypted}`;
    
    return encodedMessage;
  }

  public static decode(encodedMessage: string, key: string = this.SECRET_KEY): string {
    try {
      // Split the fake content from the encrypted message
      const parts = encodedMessage.split('|');
      if (parts.length < 2) {
        return ''; // Invalid format
      }
      
      const encrypted = parts[parts.length - 1]; // Get the last part (encrypted message)
      return this.xorDecrypt(encrypted, key);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  public static isValidEncodedMessage(message: string): boolean {
    try {
      const parts = message.split('|');
      return parts.length >= 2 && parts[parts.length - 1].length > 0;
    } catch {
      return false;
    }
  }

  public static generateRandomFakeContent(style: EncodingStyle = 'code'): string {
    const fakeMessages = [
      'Processing user data...',
      'Cache update completed',
      'API response received',
      'Authentication successful',
      'Database connection established',
    ];
    
    const randomMessage = this.getRandomElement(fakeMessages);
    return this.encode(randomMessage, 'dummy_key', { style });
  }
}
