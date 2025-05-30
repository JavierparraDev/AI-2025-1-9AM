export const MQTT_TOPICS = {
  // Telemetría y estado
  TELEMETRY: 'state/telemetry/{device_id}',
  ALL_TELEMETRY: 'state/telemetry/#',
  // Comandos
  COMMAND_LIGHT: 'command/{device_id}/light',
  COMMAND_FAN: 'command/{device_id}/fan',
  ALL_COMMANDS: 'command/#',
  // Resultados de inferencia
  RESULT: 'result/{device_id}',
  ALL_RESULTS: 'result/#',
  // Alertas
  ALERT: 'alert/{device_id}',
  ALL_ALERTS: 'alert/#'
};

export const MQTT_CONFIG = {
  // Configuración del broker local
  LOCAL_HOST: '192.168.45.64',
  LOCAL_PORT: 9001,
  LOCAL_OPTIONS: {
    protocol: 'ws',
    useSSL: false,
    timeout: 3,
    onSuccess: () => console.log('Conectado al broker local'),
    onFailure: (error) => console.error('Error al conectar al broker local:', error)
  },

  // Configuración del broker EMQX Cloud
  CLOUD_HOST: 'cbbd0c65.ala.dedicated.aws.emqxcloud.com',
  CLOUD_PORT: 8883,
  CLOUD_OPTIONS: {
    useSSL: true,
    timeout: 3,
    username: 'user123',
    password: '123456789',
    clientId: 'react-native-client',
    onSuccess: () => console.log('Conectado al broker EMQX Cloud'),
    onFailure: (error) => console.error('Error al conectar al broker EMQX Cloud:', error)
  }
};

export const DEVICE_TYPES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  LIGHT: 'light',
  FAN: 'fan',
  MOTION: 'motion',
  FACE_DETECTION: 'face_detection'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'alerts',
  CHANNEL_NAME: 'Alertas IoT',
  CHANNEL_DESCRIPTION: 'Canal para notificaciones de alertas IoT'
}; 