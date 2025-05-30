import { Alert } from 'react-native';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Set();
  }

  connect(url = 'ws://tu-servidor-websocket.com') {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
        this.reconnectAttempts = 0;
        this.notifyListeners('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners('message', data);
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.notifyListeners('error', error);
      };

      this.ws.onclose = () => {
        console.log('Conexión WebSocket cerrada');
        this.notifyListeners('disconnected');
        this.reconnect();
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar... Intento ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 3000);
    } else {
      Alert.alert(
        'Error de conexión',
        'No se pudo establecer conexión con el servidor'
      );
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => callback(event, data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }
}

export const websocketService = new WebSocketService(); 