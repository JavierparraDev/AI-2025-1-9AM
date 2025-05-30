import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';

const AlertCard = ({ alert }) => {
  if (!alert) return null;

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return '#ff4444';
      case 'warning':
        return '#ffbb33';
      case 'success':
        return '#00C851';
      default:
        return '#2196F3';
    }
  };

  return (
    <Card style={[styles.card, { borderLeftColor: getAlertColor(alert.type) }]}>
      <Card.Content>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.body}>{alert.body}</Text>
        {alert.timestamp && (
          <Text style={styles.timestamp}>
            {new Date(alert.timestamp).toLocaleString()}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default AlertCard; 