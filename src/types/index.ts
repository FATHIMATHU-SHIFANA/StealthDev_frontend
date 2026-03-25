export interface Message {
  id: string;
  content: string;
  encodedContent: string;
  timestamp: Date;
  senderId: string;
  isEncrypted: boolean;
}

export interface EncodedMessage {
  fakeContent: string;
  hash: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface AppState {
  isPrivateMode: boolean;
  isPanicMode: boolean;
  secretKey: string;
  messages: Message[];
  currentUser: User | null;
}

export type EncodingStyle = 'code' | 'logs' | 'commits' | 'debug';

export interface EncodingOptions {
  style: EncodingStyle;
  includeTimestamp: boolean;
  includeHash: boolean;
}
