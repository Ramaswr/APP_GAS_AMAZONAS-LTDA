import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import ThemeToggle from '../common/ThemeToggle';

const CartScreen = ({
  cart = [],
  onIncrement,
  onDecrement,
  onRemove,
  onProceedToPayment,
  onBack,
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const { styles, themeColors } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <ThemeToggle showHint={false} />
      <Text style={styles.header}>🛒 Meu Carrinho</Text>
      {cart.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyCart}>
            Seu carrinho está vazio. Adicione produtos!
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.productRow}>
                {item.image && (
                  <Image
                    source={item.image}
                    style={styles.miniProduct}
                    resizeMode="contain"
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                    {item.weight}
                  </Text>
                </View>
              </View>
              <Text style={styles.cartItemPrice}>
                R$ {(item.price * (item.quantity || 1)).toFixed(2).replace('.', ',')}
              </Text>
              <View style={styles.quantityControl}>
                {/* Botão que reduz a quantidade do item no carrinho */}
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onDecrement(item.id)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '900',
                      color: themeColors.text,
                    }}
                  >
                    −
                  </Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity || 1}</Text>
                {/* Botão que aumenta a quantidade do item no carrinho */}
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onIncrement(item.id)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '900',
                      color: themeColors.text,
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Remove completamente o item selecionado */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onRemove(item.id)}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.cartTotal}>
            Total: R$ {total.toFixed(2).replace('.', ',')}
          </Text>
          {cart.length > 0 && (
            <>
              {/* Avança para a tela de pagamento após revisar o carrinho */}
              <AppButton label="Escolher Pagamento" onPress={onProceedToPayment} />
            </>
          )}
        </View>
      )}
      {/* Retorna para a listagem de produtos */}
      <AppButton
        label="Voltar aos Produtos"
        variant="secondary"
        onPress={onBack}
        style={{ marginHorizontal: 15 }}
      />
    </ScrollView>
  );
};

export default CartScreen;
