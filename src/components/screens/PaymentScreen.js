import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import styles from '../../styles/globalStyles';
import AppButton from '../common/AppButton';
import { PAYMENT_OPTIONS } from '../../constants/products';

const PaymentScreen = ({ cart = [], clientEmail, onConfirmPayment, onBack }) => {
  const [selectedPayment, setSelectedPayment] = useState('Dinheiro');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState('');

  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0), [cart]);
  const hasItems = cart.length > 0;

  const generatePixKey = () => {
    const fragments = Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());
    return fragments.join('-');
  };

  const handleSelectPayment = (optionKey) => {
    setSelectedPayment(optionKey);
    if (optionKey === 'PIX') {
      setPixKey(generatePixKey());
      setShowPixModal(true);
    } else {
      setShowPixModal(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>💳 Pagamento</Text>
      {clientEmail && (
        <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
          <Text style={styles.label}>Cliente: {clientEmail}</Text>
        </View>
      )}
      <View style={styles.card}>
        {!hasItems ? (
          <Text style={styles.emptyCart}>Seu carrinho está vazio.</Text>
        ) : (
          <>
            {cart.map(item => (
              <View key={item.id} style={[styles.cartItem, { borderLeftColor: '#28A745' }]}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  {item.image && (
                    <Image source={item.image} style={styles.miniProduct} resizeMode="contain" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Qtd: {item.quantity || 1}</Text>
                  </View>
                </View>
                <Text style={styles.cartItemPrice}>R$ {(item.price * (item.quantity || 1)).toFixed(2).replace('.', ',')}</Text>
              </View>
            ))}
            <Text style={styles.cartTotal}>Total: R$ {total.toFixed(2).replace('.', ',')}</Text>
          </>
        )}
      </View>

      <Text style={[styles.label, { marginHorizontal: 15 }]}>Selecione a forma de pagamento</Text>
      <View style={[styles.card, { paddingBottom: 0 }]}>
        <View style={styles.paymentOptionContainer}>
          {PAYMENT_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[styles.paymentOption, selectedPayment === option.key && styles.paymentSelected]}
              onPress={() => handleSelectPayment(option.key)}
            >
              {/* Seleciona a forma de pagamento desejada */}
              <Text style={styles.paymentText}>{option.icon} {option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ textAlign: 'center', fontWeight: '700', color: '#333', marginBottom: 20 }}>
          Pagamento escolhido: {selectedPayment}
        </Text>
      </View>

      {/* Confirma o pagamento com a forma escolhida */}
      <AppButton
        label="Confirmar Pagamento"
        onPress={() => onConfirmPayment(cart, total, selectedPayment)}
        style={{ marginHorizontal: 15, opacity: hasItems ? 1 : 0.6 }}
        disabled={!hasItems}
      />
      {/* Volta para o catálogo caso o cliente desista */}
      <AppButton label="Voltar aos Produtos" variant="secondary" onPress={onBack} style={{ marginHorizontal: 15 }} />

      <Modal visible={showPixModal} transparent animationType="fade">
        <View style={styles.pixModalOverlay}>
          <View style={styles.pixModalContent}>
            <Text style={[styles.title, { textAlign: 'center', marginBottom: 6 }]}>Chave PIX Temporária</Text>
            <View style={styles.qrPlaceholder}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#28A745' }}>PIX</Text>
            </View>
            <Text style={styles.pixKeyText}>{pixKey}</Text>
            {/* Fecha o modal fake do PIX após visualizar a chave */}
            <AppButton
              label="Pronto"
              onPress={() => setShowPixModal(false)}
              style={{ width: '100%', marginTop: 0 }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PaymentScreen;
