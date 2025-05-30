import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../constants/mqttTopics';

class MqttService {
  constructor() {
    this.localClient = null;
    this.cloudClient = null;
    this.subscribers = new Map();
    this._isLocalConnected = false;
    this._isCloudConnected = false;
  }

  async connect() {
    try {
      await this.connectLocal();
    } catch (localError) {
      console.log('Error al conectar al broker local, intentando conectar al broker cloud...');
      try {
        await this.connectCloud();
      } catch (cloudError) {
        console.error('Error al conectar con ambos brokers:', cloudError);
        throw cloudError;
      }
    }
  }

  async connectLocal() {
    return new Promise((resolve, reject) => {
      this.localClient = mqtt.connect(`mqtt://${MQTT_CONFIG.LOCAL_HOST}:${MQTT_CONFIG.LOCAL_PORT}`, {
        clientId: `local_${Math.random().toString(16).substr(2, 8)}`,
        ...MQTT_CONFIG.LOCAL_OPTIONS
      });

      this.localClient.on('connect', () => {
        console.log('Conectado al broker local');
        this._isLocalConnected = true;
        resolve();
      });

      this.localClient.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          if (this.subscribers.has(topic)) {
            this.subscribers.get(topic).forEach(callback => {
              callback(payload, 'local');
            });
          }
        } catch (error) {
          console.error('Error al procesar mensaje MQTT:', error);
        }
      });

      this.localClient.on('error', (err) => {
        console.error('Error en MQTT local:', err);
        this._isLocalConnected = false;
        reject(err);
      });

      this.localClient.on('close', () => {
        console.log('Conexión perdida con broker local');
        this._isLocalConnected = false;
        // Intentar reconectar al cloud si no está conectado
        if (!this._isCloudConnected) {
          this.connectCloud().catch(console.error);
        }
      });
    });
  }

  async connectCloud() {
    return new Promise((resolve, reject) => {
      this.cloudClient = mqtt.connect(`mqtts://${MQTT_CONFIG.CLOUD_HOST}:${MQTT_CONFIG.CLOUD_PORT}`, {
        clientId: `cloud_${Math.random().toString(16).substr(2, 8)}`,
        username: MQTT_CONFIG.CLOUD_OPTIONS.username,
        password: MQTT_CONFIG.CLOUD_OPTIONS.password,
        ...MQTT_CONFIG.CLOUD_OPTIONS
      });

      this.cloudClient.on('connect', () => {
        console.log('Conectado al broker EMQX Cloud');
        this._isCloudConnected = true;
        resolve();
      });

      this.cloudClient.on('message', (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          if (this.subscribers.has(topic)) {
            this.subscribers.get(topic).forEach(callback => {
              callback(payload, 'cloud');
            });
          }
        } catch (error) {
          console.error('Error al procesar mensaje MQTT:', error);
        }
      });

      this.cloudClient.on('error', (err) => {
        console.error('Error en MQTT cloud:', err);
        this._isCloudConnected = false;
        reject(err);
      });

      this.cloudClient.on('close', () => {
        console.log('Conexión perdida con broker cloud');
        this._isCloudConnected = false;
        // Intentar reconectar al local si no está conectado
        if (!this._isLocalConnected) {
          this.connectLocal().catch(console.error);
        }
      });
    });
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
      // Suscribirse en ambos clientes si están conectados
      if (this.localClient && this._isLocalConnected) {
        this.localClient.subscribe(topic);
      }
      if (this.cloudClient && this._isCloudConnected) {
        this.cloudClient.subscribe(topic);
      }
    }
    this.subscribers.get(topic).push(callback);
  }

  publish(topic, message) {
    const payload = JSON.stringify(message);
    if (this.localClient && this._isLocalConnected) {
      this.localClient.publish(topic, payload);
    }
    if (this.cloudClient && this._isCloudConnected) {
      this.cloudClient.publish(topic, payload);
    }
  }

  disconnect() {
    if (this.localClient) {
      this.localClient.end();
      this._isLocalConnected = false;
    }
    if (this.cloudClient) {
      this.cloudClient.end();
      this._isCloudConnected = false;
    }
  }

  // Getters para el estado de conexión
  get isLocalConnected() {
    return this._isLocalConnected;
  }

  get isCloudConnected() {
    return this._isCloudConnected;
  }

  // Método para verificar el estado de conexión
  checkConnection() {
    return {
      local: this._isLocalConnected,
      cloud: this._isCloudConnected,
      connected: this._isLocalConnected || this._isCloudConnected
    };
  }

  unsubscribe(topic) {
    // Desuscribirse en ambos clientes si están conectados
    if (this.localClient && this._isLocalConnected) {
      this.localClient.unsubscribe(topic);
    }
    if (this.cloudClient && this._isCloudConnected) {
      this.cloudClient.unsubscribe(topic);
    }
    // Eliminar los callbacks del topic
    this.subscribers.delete(topic);
  }
}

export const mqttService = new MqttService(); 