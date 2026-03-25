import { useState, useEffect, useCallback } from 'react';
import { createWebSocketService, WebSocketService, WebSocketMessage, WebSocketCallbacks } from '../services/websocket';

export const useWebSocket = (useMock: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const [webSocketService] = useState<WebSocketService>(() => 
    createWebSocketService(useMock)
  );

  const connect = useCallback(async (url: string) => {
    try {
      setError(null);
      
      const callbacks: WebSocketCallbacks = {
        onConnect: () => {
          setIsConnected(true);
          setError(null);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onError: (err) => {
          setError(err);
          setIsConnected(false);
        },
        onMessage: (message) => {
          setMessages(prev => [...prev, message]);
        },
      };

      webSocketService.setCallbacks(callbacks);
      await webSocketService.connect(url);
    } catch (err) {
      setError(err as Error);
      setIsConnected(false);
    }
  }, [webSocketService]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
  }, [webSocketService]);

  const sendMessage = useCallback(async (content: string) => {
    try {
      await webSocketService.sendMessage(content);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [webSocketService]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isConnected) {
        webSocketService.disconnect();
      }
    };
  }, [isConnected, webSocketService]);

  return {
    isConnected,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
};
