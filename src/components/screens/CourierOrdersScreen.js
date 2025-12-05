import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../styles/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import AppButton from '../common/AppButton';

const CourierOrdersScreen = ({
  orders = [],
  delivererName = 'Entregador',
  onBack,
  onRefreshOrders,
  onUpdateLocation,
}) => {
  const { styles, themeColors } = useTheme();
  const [trackingStatus, setTrackingStatus] = useState('idle');
  const [currentPosition, setCurrentPosition] = useState(null);
  const watchRef = useRef(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationForm, setLocationForm] = useState({
    address: '',
    latitude: '',
    longitude: '',
  });
  const [locationErrors, setLocationErrors] = useState({});
  const [locationOrder, setLocationOrder] = useState(null);

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        ['CONFIRMED', 'ASSIGNED', 'IN_ROUTE'].includes(order.status || 'CONFIRMED')
      ),
    [orders]
  );

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        'Precisamos da sua localização para acompanhar as rotas.'
      );
      return false;
    }
    return true;
  };

  const startTracking = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return;
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      setCurrentPosition(current);
      setTrackingStatus('active');
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
        },
        (location) => {
          setCurrentPosition(location);
        }
      );
    } catch (error) {
      console.warn('Erro ao iniciar rastreamento', error);
      Alert.alert('Erro', 'Não conseguimos iniciar o rastreamento no momento.');
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setTrackingStatus('idle');
  }, []);

  useEffect(() => () => stopTracking(), [stopTracking]);

  const openMaps = (order) => {
    const location = order.deliveryLocation;
    if (!location) {
      Alert.alert(
        'Localização não encontrada',
        'Defina uma localização antes de abrir o mapa.'
      );
      return;
    }
    let url = '';
    if (location.latitude && location.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    } else if (location.address) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
    }
    if (!url) {
      Alert.alert(
        'Dados insuficientes',
        'Inclua latitude/longitude ou endereço para abrir o mapa.'
      );
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps neste dispositivo.');
    });
  };

  const handleOpenLocationModal = (order) => {
    setLocationOrder(order);
    setLocationForm({
      address: order.deliveryLocation?.address || '',
      latitude: order.deliveryLocation?.latitude?.toString() || '',
      longitude: order.deliveryLocation?.longitude?.toString() || '',
    });
    setLocationErrors({});
    setLocationModalVisible(true);
  };

  const handleSaveLocation = () => {
    const nextErrors = {};
    if (!locationForm.address.trim()) {
      nextErrors.address = 'Descreva o endereço completo.';
    }
    const lat = parseFloat(locationForm.latitude.replace(',', '.'));
    const lng = parseFloat(locationForm.longitude.replace(',', '.'));
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      nextErrors.coords = 'Latitude e longitude precisam ser números válidos.';
    }
    setLocationErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onUpdateLocation(locationOrder.id, {
      address: locationForm.address.trim(),
      latitude: lat,
      longitude: lng,
    });
    setLocationModalVisible(false);
  };

  const closeLocationModal = () => {
    setLocationModalVisible(false);
    setLocationOrder(null);
    setLocationErrors({});
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemeToggle showHint={false} />
        <Text style={styles.header}>Rotas do Entregador</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status do entregador</Text>
          <Text style={{ fontSize: 15, color: themeColors.text, fontWeight: '700' }}>
            {delivererName}
          </Text>
          <Text style={{ fontSize: 13, color: themeColors.mutedText, marginTop: 4 }}>
            Localização em tempo real via GPS
          </Text>
          {currentPosition ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 13, color: themeColors.text }}>
                Latitude: {currentPosition.coords.latitude.toFixed(6)}
              </Text>
              <Text style={{ fontSize: 13, color: themeColors.text }}>
                Longitude: {currentPosition.coords.longitude.toFixed(6)}
              </Text>
              <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                Atualizado em{' '}
                {new Date(currentPosition.timestamp).toLocaleTimeString('pt-BR')}
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 12, color: themeColors.mutedText, marginTop: 8 }}>
              Inicie o rastreamento para capturar sua posição atual.
            </Text>
          )}
          <AppButton
            label={
              trackingStatus === 'active' ? 'Parar rastreamento' : 'Iniciar rastreamento'
            }
            onPress={trackingStatus === 'active' ? stopTracking : startTracking}
            style={{ marginTop: 12 }}
          />
          <AppButton
            label="Atualizar pedidos"
            variant="secondary"
            onPress={onRefreshOrders}
            style={{ marginTop: 10 }}
          />
          <AppButton
            label="Voltar"
            variant="outline"
            onPress={onBack}
            style={{ marginTop: 10 }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pedidos ativos ({activeOrders.length})</Text>
          {activeOrders.length === 0 && (
            <Text style={styles.emptyCart}>
              Nenhum pedido disponível para entrega. Atualize para sincronizar com o
              backend.
            </Text>
          )}
          {activeOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.cartItemName}>Pedido #{order.id}</Text>
                <Text style={styles.tag}>{order.status || 'PENDING'}</Text>
              </View>
              <Text style={{ fontSize: 12, color: themeColors.mutedText }}>
                Cliente: {order.clientEmail}
              </Text>
              <Text style={{ fontSize: 12, color: themeColors.mutedText, marginTop: 4 }}>
                Pagamento: {order.paymentMethod}
              </Text>
              <Text style={{ fontSize: 12, color: themeColors.text, marginTop: 4 }}>
                Localização: {order.deliveryLocation?.address || 'Não definida'}
              </Text>
              {order.deliveryLocation?.latitude && order.deliveryLocation?.longitude && (
                <Text style={{ fontSize: 12, color: themeColors.text }}>
                  GPS: {order.deliveryLocation.latitude},{' '}
                  {order.deliveryLocation.longitude}
                </Text>
              )}

              <View style={{ marginTop: 12 }}>
                <AppButton
                  label="Ver rota no Google Maps"
                  onPress={() => openMaps(order)}
                  style={{ marginBottom: 8 }}
                />
                <AppButton
                  label={
                    order.deliveryLocation
                      ? 'Atualizar geolocalização'
                      : 'Definir geolocalização'
                  }
                  variant="outline"
                  onPress={() => handleOpenLocationModal(order)}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={locationModalVisible} transparent animationType="fade">
        <View style={styles.secureModalOverlay}>
          <View style={styles.secureModalContent}>
            <Text style={styles.secureModalTitle}>Definir GPS do cliente</Text>
            <Text style={styles.secureModalSubtitle}>
              Cadastre o endereço completo e as coordenadas para abrir a rota diretamente
              no Google Maps.
            </Text>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.secureInput}
              placeholder="Rua, número, bairro, ponto de referência"
              placeholderTextColor={themeColors.mutedText}
              value={locationForm.address}
              onChangeText={(text) =>
                setLocationForm((prev) => ({ ...prev, address: text }))
              }
            />
            {locationErrors.address && (
              <Text style={styles.inputError}>{locationErrors.address}</Text>
            )}
            <View style={styles.secureInputRow}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.secureInput}
                  placeholder="-3.130123"
                  placeholderTextColor={themeColors.mutedText}
                  keyboardType="numeric"
                  value={locationForm.latitude}
                  onChangeText={(text) =>
                    setLocationForm((prev) => ({ ...prev, latitude: text }))
                  }
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.secureInput}
                  placeholder="-60.024321"
                  placeholderTextColor={themeColors.mutedText}
                  keyboardType="numeric"
                  value={locationForm.longitude}
                  onChangeText={(text) =>
                    setLocationForm((prev) => ({ ...prev, longitude: text }))
                  }
                />
              </View>
            </View>
            {locationErrors.coords && (
              <Text style={styles.inputError}>{locationErrors.coords}</Text>
            )}

            <AppButton label="Salvar localização" onPress={handleSaveLocation} />
            <AppButton
              label="Cancelar"
              variant="secondary"
              onPress={closeLocationModal}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CourierOrdersScreen;
