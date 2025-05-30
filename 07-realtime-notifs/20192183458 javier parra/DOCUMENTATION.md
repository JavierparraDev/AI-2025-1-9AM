# Documentación del Proyecto de Alertas IoT en Tiempo Real

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Funcionalidades Principales](#funcionalidades-principales)
7. [Guía de Desarrollo](#guía-de-desarrollo)
8. [Protocolo MQTT](#protocolo-mqtt)
9. [API Reference](#api-reference)
10. [Solución de Problemas](#solución-de-problemas)
11. [Seguridad](#seguridad)
12. [Mantenimiento](#mantenimiento)

## Descripción General
Este proyecto es una aplicación móvil desarrollada con React Native y Expo que permite monitorear y controlar dispositivos IoT a través del protocolo MQTT. La aplicación está diseñada para proporcionar alertas en tiempo real y control remoto de dispositivos IoT.

## Arquitectura del Sistema
El sistema está compuesto por los siguientes componentes principales:

1. **Aplicación Móvil (Frontend)**
   - Desarrollada en React Native
   - Interfaz de usuario con React Native Paper
   - Gestión de estado con React Context
   - Comunicación MQTT con mqtt-react-hooks

2. **Broker MQTT**
   - Broker local: HiveMQ (ws://broker.hivemq.com:8000/mqtt)
   - Broker en la nube: EMQX Cloud (wss://<instancia>.ala.dedicated.aws.emqxcloud.com:443)

3. **Dispositivos IoT**
   - Raspberry Pi con sensores
   - Cámara para detección de movimiento
   - Sensores de temperatura y humedad
   - Actuadores (luces y ventiladores)

## Requisitos del Sistema

### Requisitos de Desarrollo
- Node.js (versión LTS)
- npm o yarn
- Expo CLI
- Git
- Editor de código (VS Code recomendado)

### Requisitos de Ejecución
- Dispositivo móvil con Android 6.0+ o iOS 11.0+
- Aplicación Expo Go instalada
- Conexión a Internet
- Cuenta en Expo

## Instalación y Configuración

### 1. Preparación del Entorno
```bash
# Instalar Expo CLI globalmente
npm install -g expo-cli

# Clonar el repositorio
git clone <url-del-repositorio>
cd realtime-alerts

# Instalar dependencias
npm install
```

### 2. Configuración del Entorno
1. Crear archivo `.env` en la raíz del proyecto:
```env
MQTT_BROKER_URL=ws://broker.hivemq.com:8000/mqtt
MQTT_CLOUD_URL=wss://<tu-instancia>.ala.dedicated.aws.emqxcloud.com:443
```

### 3. Ejecución del Proyecto
```bash
# Iniciar el servidor de desarrollo
npm start

# Para desarrollo en modo producción
npm run build
```

## Estructura del Proyecto
```
realtime-alerts/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── constants/      # Constantes y configuraciones
│   ├── hooks/         # Hooks personalizados
│   ├── services/      # Servicios y lógica de negocio
│   └── utils/         # Utilidades y helpers
├── assets/            # Recursos estáticos
├── app/              # Navegación y rutas
└── components/       # Componentes principales
```

## Funcionalidades Principales

### 1. Monitoreo en Tiempo Real
- Visualización de telemetría (temperatura, humedad)
- Estado de dispositivos (luz, ventilador)
- Gráficos de tendencias

### 2. Sistema de Alertas
- Notificaciones push
- Alertas de movimiento
- Alertas de condiciones ambientales

### 3. Control de Dispositivos
- Control de luces
- Control de ventiladores
- Modo automático/manual

## Ejemplos de Uso

### 1. Configuración de un Nuevo Dispositivo IoT
```javascript
// Ejemplo de configuración de un nuevo dispositivo
const deviceConfig = {
  id: "raspi1",
  name: "Raspberry Pi Principal",
  type: "sensor",
  capabilities: ["temperature", "humidity", "motion"],
  location: "Sala Principal"
};
```

### 2. Implementación de Alertas Personalizadas
```javascript
// Ejemplo de configuración de alerta personalizada
const customAlert = {
  type: "temperature",
  threshold: 30,
  condition: "greater_than",
  message: "¡Temperatura crítica detectada!",
  action: "notify_admin"
};
```

### 3. Integración con Sistemas Externos
```javascript
// Ejemplo de integración con sistema de monitoreo
const monitoringConfig = {
  endpoint: "https://api.monitoring-system.com",
  apiKey: "YOUR_API_KEY",
  metrics: ["temperature", "humidity", "motion"],
  interval: 300 // 5 minutos
};
```

### 4. Casos de Uso Comunes

#### Monitoreo de Temperatura
1. Configurar umbrales de temperatura
2. Recibir notificaciones cuando se excedan los límites
3. Visualizar tendencias en tiempo real

#### Control de Acceso
1. Configurar zonas de acceso
2. Recibir alertas de movimiento
3. Verificar identidad mediante cámara

#### Automatización de Dispositivos
1. Programar horarios de funcionamiento
2. Configurar reglas de automatización
3. Monitorear consumo energético

## Guía de Desarrollo

### Convenciones de Código
- Usar TypeScript para nuevos componentes
- Seguir el patrón de diseño de componentes de React
- Implementar manejo de errores consistente
- Documentar funciones y componentes

### Flujo de Trabajo
1. Crear una rama para cada feature
2. Seguir el patrón de commits convencionales
3. Realizar pruebas antes de hacer merge
4. Documentar cambios significativos

## Protocolo MQTT

### Tópicos Principales
- `state/telemetry/<device_id>`: Telemetría de dispositivos
- `alert/<device_id>`: Alertas del sistema
- `result/<device_id>`: Resultados de inferencia
- `control/<device_id>`: Comandos de control

### Formato de Mensajes
```json
// Telemetría
{
  "temperature": 28.5,
  "humidity": 65,
  "light": "OFF",
  "fan": "ON"
}

// Alerta
{
  "tipo": "movimiento",
  "descripcion": "Movimiento detectado en la puerta principal"
}

// Resultado de Inferencia
{
  "has_face": true,
  "confidence": 0.95
}
```

## API Reference

### Endpoints

#### Dispositivos
```typescript
// Obtener lista de dispositivos
GET /api/devices
Response: Device[]

// Obtener dispositivo específico
GET /api/devices/:id
Response: Device

// Crear nuevo dispositivo
POST /api/devices
Body: DeviceConfig
Response: Device

// Actualizar dispositivo
PUT /api/devices/:id
Body: DeviceUpdate
Response: Device

// Eliminar dispositivo
DELETE /api/devices/:id
Response: void
```

#### Alertas
```typescript
// Obtener alertas
GET /api/alerts
Query: { status?: 'active' | 'resolved', deviceId?: string }
Response: Alert[]

// Crear alerta
POST /api/alerts
Body: AlertConfig
Response: Alert

// Actualizar estado de alerta
PATCH /api/alerts/:id
Body: { status: 'active' | 'resolved' }
Response: Alert
```

#### Telemetría
```typescript
// Obtener datos de telemetría
GET /api/telemetry
Query: { 
  deviceId: string,
  startDate: string,
  endDate: string,
  metrics: string[]
}
Response: TelemetryData[]
```

### Tipos de Datos

```typescript
interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'actuator';
  capabilities: string[];
  location: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}

interface Alert {
  id: string;
  deviceId: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

interface TelemetryData {
  deviceId: string;
  timestamp: Date;
  metrics: {
    [key: string]: number | string | boolean;
  };
}
```

### Ejemplos de Uso

#### Crear un Nuevo Dispositivo
```javascript
const response = await fetch('/api/devices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Sensor de Temperatura',
    type: 'sensor',
    capabilities: ['temperature'],
    location: 'Sala Principal'
  })
});
```

#### Obtener Alertas Activas
```javascript
const response = await fetch('/api/alerts?status=active', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const alerts = await response.json();
```

#### Obtener Datos de Telemetría
```javascript
const response = await fetch('/api/telemetry?' + new URLSearchParams({
  deviceId: 'raspi1',
  startDate: '2024-03-01',
  endDate: '2024-03-20',
  metrics: ['temperature', 'humidity']
}), {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const telemetryData = await response.json();
```

## Solución de Problemas

### Problemas Comunes

1. **Conexión MQTT**
   - Verificar conectividad a Internet
   - Comprobar configuración del broker
   - Revisar logs de conexión

2. **Notificaciones**
   - Verificar permisos del dispositivo
   - Comprobar configuración de Expo
   - Revisar tokens de notificación

3. **Rendimiento**
   - Optimizar re-renders
   - Implementar memoización
   - Reducir uso de memoria

## Seguridad

### Mejores Prácticas de Seguridad

1. **Autenticación y Autorización**
   - Usar tokens JWT para autenticación
   - Implementar roles y permisos
   - Rotar claves de API regularmente
   - Usar autenticación de dos factores

2. **Comunicación Segura**
   - Usar WSS (WebSocket Secure) para MQTT
   - Implementar TLS/SSL en todas las conexiones
   - Validar certificados SSL
   - Usar puertos seguros

3. **Protección de Datos**
   - Encriptar datos sensibles
   - Implementar backup automático
   - Usar variables de entorno para secretos
   - Limpiar logs periódicamente

4. **Seguridad de Dispositivos IoT**
   - Cambiar credenciales por defecto
   - Actualizar firmware regularmente
   - Implementar firewall
   - Monitorear actividad sospechosa

### Configuración de Seguridad

```javascript
// Ejemplo de configuración de seguridad
const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  mqtt: {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    ssl: true
  },
  api: {
    rateLimit: 100,
    timeout: 5000
  }
};
```

### Auditoría y Monitoreo

1. **Logs de Seguridad**
   - Registrar intentos de acceso
   - Monitorear cambios de configuración
   - Alertar sobre actividades sospechosas
   - Mantener historial de auditoría

2. **Monitoreo de Sistema**
   - Verificar uso de recursos
   - Monitorear conexiones activas
   - Alertar sobre anomalías
   - Generar reportes de seguridad

## Mantenimiento

### Tareas Regulares
1. Actualizar dependencias
2. Revisar logs de error
3. Monitorear uso de recursos
4. Realizar backups de configuración

### Actualizaciones
1. Seguir el versionado semántico
2. Documentar cambios en CHANGELOG.md
3. Probar en diferentes dispositivos
4. Actualizar documentación

## Contribución
Para contribuir al proyecto:
1. Fork el repositorio
2. Crear una rama para tu feature
3. Seguir las convenciones de código
4. Enviar un pull request

## Licencia
Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

---
Desarrollado por: Javier Parra (20192183458) 