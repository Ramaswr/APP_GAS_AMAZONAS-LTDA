import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, Text, View } from 'react-native';
import UserSelectionScreen from './src/components/screens/UserSelectionScreen';
import LoginScreen from './src/components/screens/LoginScreen';
import RegisterScreen from './src/components/screens/RegisterScreen';
import SelectProductScreen from './src/components/screens/SelectProductScreen';
import CartScreen from './src/components/screens/CartScreen';
import PaymentScreen from './src/components/screens/PaymentScreen';
import ThankYouScreen from './src/components/screens/ThankYouScreen';
import OrderManagementScreen from './src/components/screens/OrderManagementScreen';
import RoleDashboardScreen from './src/components/screens/RoleDashboardScreen';
import styles from './src/styles/globalStyles';
import { PRODUCTS } from './src/constants/products';
import { CLIENT_CREDENTIALS, STORAGE_KEYS } from './src/constants/users';
import { readJson, writeJson } from './src/utils/storage';

const CLIENT_ROLE = 'Cliente';
const DELIVERY_ROLE = 'Entregador';
const ADMIN_ROLE = 'Administrador';

const App = () => {
  const [screen, setScreen] = useState('userSelect');
  const [userType, setUserType] = useState(null);
  const [registeredClients, setRegisteredClients] = useState([]);
  const [clientEmail, setClientEmail] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastOrderInfo, setLastOrderInfo] = useState(null);
  const [focusedClientEmail, setFocusedClientEmail] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const hydrateState = async () => {
      try {
        const [storedOrders, storedCart, storedRole, storedClientEmail, storedClients, storedLogin, storedLastOrder] = await Promise.all([
          readJson(STORAGE_KEYS.PENDING_ORDERS, []),
          readJson(STORAGE_KEYS.CART, []),
          readJson(STORAGE_KEYS.USER_TYPE, null),
          readJson(STORAGE_KEYS.CLIENT_EMAIL, null),
          readJson(STORAGE_KEYS.CLIENT_DATA, []),
          readJson(STORAGE_KEYS.IS_LOGGED_IN, false),
          readJson(STORAGE_KEYS.LAST_ORDER, null),
        ]);

        setOrders(storedOrders || []);
        setCart(storedCart || []);
        setUserType(storedRole);
        setClientEmail(storedClientEmail);
        setRegisteredClients(storedClients || []);
        setIsClientLoggedIn(Boolean(storedLogin && storedRole === CLIENT_ROLE));
        setLastOrderInfo(storedLastOrder);

        if (storedRole === CLIENT_ROLE) {
          setScreen(Boolean(storedLogin) ? 'home' : 'login');
        } else if (storedRole === DELIVERY_ROLE || storedRole === ADMIN_ROLE) {
          setScreen('roleDashboard');
        }
      } catch (error) {
        console.warn('Falha ao hidratar estado inicial', error);
      } finally {
        setIsLoading(false);
        setBootstrapped(true);
      }
    };

    hydrateState();
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.PENDING_ORDERS, orders);
  }, [orders, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.CART, cart);
  }, [cart, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.CLIENT_DATA, registeredClients);
  }, [registeredClients, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.USER_TYPE, userType);
  }, [userType, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.CLIENT_EMAIL, clientEmail);
  }, [clientEmail, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.IS_LOGGED_IN, isClientLoggedIn);
  }, [isClientLoggedIn, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.LAST_ORDER, lastOrderInfo);
  }, [lastOrderInfo, bootstrapped]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + (item.quantity || 1), 0), [cart]);

  const handleSelectUser = useCallback((roleKey) => {
    setUserType(roleKey);
    setFocusedClientEmail(null);
    if (roleKey === CLIENT_ROLE) {
      setScreen(isClientLoggedIn ? 'home' : 'login');
    } else {
      setScreen('roleDashboard');
    }
  }, [isClientLoggedIn]);

  const handleClientLogin = useCallback((email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha para continuar.');
      return;
    }

    const storedUser = registeredClients.find(client => client.email === normalizedEmail && client.password === password);
    const useDefaultCredentials = normalizedEmail === CLIENT_CREDENTIALS.user && password === CLIENT_CREDENTIALS.pass;

    if (!storedUser && !useDefaultCredentials) {
      Alert.alert('Credenciais inválidas', 'Verifique os dados informados ou realize um cadastro.');
      return;
    }

    setClientEmail(normalizedEmail);
    setIsClientLoggedIn(true);
    setScreen('home');
  }, [registeredClients]);

  const handleClientRegister = useCallback(({ name, email, password, confirmPassword }) => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para concluir o cadastro.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas divergentes', 'A confirmação deve ser idêntica à senha informada.');
      return;
    }

    const emailAlreadyUsed = normalizedEmail === CLIENT_CREDENTIALS.user || registeredClients.some(client => client.email === normalizedEmail);

    if (emailAlreadyUsed) {
      Alert.alert('E-mail em uso', 'Já existe um cadastro associado a este endereço eletrônico.');
      return;
    }

    setRegisteredClients(prev => [...prev, { name: trimmedName, email: normalizedEmail, password }]);
    Alert.alert('Cadastro criado', 'Sua conta foi gerada com sucesso.');
    setScreen('login');
  }, [registeredClients]);

  const handleLogout = useCallback(() => {
    setScreen('userSelect');
    setUserType(null);
    setClientEmail(null);
    setIsClientLoggedIn(false);
    setCart([]);
    setFocusedClientEmail(null);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setCart(prevCart => {
      const exists = prevCart.find(item => item.id === product.id);
      if (exists) {
        return prevCart.map(item => (
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        ));
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const handleIncrementCartItem = useCallback((productId) => {
    setCart(prev => prev.map(item => (
      item.id === productId
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item
    )));
  }, []);

  const handleDecrementCartItem = useCallback((productId) => {
    setCart(prev => prev.flatMap(item => {
      if (item.id !== productId) return [item];
      const nextQuantity = (item.quantity || 1) - 1;
      if (nextQuantity <= 0) return [];
      return [{ ...item, quantity: nextQuantity }];
    }));
  }, []);

  const handleRemoveCartItem = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const handleConfirmPayment = useCallback((cartItems, totalAmount, paymentMethod) => {
    if (!cartItems.length) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de confirmar o pagamento.');
      return;
    }

    if (!clientEmail) {
      Alert.alert('Sessão expirada', 'Realize login novamente para concluir o pedido.');
      setScreen('login');
      return;
    }

    const newOrder = {
      id: `order_${Date.now()}`,
      clientEmail,
      paymentMethod,
      total: totalAmount,
      items: cartItems.map(item => ({ ...item })),
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setLastOrderInfo({ paymentMethod, total: totalAmount });
    setScreen('thankYou');
  }, [clientEmail]);

  const handleReturnHome = useCallback(() => {
    setLastOrderInfo(null);
    setScreen('home');
  }, []);

  const handleIncrementOrderItem = useCallback((targetOrder, targetItem) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== targetOrder.id) return order;
      const updatedItems = order.items.map(item => (
        item.id === targetItem.id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      ));
      return { ...order, items: updatedItems, total: order.total + targetItem.price };
    }));
  }, []);

  const handleRemoveOrderItem = useCallback((targetOrder, targetItem) => {
    setOrders(prev => prev.flatMap(order => {
      if (order.id !== targetOrder.id) return [order];
      const removableItem = order.items.find(item => item.id === targetItem.id);
      if (!removableItem) return [order];
      const updatedItems = order.items.filter(item => item.id !== targetItem.id);
      const delta = (removableItem.quantity || 1) * removableItem.price;
      const updatedOrder = { ...order, items: updatedItems, total: Math.max(0, order.total - delta) };
      if (!updatedItems.length) return [];
      return [updatedOrder];
    }));
  }, []);

  const handleOpenOrdersBoard = useCallback((emailFilter = null) => {
    setFocusedClientEmail(emailFilter);
    setScreen('orders');
  }, []);

  const visibleOrders = useMemo(() => {
    let baseOrders = orders;
    if (userType === CLIENT_ROLE) {
      baseOrders = orders.filter(order => order.clientEmail === clientEmail);
    }
    if (focusedClientEmail) {
      baseOrders = baseOrders.filter(order => order.clientEmail === focusedClientEmail);
    }
    return baseOrders;
  }, [orders, userType, clientEmail, focusedClientEmail]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D90000" />
        <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '600' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {(!userType || screen === 'userSelect') && (
        <UserSelectionScreen onSelectUser={handleSelectUser} />
      )}

      {userType === CLIENT_ROLE && screen === 'login' && !isClientLoggedIn && (
        <LoginScreen
          onLogin={handleClientLogin}
          onBackToSelection={handleLogout}
          onNavigateToRegister={() => setScreen('register')}
          registeredUsers={registeredClients}
        />
      )}

      {userType === CLIENT_ROLE && screen === 'register' && (
        <RegisterScreen
          onRegisterSuccess={handleClientRegister}
          onBackToLogin={() => setScreen('login')}
        />
      )}

      {userType === CLIENT_ROLE && screen === 'home' && (
        <SelectProductScreen
          products={PRODUCTS}
          onProductSelect={handleProductSelect}
          onLogout={handleLogout}
          clientEmail={clientEmail}
          onViewCart={() => setScreen('cart')}
          cartCount={cartCount}
          onViewOrders={() => handleOpenOrdersBoard(clientEmail)}
        />
      )}

      {userType === CLIENT_ROLE && screen === 'cart' && (
        <CartScreen
          cart={cart}
          onIncrement={handleIncrementCartItem}
          onDecrement={handleDecrementCartItem}
          onRemove={handleRemoveCartItem}
          onProceedToPayment={() => setScreen('payment')}
          onBack={() => setScreen('home')}
        />
      )}

      {userType === CLIENT_ROLE && screen === 'payment' && (
        <PaymentScreen
          cart={cart}
          clientEmail={clientEmail}
          onConfirmPayment={handleConfirmPayment}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'orders' && (
        <OrderManagementScreen
          orders={visibleOrders}
          userType={userType}
          clientEmail={clientEmail}
          onIncrementItem={handleIncrementOrderItem}
          onRemoveItem={handleRemoveOrderItem}
          onBack={() => {
            if (userType === CLIENT_ROLE) {
              setScreen('home');
            } else {
              setScreen('roleDashboard');
            }
            setFocusedClientEmail(null);
          }}
        />
      )}

      {screen === 'roleDashboard' && userType !== CLIENT_ROLE && (
        <RoleDashboardScreen
          userType={userType}
          registeredClients={registeredClients}
          orders={orders}
          onViewAllOrders={() => handleOpenOrdersBoard(null)}
          onViewClientOrders={(email) => handleOpenOrdersBoard(email)}
          onBackToSelection={() => {
            setScreen('userSelect');
            setUserType(null);
          }}
        />
      )}

      {screen === 'thankYou' && (
        <ThankYouScreen
          paymentMethod={lastOrderInfo?.paymentMethod || 'Indefinido'}
          total={lastOrderInfo?.total || 0}
          onReturnHome={handleReturnHome}
        />
      )}
    </View>
  );
};

export default App;
