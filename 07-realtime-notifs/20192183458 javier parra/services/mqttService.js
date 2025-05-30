import mqtt from 'mqtt';
import { Alert } from 'react-native';
import { MQTT_CONFIG } from '../utils/constants';

class MQTTService {
  constructor() {
    this.client = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Set();
  }

  connect() {
    try {
      const url = `mqtt://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`;
      this.client = mqtt.connect(url, {
        clientId: MQTT_CONFIG.clientId,
        clean: true,
        reconnectPeriod: 1000,
      });

      this.client.on('connect', () => {
        console.log('Conexión MQTT establecida');
        this.reconnectAttempts = 0;
        this.client.subscribe(MQTT_CONFIG.topic, (err) => {
          if (err) {
            console.error('Error al suscribirse:', err);
          } else {
            console.log('Suscrito al tópico:', MQTT_CONFIG.topic);
          }
        });
        this.notifyListeners('connected');
      });

      this.client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          this.notifyListeners('message', data);
        } catch (error) {
          // Si el mensaje no es JSON, lo enviamos como texto plano
          this.notifyListeners('message', {
            type: 'info',
            title: 'Nuevo mensaje',
            body: message.toString(),
            timestamp: new Date().toISOString()
          });
        }
      });

      this.client.on('error', (error) => {
        console.error('Error en MQTT:', error);
        this.notifyListeners('error', error);
      });

      this.client.on('close', () => {
        console.log('Conexión MQTT cerrada');
        this.notifyListeners('disconnected');
        this.reconnect();
      });

    } catch (error) {
      console.error('Error al conectar MQTT:', error);
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
        'No se pudo establecer conexión con el servidor MQTT'
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
    if (this.client) {
      this.client.end();
    }
  }

  publish(message) {
    if (this.client && this.client.connected) {
      this.client.publish(MQTT_CONFIG.topic, JSON.stringify(message));
    } else {
      console.warn('Cliente MQTT no está conectado');
    }
  }
}

export const mqttService = new MQTTService(); 