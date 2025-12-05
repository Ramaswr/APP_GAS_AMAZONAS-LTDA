import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import { PAYMENT_OPTIONS } from '../../constants/products';
import ThemeToggle from '../common/ThemeToggle';

const CARD_PAYMENT_KEYS = ['CartaoCredito', 'CartaoDebito'];
const CARD_FORM_DEFAULT = { holder: '', number: '', expiry: '', cvv: '' };
const SECURE_MESSAGE_DEFAULT = 'Ambiente criptografado para pagamento com cartão.';

const CASH_SETTLEMENT_OPTIONS = [
  {
    key: 'cash',
    label: 'Dinheiro em espécie',
    description: 'Pagamento direto ao entregador com conferência imediata.',
  },
  {
    key: 'pix',
    label: 'PIX na entrega',
    description: 'Transferência instantânea acordada durante a entrega.',
  },
  {
    key: 'debit',
    label: 'Cartão de débito (maquininha)',
    description: 'Passagem do cartão na maquininha do entregador.',
  },
  {
    key: 'credit',
    label: 'Cartão de crédito (maquininha)',
    description: 'Credito presencial autorizado junto ao entregador.',
  },
];
const CASH_MESSAGE_DEFAULT =
  'Escolha, junto ao entregador, como o pagamento em dinheiro será efetivado.';

const PaymentScreen = ({ cart = [], clientEmail, onConfirmPayment, onBack }) => {
  const [selectedPayment, setSelectedPayment] = useState('Dinheiro');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [secureModalVisible, setSecureModalVisible] = useState(false);
  const [cardForm, setCardForm] = useState(CARD_FORM_DEFAULT);
  const [cardErrors, setCardErrors] = useState({});
  const [secureStage, setSecureStage] = useState('form');
  const [secureMessage, setSecureMessage] = useState(SECURE_MESSAGE_DEFAULT);
  const [invoiceData, setInvoiceData] = useState(null);
  const [cashModalVisible, setCashModalVisible] = useState(false);
  const [cashSettlement, setCashSettlement] = useState(CASH_SETTLEMENT_OPTIONS[0].key);
  const [cashStage, setCashStage] = useState('selection');
  const [cashMessage, setCashMessage] = useState(CASH_MESSAGE_DEFAULT);
  const [cashInvoiceData, setCashInvoiceData] = useState(null);
  const { styles, themeColors } = useTheme();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cart]
  );
  const hasItems = cart.length > 0;
  const selectedOption = useMemo(
    () => PAYMENT_OPTIONS.find((option) => option.key === selectedPayment),
    [selectedPayment]
  );
  const isCardPayment = useMemo(
    () => CARD_PAYMENT_KEYS.includes(selectedPayment),
    [selectedPayment]
  );
  const selectedCashOption = useMemo(
    () => CASH_SETTLEMENT_OPTIONS.find((option) => option.key === cashSettlement),
    [cashSettlement]
  );

  const generatePixKey = () => {
    const fragments = Array.from({ length: 4 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
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

  const resetCardFlow = () => {
    setSecureStage('form');
    setSecureMessage(SECURE_MESSAGE_DEFAULT);
    setCardForm(CARD_FORM_DEFAULT);
    setCardErrors({});
    setInvoiceData(null);
  };

  const handleCardInputChange = (field, value) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCardForm = () => {
    const errors = {};
    if (cardForm.holder.trim().length < 5) {
      errors.holder = 'Informe o nome completo do titular.';
    }
    const numberDigits = cardForm.number.replace(/\D/g, '');
    if (numberDigits.length !== 16) {
      errors.number = 'O cartão precisa ter 16 dígitos.';
    }
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardForm.expiry)) {
      errors.expiry = 'Use o formato MM/AA.';
    }
    const cvvDigits = cardForm.cvv.replace(/\D/g, '');
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errors.cvv = 'CVV inválido.';
    }

    if (Object.keys(errors).length) {
      setCardErrors(errors);
      setSecureStage('error');
      setSecureMessage(
        'Detectamos dados inconsistentes. Reiniciamos o formulário por segurança.'
      );
      setCardForm(CARD_FORM_DEFAULT);
      return false;
    }

    setCardErrors({});
    return true;
  };

  const handleSecurePaymentSubmit = () => {
    if (!validateCardForm()) {
      return;
    }
    const nfNumber = `NF-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString('pt-BR');
    setInvoiceData({
      number: nfNumber,
      date: timestamp,
      company: 'App Gas Amazonas LTDA',
      client: clientEmail || 'Cliente',
    });
    setSecureStage('success');
    setSecureMessage('Pagamento aprovado com criptografia ponta a ponta.');
    onConfirmPayment(cart, total, selectedPayment);
  };

  const handleConfirmPaymentPress = () => {
    if (!hasItems) return;
    if (selectedPayment === 'Dinheiro') {
      openCashModal();
      return;
    }
    if (isCardPayment) {
      resetCardFlow();
      setSecureModalVisible(true);
      return;
    }
    onConfirmPayment(cart, total, selectedPayment);
  };

  const closeSecureModal = () => {
    setSecureModalVisible(false);
    resetCardFlow();
  };

  const resetCashFlow = () => {
    setCashSettlement(CASH_SETTLEMENT_OPTIONS[0].key);
    setCashStage('selection');
    setCashMessage(CASH_MESSAGE_DEFAULT);
    setCashInvoiceData(null);
  };

  const openCashModal = () => {
    resetCashFlow();
    setCashModalVisible(true);
  };

  const handleCashAgreement = () => {
    if (!selectedCashOption) return;
    setCashStage('awaiting');
    setCashMessage(
      'Aguardando confirmação do entregador. Assim que ele registrar o recebimento, emitiremos a nota fiscal.'
    );
  };

  const handleCashConfirmReceipt = () => {
    if (!selectedCashOption) return;
    const nfNumber = `NF-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString('pt-BR');
    setCashInvoiceData({
      number: nfNumber,
      date: timestamp,
      company: 'App Gas Amazonas LTDA',
      client: clientEmail || 'Cliente',
      settlement: selectedCashOption.label,
    });
    setCashStage('success');
    setCashMessage('Pagamento registrado com segurança em campo.');
    onConfirmPayment(cart, total, `Dinheiro - ${selectedCashOption.label}`);
  };

  const closeCashModal = () => {
    setCashModalVisible(false);
    resetCashFlow();
  };

  return (
    <ScrollView style={styles.container}>
      <ThemeToggle showHint={false} />
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
            {cart.map((item) => (
              <View
                key={item.id}
                style={[styles.cartItem, { borderLeftColor: themeColors.success }]}
              >
                <View style={{ flexDirection: 'row', flex: 1 }}>
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
                      Qtd: {item.quantity || 1}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cartItemPrice}>
                  R$ {(item.price * (item.quantity || 1)).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            ))}
            <Text style={styles.cartTotal}>
              Total: R$ {total.toFixed(2).replace('.', ',')}
            </Text>
          </>
        )}
      </View>

      <Text style={[styles.label, { marginHorizontal: 15 }]}>
        Selecione a forma de pagamento
      </Text>
      <View style={[styles.card, { paddingBottom: 0 }]}>
        <View style={styles.paymentOptionContainer}>
          {PAYMENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.paymentOption,
                option.brands && styles.paymentOptionRich,
                selectedPayment === option.key && styles.paymentSelected,
              ]}
              onPress={() => handleSelectPayment(option.key)}
            >
              {/* Seleciona a forma de pagamento desejada */}
              <Text style={styles.paymentText}>
                {option.icon} {option.label}
              </Text>
              {option.description && (
                <Text style={styles.paymentDescription}>{option.description}</Text>
              )}
              {option.brands && option.brands.length > 0 && (
                <View style={styles.paymentBrandPreview}>
                  {option.brands.slice(0, 4).map((brand) => (
                    <Image
                      key={`${option.key}-${brand.name}`}
                      source={{ uri: brand.logo }}
                      style={styles.brandPreviewLogo}
                      resizeMode="contain"
                    />
                  ))}
                  {option.brands.length > 4 && (
                    <Text style={styles.brandPreviewMore}>
                      +{option.brands.length - 4}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text
          style={{
            textAlign: 'center',
            fontWeight: '700',
            color: themeColors.text,
            marginBottom: 20,
          }}
        >
          Pagamento escolhido: {selectedOption?.label || selectedPayment}
        </Text>
        {selectedOption?.brands && (
          <View style={styles.cardBrandList}>
            {selectedOption.brands.map((brand) => (
              <View
                key={`${selectedOption.key}-${brand.name}`}
                style={styles.cardBrandBadge}
              >
                <Image
                  source={{ uri: brand.logo }}
                  style={styles.cardBrandLogo}
                  resizeMode="contain"
                />
                <Text style={styles.cardBrandName}>{brand.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Confirma o pagamento com a forma escolhida */}
      <AppButton
        label="Confirmar Pagamento"
        onPress={handleConfirmPaymentPress}
        style={{ marginHorizontal: 15, opacity: hasItems ? 1 : 0.6 }}
        disabled={!hasItems}
      />
      {/* Volta para o catálogo caso o cliente desista */}
      <AppButton
        label="Voltar aos Produtos"
        variant="secondary"
        onPress={onBack}
        style={{ marginHorizontal: 15 }}
      />

      <Modal visible={showPixModal} transparent animationType="fade">
        <View style={styles.pixModalOverlay}>
          <View style={styles.pixModalContent}>
            <Text style={[styles.title, { textAlign: 'center', marginBottom: 6 }]}>
              Chave PIX Temporária
            </Text>
            <View style={styles.qrPlaceholder}>
              <Text
                style={{ fontSize: 18, fontWeight: '800', color: themeColors.success }}
              >
                PIX
              </Text>
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

      <Modal visible={cashModalVisible} transparent animationType="slide">
        <View style={styles.secureModalOverlay}>
          <View style={styles.secureModalContent}>
            <View style={styles.lockBadge}>
              <Text style={styles.lockBadgeText}>💼 Entrega + Recebimento</Text>
            </View>
            <Text style={styles.secureModalTitle}>Pagamento em Dinheiro</Text>
            <Text style={styles.secureModalSubtitle}>{cashMessage}</Text>

            {cashStage !== 'success' && (
              <>
                {CASH_SETTLEMENT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.cashOption,
                      cashSettlement === option.key && styles.cashOptionSelected,
                    ]}
                    onPress={() => setCashSettlement(option.key)}
                  >
                    <View style={styles.cashRadioCircle}>
                      {cashSettlement === option.key && (
                        <View style={styles.cashRadioDot} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cashOptionLabel}>{option.label}</Text>
                      <Text style={styles.cashOptionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {cashStage === 'selection' && (
                  <AppButton
                    label="Registrar acordo com o entregador"
                    onPress={handleCashAgreement}
                    style={{ width: '100%', marginTop: 10 }}
                  />
                )}

                {cashStage === 'awaiting' && (
                  <>
                    <View style={styles.cashBadge}>
                      <Text style={styles.cashBadgeText}>
                        Aguardando confirmação do entregador ({selectedCashOption?.label})
                      </Text>
                    </View>
                    <Text style={styles.cashAwaitingText}>
                      Assim que o valor for confirmado em mãos, clique abaixo para dar
                      baixa no pedido e emitir a nota fiscal conforme a Receita Federal.
                    </Text>
                    <AppButton
                      label="Confirmar recebimento e emitir nota"
                      onPress={handleCashConfirmReceipt}
                      style={{ width: '100%' }}
                    />
                  </>
                )}

                <AppButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={closeCashModal}
                  style={{ width: '100%', marginTop: 12 }}
                />
              </>
            )}

            {cashStage === 'success' && cashInvoiceData && (
              <>
                <View style={styles.invoiceCard}>
                  <Text style={styles.invoiceTitle}>Nota Fiscal Digital</Text>
                  <Text style={styles.invoiceRow}>
                    Empresa: {cashInvoiceData.company}
                  </Text>
                  <Text style={styles.invoiceRow}>NF-e: {cashInvoiceData.number}</Text>
                  <Text style={styles.invoiceRow}>Cliente: {cashInvoiceData.client}</Text>
                  <Text style={styles.invoiceRow}>Data: {cashInvoiceData.date}</Text>
                  <Text style={styles.invoiceRow}>
                    Forma acordada: {cashInvoiceData.settlement}
                  </Text>
                  <Text style={styles.invoiceRow}>
                    Total: R$ {total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                <Text style={styles.invoiceOptions}>
                  Nota emitida conforme critérios da Receita Federal do Brasil. Opções:
                  salvar PDF, enviar por e-mail ou compartilhar direto pelo app.
                </Text>
                <Text style={styles.invoiceThankyou}>
                  Muito obrigado pela sua compra! Ficaremos no seu aguardo. Sempre que
                  precisar, fale conosco pelos nossos canais oficiais: WhatsApp (92)
                  98202-6775 ou diretamente pelo app.
                </Text>
                <AppButton
                  label="Fechar área segura"
                  onPress={closeCashModal}
                  style={{ width: '100%' }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={secureModalVisible} transparent animationType="slide">
        <View style={styles.secureModalOverlay}>
          <View style={styles.secureModalContent}>
            <View style={styles.lockBadge}>
              <Text style={styles.lockBadgeText}>🔒 Zona Criptografada</Text>
            </View>
            <Text style={styles.secureModalTitle}>Pagamento com Cartão</Text>
            <Text style={styles.secureModalSubtitle}>{secureMessage}</Text>

            {secureStage !== 'success' && (
              <>
                <TextInput
                  value={cardForm.holder}
                  onChangeText={(text) => handleCardInputChange('holder', text)}
                  placeholder="Nome impresso no cartão"
                  placeholderTextColor={themeColors.mutedText}
                  style={styles.secureInput}
                  autoCapitalize="words"
                />
                {cardErrors.holder && (
                  <Text style={styles.inputError}>{cardErrors.holder}</Text>
                )}
                <TextInput
                  value={cardForm.number}
                  onChangeText={(text) => handleCardInputChange('number', text)}
                  placeholder="Número do cartão (16 dígitos)"
                  placeholderTextColor={themeColors.mutedText}
                  style={styles.secureInput}
                  keyboardType="numeric"
                  maxLength={19}
                />
                {cardErrors.number && (
                  <Text style={styles.inputError}>{cardErrors.number}</Text>
                )}
                <View style={styles.secureInputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                      value={cardForm.expiry}
                      onChangeText={(text) => handleCardInputChange('expiry', text)}
                      placeholder="Validade (MM/AA)"
                      placeholderTextColor={themeColors.mutedText}
                      style={styles.secureInput}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    {cardErrors.expiry && (
                      <Text style={styles.inputError}>{cardErrors.expiry}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TextInput
                      value={cardForm.cvv}
                      onChangeText={(text) => handleCardInputChange('cvv', text)}
                      placeholder="CVV"
                      placeholderTextColor={themeColors.mutedText}
                      style={styles.secureInput}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={4}
                    />
                    {cardErrors.cvv && (
                      <Text style={styles.inputError}>{cardErrors.cvv}</Text>
                    )}
                  </View>
                </View>
                {secureStage === 'error' && (
                  <Text style={styles.inputError}>
                    Houve um erro. O formulário reiniciou para manter sua segurança.
                  </Text>
                )}
                <AppButton
                  label="Pagar com Segurança"
                  onPress={handleSecurePaymentSubmit}
                  style={{ width: '100%' }}
                />
                <AppButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={closeSecureModal}
                  style={{ width: '100%', marginTop: 10 }}
                />
              </>
            )}

            {secureStage === 'success' && invoiceData && (
              <>
                <View style={styles.invoiceCard}>
                  <Text style={styles.invoiceTitle}>Nota Fiscal Digital</Text>
                  <Text style={styles.invoiceRow}>Empresa: {invoiceData.company}</Text>
                  <Text style={styles.invoiceRow}>NF-e: {invoiceData.number}</Text>
                  <Text style={styles.invoiceRow}>Cliente: {invoiceData.client}</Text>
                  <Text style={styles.invoiceRow}>Data: {invoiceData.date}</Text>
                  <Text style={styles.invoiceRow}>
                    Total: R$ {total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                <Text style={styles.invoiceOptions}>
                  Nota emitida conforme critérios da Receita Federal do Brasil. Opções:
                  salvar PDF, enviar por e-mail ou compartilhar direto pelo app.
                </Text>
                <Text style={styles.invoiceThankyou}>
                  Muito obrigado pela sua compra! Ficaremos no seu aguardo. Sempre que
                  precisar, fale conosco pelos nossos canais oficiais: WhatsApp (92)
                  98202-6775 ou diretamente pelo app.
                </Text>
                <AppButton
                  label="Fechar área segura"
                  onPress={closeSecureModal}
                  style={{ width: '100%' }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PaymentScreen;
