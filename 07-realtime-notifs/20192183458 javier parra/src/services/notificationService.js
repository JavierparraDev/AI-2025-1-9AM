import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CONFIG } from '../constants/mqttTopics';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.token = null;
    this.configure();
  }

  async configure() {
    // Crear canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        NOTIFICATION_CONFIG.CHANNEL_ID,
        {
          name: NOTIFICATION_CONFIG.CHANNEL_NAME,
          description: NOTIFICATION_CONFIG.CHANNEL_DESCRIPTION,
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        }
      );
    }
  }

  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permiso de notificaciones no concedido');
    }

    // Obtener el token de notificación
    this.token = await Notifications.getExpoPushTokenAsync();
    return this.token;
  }

  async sendTelemetryAlert(deviceId, data) {
    const { temperature, humidity, light, sound } = data;
    
    // Verificar condiciones de alerta
    if (temperature > 30 || humidity > 80 || light > 1000 || sound > 80) {
      await this.scheduleNotification({
        title: '⚠️ Alerta de Telemetría',
        body: `Dispositivo ${deviceId}: Temperatura: ${temperature}°C, Humedad: ${humidity}%, Luz: ${light}lx, Sonido: ${sound}dB`,
        data: { type: 'telemetry', deviceId, ...data }
      });
    }
  }

  async sendFaceDetectionAlert(deviceId, data) {
    const { faces, confidence } = data;
    
    if (faces > 0) {
      await this.scheduleNotification({
        title: '👥 Detección de Personas',
        body: `Dispositivo ${deviceId}: ${faces} persona(s) detectada(s) con ${confidence}% de confianza`,
        data: { type: 'face_detection', deviceId, ...data }
      });
    }
  }

  async sendDeviceAlert(deviceId, data) {
    const { type, message } = data;
    
    await this.scheduleNotification({
      title: `🚨 Alerta de Dispositivo`,
      body: `Dispositivo ${deviceId}: ${message}`,
      data: { type: 'device_alert', deviceId, ...data }
    });
  }

  async scheduleNotification({ title, body, data }) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Enviar inmediatamente
    });
  }

  // Método para manejar notificaciones recibidas cuando la app está en primer plano
  setNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Método para manejar cuando el usuario toca una notificación
  setNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService(); 