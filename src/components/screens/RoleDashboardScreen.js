import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import ThemeToggle from '../common/ThemeToggle';

const RoleDashboardScreen = ({
  userType,
  registeredClients = [],
  orders = [],
  deliverers = [],
  summary,
  onViewAllOrders,
  onViewClientOrders,
  onRefreshDashboard,
  onRegisterDeliverer,
  onViewCourierOrders,
  onBackToSelection,
}) => {
  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === 'DELIVERED').length,
    [orders]
  );

  const operationalSummary = summary || {
    total_orders: orders.length,
    delivered_orders: deliveredOrders,
    pending_orders: orders.filter((order) => order.status === 'PENDING').length,
    active_orders: orders.filter((order) =>
      ['ASSIGNED', 'IN_ROUTE'].includes(order.status)
    ).length,
    active_deliverers: deliverers.filter((deliverer) => deliverer.status === 'IN_ROUTE')
      .length,
  };

  const { styles, themeColors } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <ThemeToggle showHint={false} />
      <Text style={styles.header}>Painel {userType}</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Indicadores em Tempo Real</Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: themeColors.text, fontWeight: '600' }}>
            Pedidos totais: {operationalSummary.total_orders}
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text, marginTop: 4 }}>
            Entregues: {operationalSummary.delivered_orders}
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text, marginTop: 4 }}>
            Pendentes: {operationalSummary.pending_orders}
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text, marginTop: 4 }}>
            Em rota: {operationalSummary.active_orders}
          </Text>
          <Text style={{ fontSize: 16, color: themeColors.text, marginTop: 4 }}>
            Entregadores em rota: {operationalSummary.active_deliverers}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: themeColors.success,
              marginTop: 8,
            }}
          >
            Receita acumulada (local): R$ {totalSales.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <AppButton label="📦 Ver Todos os Pedidos" onPress={onViewAllOrders} />
        <AppButton
          label="Atualizar painel"
          variant="outline"
          onPress={onRefreshDashboard}
          style={{ marginTop: 10 }}
        />
        {(userType === 'Administrador' || userType === 'Entregador') && (
          <>
            <AppButton
              label="Cadastrar novo entregador"
              variant="secondary"
              onPress={onRegisterDeliverer}
              style={{ marginTop: 10 }}
            />
            <AppButton
              label="📍 Abrir painel de rotas"
              onPress={onViewCourierOrders}
              style={{ marginTop: 10 }}
            />
          </>
        )}
      </View>

      {(userType === 'Administrador' || userType === 'Entregador') && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Escala de Entregadores</Text>
          {deliverers.length === 0 ? (
            <Text style={styles.emptyCart}>
              Nenhum entregador sincronizado. Utilize o botão "Atualizar painel".
            </Text>
          ) : (
            deliverers.map((deliverer) => (
              <View key={deliverer.id} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{deliverer.name}</Text>
                  <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                    {deliverer.email}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tag,
                    {
                      backgroundColor:
                        deliverer.status === 'IN_ROUTE'
                          ? themeColors.badgeBackground
                          : themeColors.highlight,
                      color:
                        deliverer.status === 'IN_ROUTE'
                          ? themeColors.danger
                          : themeColors.primary,
                    },
                  ]}
                >
                  {deliverer.status}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {userType === 'Administrador' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Clientes Registrados</Text>
          {registeredClients.length === 0 ? (
            <Text style={styles.emptyCart}>Nenhum cliente cadastrado ainda.</Text>
          ) : (
            registeredClients.map((client) => (
              <TouchableOpacity
                key={client.email}
                style={styles.cartItem}
                onPress={() => onViewClientOrders(client.email)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{client.name || client.email}</Text>
                  <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                    {client.email}
                  </Text>
                </View>
                <Text style={styles.tag}>Ver Pedidos</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <AppButton
        label="Trocar Perfil"
        variant="secondary"
        onPress={onBackToSelection}
        style={{ marginHorizontal: 15 }}
      />
    </ScrollView>
  );
};

export default RoleDashboardScreen;
