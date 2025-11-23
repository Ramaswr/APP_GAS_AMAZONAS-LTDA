import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import styles from '../../styles/globalStyles';
import AppButton from '../common/AppButton';

const RoleDashboardScreen = ({ userType, registeredClients = [], orders = [], onViewAllOrders, onViewClientOrders, onBackToSelection }) => {
  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const totalItems = useMemo(() => (
    orders.reduce((sum, order) => sum + order.items.reduce((innerSum, item) => innerSum + (item.quantity || 1), 0), 0)
  ), [orders]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Painel {userType}</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumo Operacional</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Pedidos Recebidos: {orders.length}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginTop: 4 }}>Itens Distribuídos: {totalItems}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#28A745', marginTop: 10 }}>
          Receita Acumulada: R$ {totalSales.toFixed(2).replace('.', ',')}
        </Text>
        <AppButton label="📦 Ver Todos os Pedidos" onPress={onViewAllOrders} />
      </View>

      {userType === 'Administrador' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Clientes Registrados</Text>
          {registeredClients.length === 0 ? (
            <Text style={styles.emptyCart}>Nenhum cliente cadastrado ainda.</Text>
          ) : registeredClients.map(client => (
            <TouchableOpacity key={client.email} style={styles.cartItem} onPress={() => onViewClientOrders(client.email)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{client.name || client.email}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{client.email}</Text>
              </View>
              <Text style={styles.tag}>Ver Pedidos</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <AppButton label="Trocar Perfil" variant="secondary" onPress={onBackToSelection} style={{ marginHorizontal: 15 }} />
    </ScrollView>
  );
};

export default RoleDashboardScreen;
