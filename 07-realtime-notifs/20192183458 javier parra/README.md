# Aplicación de Alertas IoT en Tiempo Real

Esta aplicación móvil permite monitorear y controlar dispositivos IoT a través de MQTT.

## 📱 Requisitos Previos

1. Instalar [Node.js](https://nodejs.org/) (versión LTS)
2. Instalar [Expo Go](https://expo.dev/client) en tu dispositivo móvil
3. Tener una cuenta en [Expo](https://expo.dev/signup)

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd realtime-alerts
```

2. Instalar dependencias:
```bash
npm install
```

## 💻 Ejecutar la Aplicación

1. Iniciar el servidor de desarrollo:
```bash
npm start
```

2. Escanear el código QR:
   - En Android: Usa la app Expo Go para escanear el código QR
   - En iOS: Usa la cámara del iPhone para escanear el código QR

## 🔧 Configuración

### Broker MQTT
La aplicación está configurada para usar dos brokers MQTT:
- Local: `ws://broker.hivemq.com:8000/mqtt`
- Nube: `wss://<tu-instancia>.ala.dedicated.aws.emqxcloud.com:443`

Para cambiar la configuración, edita el archivo `src/constants/mqttTopics.js`.

### Pruebas con mosquitto_pub

1. Enviar telemetría:
```bash
mosquitto_pub -h broker.hivemq.com -p 8000 -t "state/telemetry/raspi1" -m '{"temperature": 28.5, "humidity": 65, "light": "OFF", "fan": "ON"}'
```

2. Enviar alerta:
```bash
mosquitto_pub -h broker.hivemq.com -p 8000 -t "alert/raspi1" -m '{"tipo": "movimiento", "descripcion": "Movimiento detectado en la puerta principal"}'
```

3. Enviar resultado de inferencia:
```bash
mosquitto_pub -h broker.hivemq.com -p 8000 -t "result/raspi1" -m '{"has_face": true, "confidence": 0.95}'
```

## 📱 Características

- Monitoreo de telemetría en tiempo real
- Control de dispositivos (luz y ventilador)
- Notificaciones push para alertas
- Conexión dual (local y nube)
- Reconexión automática

## 🔍 Solución de Problemas

1. Si la aplicación no se conecta:
   - Verifica tu conexión a Internet
   - Asegúrate de que el broker MQTT esté accesible
   - Revisa los logs en la consola de Expo

2. Si las notificaciones no funcionan:
   - Verifica los permisos de notificación en tu dispositivo
   - Asegúrate de que la app tenga permisos de notificación

## 📞 Soporte

Para reportar problemas o sugerir mejoras, por favor crea un issue en el repositorio.

---
Desarrollado por: Javier Parra (20192183458)
