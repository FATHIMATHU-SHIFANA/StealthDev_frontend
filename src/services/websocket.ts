import { SecurityManager } from '../utils/security';

export interface WebSocketMessage {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string;
  type: 'message' | 'status' | 'error';
}

export interface WebSocketCallbacks {
  onMessage: (message: WebSocketMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onError: (error: Error) => void;
}

export interface WebSocketService {
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => Promise<void>;
  isConnected: () => boolean;
  setCallbacks: (callbacks: WebSocketCallbacks) => void;
}

export class WebSocketServiceImpl implements WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.callbacks?.onConnect();
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            // Decrypt message if it's encrypted
            if (message.type === 'message' && message.content) {
              try {
                const decrypted = await SecurityManager.decryptMessage(message.content);
                message.content = decrypted;
              } catch {
                // If decryption fails, keep original content
              }
            }
            
            this.callbacks?.onMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.callbacks?.onDisconnect();
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks?.onError(new Error('WebSocket connection error'));
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    try {
      // Encrypt message before sending
      const encrypted = await SecurityManager.encryptMessage(message);
      
      const webSocketMessage: WebSocketMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        content: encrypted,
        timestamp: new Date(),
        senderId: 'web_client',
        type: 'message',
      };

      this.ws.send(JSON.stringify(webSocketMessage));
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = callbacks;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      // Note: In a real implementation, you'd need to store the URL
      // this.connect(this.storedUrl);
    }, delay);
  }
}

// Mock WebSocket Service for development
export class MockWebSocketService implements WebSocketService {
  private callbacks: WebSocketCallbacks | null = null;
  private connected = false;

  connect(url: string): Promise<void> {
    return new Promise((resolve) => {
      console.log('Mock WebSocket connecting to:', url);
      
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        this.callbacks?.onConnect();
        resolve();
        
        // Start sending mock messages
        this.startMockMessaging();
      }, 1000);
    });
  }

  disconnect(): void {
    this.connected = false;
    this.callbacks?.onDisconnect();
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.connected) {
      throw new Error('Mock WebSocket is not connected');
    }

    // Simulate message processing
    setTimeout(() => {
      const mockResponse: WebSocketMessage = {
        id: `response_${Date.now()}`,
        content: `Echo: ${message}`,
        timestamp: new Date(),
        senderId: 'mock_server',
        type: 'message',
      };
      
      this.callbacks?.onMessage(mockResponse);
    }, Math.random() * 1000 + 500);
  }

  isConnected(): boolean {
    return this.connected;
  }

  setCallbacks(callbacks: WebSocketCallbacks): void {
    this.callbacks = callbacks;
  }

  private startMockMessaging(): void {
    const mockMessages = [
      'Server: Connection established',
      'Server: Welcome to stealth chat',
      'Server: All messages are encrypted',
      'Server: Your secret key is secure',
    ];

    mockMessages.forEach((msg, index) => {
      setTimeout(() => {
        if (this.connected) {
          const message: WebSocketMessage = {
            id: `mock_${index}`,
            content: msg,
            timestamp: new Date(),
            senderId: 'mock_system',
            type: 'message',
          };
          
          this.callbacks?.onMessage(message);
        }
      }, (index + 1) * 2000);
    });
  }
}

// Factory function to get appropriate service
export const createWebSocketService = (useMock: boolean = true): WebSocketService => {
  return useMock ? new MockWebSocketService() : new WebSocketServiceImpl();
};
