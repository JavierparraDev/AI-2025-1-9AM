# Registro de Cambios

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-20

### Añadido
- Implementación inicial de la aplicación de alertas IoT
- Sistema de monitoreo en tiempo real con MQTT
- Interfaz de usuario con React Native Paper
- Componentes principales:
  - AlertCard para mostrar alertas
  - TurnoCard para mostrar información de turnos
  - Collapsible para componentes colapsables
  - ThemedText y ThemedView para componentes con temas
- Sistema de notificaciones push
- Conexión dual MQTT (local y nube)
- Soporte para múltiples dispositivos IoT
- Visualización de telemetría (temperatura, humedad)
- Control de dispositivos (luces y ventiladores)

### Cambiado
- Optimización del rendimiento de la aplicación
- Mejora en la gestión de estado
- Actualización de dependencias

### Eliminado
- Componentes no utilizados:
  - HelloWave.tsx
  - ParallaxScrollView.tsx
  - ExternalLink.tsx

### Corregido
- Problemas de conexión MQTT
- Errores en la visualización de alertas
- Problemas de rendimiento en dispositivos de gama baja

## [0.1.0] - 2024-03-15

### Añadido
- Estructura inicial del proyecto
- Configuración básica de Expo
- Implementación de componentes base
- Integración con MQTT
- Sistema de temas claro/oscuro

---
Desarrollado por: Javier Parra (20192183458) 