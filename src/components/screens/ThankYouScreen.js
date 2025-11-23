import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/globalStyles';
import AppButton from '../common/AppButton';

const ThankYouScreen = ({ onReturnHome, paymentMethod, total }) => (
  <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}> 
    <View style={[styles.card, { width: '90%' }]}> 
      <Text style={[styles.header, { fontSize: 24 }]}>🎉 Obrigado!</Text>
      <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 12 }}>
        Muito obrigado pela sua compra.
      </Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#333', textAlign: 'center' }}>
        Volte sempre ao App Gás Amazonas LTDA!
      </Text>
      <View style={{ marginTop: 15 }}>
        <Text style={{ fontSize: 14, color: '#555', textAlign: 'center' }}>Pagamento: {paymentMethod}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', textAlign: 'center', color: '#28A745', marginTop: 4 }}>
          Total pago: R$ {total.toFixed(2).replace('.', ',')}
        </Text>
      </View>
      {/* Direciona novamente ao catálogo para novas compras */}
      <AppButton label="Voltar ao Catálogo" onPress={onReturnHome} style={{ marginTop: 20 }} />
    </View>
  </View>
);

export default ThankYouScreen;
