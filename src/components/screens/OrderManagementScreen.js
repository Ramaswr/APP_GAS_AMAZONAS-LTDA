import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import ThemeToggle from '../common/ThemeToggle';

const OrderManagementScreen = ({
  orders = [],
  userType,
  clientEmail,
  onIncrementItem,
  onRemoveItem,
  onBack,
}) => {
  const visibleOrders = useMemo(() => {
    if (userType === 'Cliente') {
      return orders.filter((order) => order.clientEmail === clientEmail);
    }
    return orders;
  }, [orders, userType, clientEmail]);

  const { styles, themeColors } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <ThemeToggle showHint={false} />
      <Text style={styles.header}>📦 Pedidos</Text>
      {visibleOrders.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyCart}>Nenhum pedido encontrado.</Text>
        </View>
      ) : (
        visibleOrders.map((order) => (
          <View key={order.id} style={[styles.card, styles.orderCard]}>
            <View style={styles.orderHeader}>
              <Text style={{ fontWeight: '700', color: themeColors.text }}>
                {order.clientEmail}
              </Text>
              <Text style={styles.tag}>{order.paymentMethod}</Text>
              {order.status && (
                <Text
                  style={[
                    styles.tag,
                    {
                      backgroundColor: themeColors.highlight,
                      color: themeColors.primary,
                    },
                  ]}
                >
                  {order.status}
                </Text>
              )}
            </View>
            {order.assignedDeliverer?.name && (
              <Text
                style={{
                  fontSize: 12,
                  color: themeColors.mutedText,
                  marginBottom: 8,
                }}
              >
                Entregador: {order.assignedDeliverer.name}
              </Text>
            )}
            {order.items.map((item) => (
              <View key={`${order.id}-${item.id}`} style={{ marginBottom: 10 }}>
                <View style={styles.productRow}>
                  {item.image && (
                    <Image
                      source={item.image}
                      style={styles.miniProduct}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: themeColors.text }}>
                      {item.name} • Qty: {item.quantity || 1}
                    </Text>
                    <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                      R${' '}
                      {(item.price * (item.quantity || 1)).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: themeColors.success, marginRight: 10 },
                    ]}
                    onPress={() => onIncrementItem(order, item)}
                  >
                    <Text style={styles.actionButtonText}>+1 Item</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: themeColors.danger }]}
                    onPress={() => onRemoveItem(order, item)}
                  >
                    <Text style={styles.actionButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                textAlign: 'right',
                marginTop: 10,
                color: themeColors.text,
              }}
            >
              Total: R$ {order.total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        ))
      )}
      <AppButton
        label="Voltar"
        variant="secondary"
        onPress={onBack}
        style={{ marginHorizontal: 15 }}
      />
    </ScrollView>
  );
};

export default OrderManagementScreen;
