import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import ThemeToggle from '../common/ThemeToggle';

const ROLES = [
  {
    key: 'Cliente',
    name: 'Cliente',
    emoji: '🛍️',
    description: 'Realize pedidos de gás',
    color: '#007BFF',
  },
  {
    key: 'Entregador',
    name: 'Entregador',
    emoji: '🚚',
    description: 'Gerencie entregas',
    color: '#28A745',
  },
  {
    key: 'Administrador',
    name: 'Administrador',
    emoji: '⚙️',
    description: 'Painel administrativo',
    color: '#6C757D',
  },
];

const UserSelectionScreen = ({ onSelectUser }) => {
  const { styles } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.screenContent}>
      <ThemeToggle />
      <Text style={styles.header}>👋 Bem-vindo!</Text>
      {ROLES.map((role) => (
        <View key={role.key} style={styles.card}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>
            {role.emoji}
          </Text>
          <Text style={[styles.userTitle, { color: role.color }]}>{role.name}</Text>
          <Text style={styles.userDescription}>{role.description}</Text>
          {/* Define o perfil ativo e navega para o fluxo correspondente */}
          <AppButton
            label={`Entrar como ${role.name}`}
            onPress={() => onSelectUser(role.key)}
            style={{ backgroundColor: role.color }}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default UserSelectionScreen;
