import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { websocketService } from '../services/websocketService';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleWebSocketEvent = (event, data) => {
      switch (event) {
        case 'connected':
          setIsConnected(true);
          setError(null);
          break;
        case 'disconnected':
          setIsConnected(false);
          break;
        case 'error':
          setError(data);
          break;
        case 'message':
          setLastMessage(data);
          // Mostrar notificación cuando se recibe un mensaje
          if (data.title && data.body) {
            notificationService.showNotification(data.title, data.body, data);
          }
          break;
      }
    };

    // Conectar al WebSocket
    websocketService.connect(url);

    // Agregar listener
    const removeListener = websocketService.addListener(handleWebSocketEvent);

    // Limpiar al desmontar
    return () => {
      removeListener();
      websocketService.disconnect();
    };
  }, [url]);

  const sendMessage = (message) => {
    websocketService.send(message);
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
  };
}; 