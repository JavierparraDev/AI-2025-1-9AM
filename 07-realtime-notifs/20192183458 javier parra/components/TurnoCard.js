import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

const TurnoCard = ({ turno }) => {
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return '#4CAF50';
      case 'pendiente':
        return '#FFC107';
      case 'completado':
        return '#2196F3';
      case 'cancelado':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.turnoInfo}>
            <Text style={styles.numeroTurno}>Turno #{turno.numero}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(turno.estado) }]}>
              <Text style={styles.estadoText}>{turno.estado}</Text>
            </View>
          </View>
          <IconButton
            icon="clock-outline"
            size={20}
            onPress={() => {}}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{turno.cliente}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>Servicio:</Text>
          <Text style={styles.value}>{turno.servicio}</Text>
        </View>

        <View style={styles.details}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{turno.hora}</Text>
        </View>

        {turno.observaciones && (
          <View style={styles.observaciones}>
            <Text style={styles.label}>Observaciones:</Text>
            <Text style={styles.observacionesText}>{turno.observaciones}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  turnoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numeroTurno: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
  },
  observaciones: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  observacionesText: {
    fontStyle: 'italic',
    color: '#666',
  },
});

export default TurnoCard; 