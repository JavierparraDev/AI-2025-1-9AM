import { useEffect, useState } from 'react';
import { mqttService } from '../services/mqttService';
import { notificationService } from '../services/notificationService';

export const useMQTT = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleMQTTEvent = (event, data) => {
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

    // Conectar al MQTT
    mqttService.connect();

    // Agregar listener
    const removeListener = mqttService.addListener(handleMQTTEvent);

    // Limpiar al desmontar
    return () => {
      removeListener();
      mqttService.disconnect();
    };
  }, []);

  const sendMessage = (message) => {
    mqttService.publish(message);
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
  };
}; 