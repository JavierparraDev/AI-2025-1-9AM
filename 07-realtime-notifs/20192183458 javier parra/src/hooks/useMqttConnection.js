import { useEffect, useState } from 'react';
import { MQTT_TOPICS } from '../constants/mqttTopics';
import { mqttService } from '../services/mqttService';
import { notificationService } from '../services/notificationService';

export const useMqttConnection = (deviceId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState(null); // 'local' o 'cloud'
  const [messages, setMessages] = useState({
    telemetry: [],
    commands: [],
    results: [],
    alerts: [],
    all: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Solicitar permisos de notificación
    notificationService.requestPermissions().catch(console.error);

    // Conectar al broker MQTT
    mqttService.connect();

    // Suscribirse a los tópicos específicos del dispositivo
    const topics = {
      telemetry: MQTT_TOPICS.TELEMETRY.replace('{device_id}', deviceId),
      commandLight: MQTT_TOPICS.COMMAND_LIGHT.replace('{device_id}', deviceId),
      commandFan: MQTT_TOPICS.COMMAND_FAN.replace('{device_id}', deviceId),
      result: MQTT_TOPICS.RESULT.replace('{device_id}', deviceId),
      alert: MQTT_TOPICS.ALERT.replace('{device_id}', deviceId)
    };

    // Manejar mensajes de telemetría
    mqttService.subscribe(topics.telemetry, (data, source) => {
      setMessages(prev => ({
        ...prev,
        telemetry: [...prev.telemetry, { ...data, source, timestamp: new Date() }]
      }));
      notificationService.sendTelemetryAlert(deviceId, data);
    });

    // Manejar comandos
    mqttService.subscribe(topics.commandLight, (data, source) => {
      setMessages(prev => ({
        ...prev,
        commands: [...prev.commands, { type: 'light', ...data, source, timestamp: new Date() }]
      }));
    });

    mqttService.subscribe(topics.commandFan, (data, source) => {
      setMessages(prev => ({
        ...prev,
        commands: [...prev.commands, { type: 'fan', ...data, source, timestamp: new Date() }]
      }));
    });

    // Manejar resultados de inferencia
    mqttService.subscribe(topics.result, (data, source) => {
      setMessages(prev => ({
        ...prev,
        results: [...prev.results, { ...data, source, timestamp: new Date() }]
      }));
      notificationService.sendFaceDetectionAlert(deviceId, data);
    });

    // Manejar alertas
    mqttService.subscribe(topics.alert, (data, source) => {
      setMessages(prev => ({
        ...prev,
        alerts: [...prev.alerts, { ...data, source, timestamp: new Date() }]
      }));
      notificationService.sendDeviceAlert(deviceId, data);
    });

    // Suscribirse a todos los tópicos wildcard para recibir cualquier mensaje
    mqttService.subscribe('#', (data, source) => {
      setMessages(prev => ({
        ...prev,
        all: [...(prev.all || []), { ...data, source, timestamp: new Date() }]
      }));
      console.log(`[MQTT][${source}] Mensaje recibido:`, data);
    });

    // Limpiar al desmontar
    return () => {
      Object.values(topics).forEach(topic => {
        mqttService.unsubscribe(topic);
      });
      mqttService.disconnect();
    };
  }, [deviceId]);

  // Escuchar cambios en el estado de conexión
  useEffect(() => {
    const checkConnection = () => {
      const localConnected = mqttService.isLocalConnected;
      const cloudConnected = mqttService.isCloudConnected;
      setIsConnected(localConnected || cloudConnected);
      setConnectionType(localConnected ? 'local' : cloudConnected ? 'cloud' : null);
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Función para enviar comandos
  const sendCommand = (type, value) => {
    const topic = type === 'light' 
      ? MQTT_TOPICS.COMMAND_LIGHT.replace('{device_id}', deviceId)
      : MQTT_TOPICS.COMMAND_FAN.replace('{device_id}', deviceId);

    mqttService.publish(topic, { value });
  };

  return {
    isConnected,
    connectionType,
    messages,
    error,
    sendCommand
  };
}; 