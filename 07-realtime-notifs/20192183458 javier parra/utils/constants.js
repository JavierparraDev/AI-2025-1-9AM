export const MQTT_CONFIG = {
  host: '192.168.193.114',
  port: 1887,
  topic: 'usco/topic',
  clientId: `realtime-alerts-${Math.random().toString(16).substr(2, 8)}`,
};

export const ALERT_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info',
};

export const ALERT_COLORS = {
  [ALERT_TYPES.ERROR]: '#ff4444',
  [ALERT_TYPES.WARNING]: '#ffbb33',
  [ALERT_TYPES.SUCCESS]: '#00C851',
  [ALERT_TYPES.INFO]: '#2196F3',
};

export const NOTIFICATION_CHANNEL = {
  id: 'alerts',
  name: 'Alertas',
  importance: 'high',
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
}; 