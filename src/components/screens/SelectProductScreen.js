import React from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import ThemeToggle from '../common/ThemeToggle';

const SelectProductScreen = ({
  products,
  onProductSelect,
  onLogout,
  clientEmail,
  onViewCart,
  cartCount,
  onViewOrders,
}) => {
  const { styles } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.screenContent}>
      <ThemeToggle showHint={false} />
      <View style={{ position: 'relative' }}>
        <Text style={styles.header}>⛽ Escolha seu Produto</Text>
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </View>
      {clientEmail && (
        <View style={{ marginHorizontal: 15, marginBottom: 15 }}>
          <Text style={styles.label}>👤 {clientEmail}</Text>
        </View>
      )}
      {products.map((option) => (
        <View key={option.id} style={styles.card}>
          <View style={styles.productRow}>
            {option.image && (
              <Image
                source={option.image}
                style={styles.miniProduct}
                resizeMode="contain"
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{option.name}</Text>
              <Text style={styles.subtitle}>⚖️ {option.weight}</Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            R$ {option.price.toFixed(2).replace('.', ',')}
          </Text>
          {/* Adiciona o produto selecionado ao carrinho e abre o pagamento */}
          <AppButton
            label="Adicionar ao Carrinho"
            onPress={() => onProductSelect(option)}
          />
        </View>
      ))}
      {/* Atalho para revisar itens do carrinho */}
      <AppButton
        label={`🛒 Ver Carrinho (${cartCount})`}
        variant="outline"
        onPress={onViewCart}
        style={{ marginHorizontal: 15 }}
      />
      <AppButton
        label="📦 Ver Pedidos"
        variant="outline"
        onPress={onViewOrders}
        style={{ marginHorizontal: 15 }}
      />
      {/* Encerra a sessão do cliente */}
      <AppButton
        label="Sair"
        variant="secondary"
        onPress={onLogout}
        style={{ marginHorizontal: 15 }}
      />
    </ScrollView>
  );
};

export default SelectProductScreen;
