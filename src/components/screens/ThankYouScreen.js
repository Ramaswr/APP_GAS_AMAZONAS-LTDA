import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';

const ThankYouScreen = ({ onReturnHome, paymentMethod, total }) => {
  const { styles, themeColors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { justifyContent: 'center', alignItems: 'center', padding: 24 },
      ]}
    >
      <View style={[styles.card, { width: '90%' }]}>
        <Text style={[styles.header, { fontSize: 24 }]}>🎉 Obrigado!</Text>
        <Text
          style={{
            fontSize: 16,
            color: themeColors.mutedText,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Muito obrigado pela sua compra.
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: themeColors.text,
            textAlign: 'center',
          }}
        >
          Volte sempre ao App Gás Amazonas LTDA!
        </Text>
        <View style={{ marginTop: 15 }}>
          <Text
            style={{
              fontSize: 14,
              color: themeColors.mutedText,
              textAlign: 'center',
            }}
          >
            Pagamento: {paymentMethod}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              textAlign: 'center',
              color: themeColors.success,
              marginTop: 4,
            }}
          >
            Total pago: R$ {total.toFixed(2).replace('.', ',')}
          </Text>
        </View>
        {/* Direciona novamente ao catálogo para novas compras */}
        <AppButton
          label="Voltar ao Catálogo"
          onPress={onReturnHome}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
};

export default ThankYouScreen;
