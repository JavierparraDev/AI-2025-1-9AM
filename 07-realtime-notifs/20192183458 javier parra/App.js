import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMqttConnection } from './src/hooks/useMqttConnection';

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const deviceId = 'raspi1'; // ID del dispositivo a monitorear
  const { isConnected, messages, sendCommand } = useMqttConnection(deviceId);

  // Solicitar permisos de notificación
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Función para enviar notificación push
  const sendPushNotification = async (alert) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Alerta: ${alert.tipo}`,
        body: alert.descripcion,
      },
      trigger: null,
    });
  };

  // Función para solicitar permisos de notificación
  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('¡Se requieren permisos de notificación!');
      return;
    }
  };

  // Renderizar telemetría
  const renderTelemetry = () => {
    const lastTelemetry = messages.telemetry[messages.telemetry.length - 1];
    if (!lastTelemetry) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Telemetría</Text>
        <View style={styles.telemetryContainer}>
          <Text style={styles.telemetryText}>
            Temperatura: {lastTelemetry.temperature}°C
          </Text>
          <Text style={styles.telemetryText}>
            Humedad: {lastTelemetry.humidity}%
          </Text>
          <Text style={styles.telemetryText}>
            Luz: {lastTelemetry.light}
          </Text>
          <Text style={styles.telemetryText}>
            Ventilador: {lastTelemetry.fan}
          </Text>
        </View>
      </View>
    );
  };

  // Renderizar controles
  const renderControls = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Controles</Text>
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendCommand('light', 'TOGGLE')}
        >
          <Text style={styles.controlButtonText}>Toggle Luz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => sendCommand('fan', 'TOGGLE')}
        >
          <Text style={styles.controlButtonText}>Toggle Ventilador</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar alertas
  const renderAlerts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Alertas Recientes</Text>
      {messages.alerts.slice(-5).map((alert, index) => (
        <View key={index} style={styles.alertContainer}>
          <Text style={styles.alertTitle}>{alert.tipo}</Text>
          <Text style={styles.alertDescription}>{alert.descripcion}</Text>
          <Text style={styles.alertSource}>Fuente: {alert.source}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sistema de Alertas IoT</Text>
      <Text style={[styles.status, { color: isConnected ? '#4CAF50' : '#F44336' }]}>
        Estado: {isConnected ? 'Conectado' : 'Desconectado'}
      </Text>
      
      <ScrollView style={styles.scrollView}>
        {renderTelemetry()}
        {renderControls()}
        {renderAlerts()}
        {/* Mostrar todos los mensajes recibidos de cualquier topic */}
        {messages.all && messages.all.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todos los Mensajes MQTT</Text>
            {messages.all.slice().reverse().map((msg, idx) => (
              <View key={idx} style={styles.telemetryContainer}>
                <Text style={styles.telemetryText}>Topic: {msg.topic || 'Desconocido'}</Text>
                <Text style={styles.telemetryText}>Mensaje: {JSON.stringify(msg)}</Text>
                <Text style={styles.telemetryText}>Fuente: {msg.source}</Text>
                <Text style={styles.telemetryText}>Hora: {new Date(msg.timestamp).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  telemetryContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
  },
  telemetryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  alertDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  alertSource: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 