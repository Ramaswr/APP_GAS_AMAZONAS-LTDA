// ## Importa React e hooks necessários para o ciclo de vida e memoização
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// ## Importa componentes básicos do React Native usados na estrutura visual
import { ActivityIndicator, Alert, StatusBar, Text, View } from 'react-native';
// ## Importa a tela de seleção de tipo de usuário
import UserSelectionScreen from './src/components/screens/UserSelectionScreen';
// ## Importa a tela de login de clientes
import LoginScreen from './src/components/screens/LoginScreen';
// ## Importa a tela de cadastro de clientes
import RegisterScreen from './src/components/screens/RegisterScreen';
// ## Importa a tela principal para seleção de produtos
import SelectProductScreen from './src/components/screens/SelectProductScreen';
// ## Importa a tela que mostra itens adicionados ao carrinho
import CartScreen from './src/components/screens/CartScreen';
// ## Importa a tela responsável pelo fluxo de pagamento
import PaymentScreen from './src/components/screens/PaymentScreen';
// ## Importa a tela de agradecimento exibida após um pedido
import ThankYouScreen from './src/components/screens/ThankYouScreen';
// ## Importa a tela de gerenciamento de pedidos pendentes
import OrderManagementScreen from './src/components/screens/OrderManagementScreen';
// ## Importa o painel usado por administradores e entregadores
import RoleDashboardScreen from './src/components/screens/RoleDashboardScreen';
// ## Importa estilos globais e provedores de tema reutilizados no app inteiro
import { createStyles, themes } from './src/styles/globalStyles';
import { ThemeProvider } from './src/styles/ThemeContext';
// ## Importa o catálogo estático de produtos disponíveis
import { PRODUCTS } from './src/constants/products';
// ## Importa credenciais padrão e chaves de armazenamento
import { CLIENT_CREDENTIALS, STORAGE_KEYS } from './src/constants/users';
// ## Importa utilitários para leitura e escrita em armazenamento persistente
import { readJson, writeJson } from './src/utils/storage';
import {
  createOrder as createOrderApi,
  fetchDashboardSummary,
  fetchDeliverers,
  fetchOrders,
} from './src/utils/api';

// ## Define a string que representa o papel de cliente
const CLIENT_ROLE = 'Cliente';
// ## Define a string que representa o papel de entregador
const DELIVERY_ROLE = 'Entregador';
// ## Define a string que representa o papel de administrador
const ADMIN_ROLE = 'Administrador';

// ## Mapeia pedidos vindos da API para o formato usado na UI
const mapApiOrder = (order) => {
  if (!order) return null;
  const mappedItems = (order.items || []).map((item) => {
    const productMeta = PRODUCTS.find((product) => product.id === item.product_id);
    return {
      id: item.product_id,
      name: item.product_name,
      price: item.unit_price,
      quantity: item.quantity,
      image: productMeta?.image || null,
      type: productMeta?.type,
      weight: productMeta?.weight,
    };
  });

  return {
    id: order.id,
    clientEmail: order.user?.email || order.clientEmail || 'cliente@desconhecido',
    paymentMethod: order.payment_method || 'Não informado',
    total: order.total_value,
    items: mappedItems,
    status: order.status,
    trackingPoints: order.tracking_points || [],
    assignedDeliverer: order.assigned_deliverer || null,
    invoiceNumber: order.invoice_number,
    invoiceUrl: order.invoice_url,
    proofs: order.proofs || [],
  };
};

// ## Componente principal que controla o fluxo de telas e estados
const App = () => {
  // ## Estado que controla qual tela está ativa
  const [screen, setScreen] = useState('userSelect');
  // ## Estado que guarda o tipo de usuário em uso
  const [userType, setUserType] = useState(null);
  // ## Lista de clientes cadastrados localmente
  const [registeredClients, setRegisteredClients] = useState([]);
  // ## Armazena o e-mail do cliente autenticado
  const [clientEmail, setClientEmail] = useState(null);
  // ## Estado que descreve o conteúdo do carrinho
  const [cart, setCart] = useState([]);
  // ## Estado que guarda pedidos pendentes
  const [orders, setOrders] = useState([]);
  // ## Indica se há uma sincronização ativa com o backend
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  // ## Mantém a lista de entregadores vinda do backend
  const [deliverers, setDeliverers] = useState([]);
  // ## Guarda métricas agregadas para o dashboard operacional
  const [dashboardSummary, setDashboardSummary] = useState(null);
  // ## Indica se o cliente atual está autenticado
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  // ## Indica se o app ainda está carregando dados iniciais
  const [isLoading, setIsLoading] = useState(true);
  // ## Guarda informações sobre o último pedido finalizado
  const [lastOrderInfo, setLastOrderInfo] = useState(null);
  // ## Define um filtro por e-mail para visualização de pedidos
  const [focusedClientEmail, setFocusedClientEmail] = useState(null);
  // ## Indica se os dados iniciais já foram carregados do storage
  const [bootstrapped, setBootstrapped] = useState(false);
  // ## Guarda a preferência de tema do usuário
  const [themeMode, setThemeMode] = useState('light');

  // ## Paleta e estilos derivados do tema atual
  const themeColors = themes[themeMode] || themes.light;
  const styles = useMemo(() => createStyles(themeMode), [themeMode]);

  // ## Sincroniza o estado inicial com dados persistidos ao montar o app
  useEffect(() => {
    // ## Função que executa a leitura dos dados armazenados
    const hydrateState = async () => {
      // ## Tenta ler os dados persistidos tratando possíveis falhas
      try {
        // ## Lê em paralelo todos os registros necessários do armazenamento
        const [
          storedOrders,
          storedCart,
          storedRole,
          storedClientEmail,
          storedClients,
          storedLogin,
          storedLastOrder,
          storedTheme,
        ] = await Promise.all([
          // ## Recupera pedidos pendentes gravados anteriormente
          readJson(STORAGE_KEYS.PENDING_ORDERS, []),
          // ## Recupera o carrinho salvo localmente
          readJson(STORAGE_KEYS.CART, []),
          // ## Recupera o último papel de usuário selecionado
          readJson(STORAGE_KEYS.USER_TYPE, null),
          // ## Recupera o e-mail do cliente autenticado
          readJson(STORAGE_KEYS.CLIENT_EMAIL, null),
          // ## Recupera dados de clientes cadastrados
          readJson(STORAGE_KEYS.CLIENT_DATA, []),
          // ## Recupera o estado de autenticação salvo
          readJson(STORAGE_KEYS.IS_LOGGED_IN, false),
          // ## Recupera informações do último pedido
          readJson(STORAGE_KEYS.LAST_ORDER, null),
          // ## Recupera o tema preferido (claro/escuro)
          readJson(STORAGE_KEYS.THEME_MODE, 'light'),
        ]);

        // ## Seta pedidos carregados ou lista vazia por padrão
        setOrders(storedOrders || []);
        // ## Seta carrinho persistido ou reinicia vazio
        setCart(storedCart || []);
        // ## Restaura o tipo de usuário utilizado anteriormente
        setUserType(storedRole);
        // ## Recupera o e-mail do cliente ativo
        setClientEmail(storedClientEmail);
        // ## Recarrega clientes cadastrados anteriormente
        setRegisteredClients(storedClients || []);
        // ## Define flag de login apenas para clientes autenticados
        setIsClientLoggedIn(!!(storedLogin && storedRole === CLIENT_ROLE));
        // ## Armazena informações do último pedido concluído
        setLastOrderInfo(storedLastOrder);
        // ## Restaura o tema salvo (padrão claro)
        setThemeMode(storedTheme === 'dark' ? 'dark' : 'light');

        // ## Tenta sincronizar pedidos com o backend assim que possível
        await syncOrdersFromBackend();

        // ## Direciona a tela inicial conforme o papel salvo
        if (storedRole === CLIENT_ROLE) {
          // ## Exibe home se havia sessão ou login caso contrário
          setScreen(storedLogin ? 'home' : 'login');
        } else if (storedRole === DELIVERY_ROLE || storedRole === ADMIN_ROLE) {
          // ## Redireciona perfis internos ao dashboard específico
          setScreen('roleDashboard');
        }
      } catch (error) {
        // ## Loga um aviso caso ocorra falha na hidratação
        console.warn('Falha ao hidratar estado inicial', error);
      } finally {
        // ## Finaliza o carregamento inicial
        setIsLoading(false);
        // ## Marca que a hidratação foi concluída
        setBootstrapped(true);
      }
    };

    // ## Executa a hidratação assim que o componente monta
    hydrateState();
  }, [syncOrdersFromBackend]);

  // ## Sempre que um perfil interno estiver ativo, sincroniza dados operacionais
  useEffect(() => {
    if (userType && userType !== CLIENT_ROLE) {
      loadOperationalData();
    }
  }, [userType, loadOperationalData]);

  // ## Persiste os pedidos sempre que forem alterados após o bootstrap
  useEffect(() => {
    // ## Aguarda a hidratação inicial antes de persistir
    if (!bootstrapped) return;
    // ## Salva os pedidos pendentes no armazenamento
    writeJson(STORAGE_KEYS.PENDING_ORDERS, orders);
  }, [orders, bootstrapped]);

  // ## Persiste o carrinho sempre que houver mudança após o bootstrap
  useEffect(() => {
    // ## Evita escrita prematura antes da hidratação
    if (!bootstrapped) return;
    // ## Persiste o carrinho atual
    writeJson(STORAGE_KEYS.CART, cart);
  }, [cart, bootstrapped]);

  // ## Persiste a lista de clientes cadastrados quando houver alterações
  useEffect(() => {
    // ## Só executa após concluir o bootstrap
    if (!bootstrapped) return;
    // ## Salva a lista de clientes registrados localmente
    writeJson(STORAGE_KEYS.CLIENT_DATA, registeredClients);
  }, [registeredClients, bootstrapped]);

  // ## Persiste o tipo de usuário escolhido
  useEffect(() => {
    // ## Evita gravar antes da hidratação inicial
    if (!bootstrapped) return;
    // ## Grava o tipo de usuário selecionado
    writeJson(STORAGE_KEYS.USER_TYPE, userType);
  }, [userType, bootstrapped]);

  // ## Persiste o e-mail do cliente logado
  useEffect(() => {
    // ## Aguarda a hidratação antes de atualizar o storage
    if (!bootstrapped) return;
    // ## Persiste o e-mail do cliente logado
    writeJson(STORAGE_KEYS.CLIENT_EMAIL, clientEmail);
  }, [clientEmail, bootstrapped]);

  // ## Persiste o estado de autenticação do cliente
  useEffect(() => {
    // ## Impede escrita antes da sincronização inicial
    if (!bootstrapped) return;
    // ## Salva se o cliente está autenticado
    writeJson(STORAGE_KEYS.IS_LOGGED_IN, isClientLoggedIn);
  }, [isClientLoggedIn, bootstrapped]);

  // ## Persiste informações do último pedido exibido
  useEffect(() => {
    // ## Espera a hidratação antes de salvar o último pedido
    if (!bootstrapped) return;
    // ## Persiste detalhes do último pedido finalizado
    writeJson(STORAGE_KEYS.LAST_ORDER, lastOrderInfo);
  }, [lastOrderInfo, bootstrapped]);

  // ## Persiste o tema escolhido
  useEffect(() => {
    if (!bootstrapped) return;
    writeJson(STORAGE_KEYS.THEME_MODE, themeMode);
  }, [themeMode, bootstrapped]);

  // ## Calcula a quantidade total de itens no carrinho
  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + (item.quantity || 1), 0),
    [cart]
  );

  // ## Alterna entre modo claro/escuro
  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // ## Carrega entregadores e métricas do backend para o dashboard operacional
  const loadOperationalData = useCallback(async () => {
    try {
      const [remoteDeliverers, summary] = await Promise.all([
        fetchDeliverers().catch((error) => {
          console.warn('Falha ao carregar entregadores', error);
          return null;
        }),
        fetchDashboardSummary().catch((error) => {
          console.warn('Falha ao carregar resumo do dashboard', error);
          return null;
        }),
      ]);
      if (Array.isArray(remoteDeliverers)) {
        setDeliverers(remoteDeliverers);
      }
      if (summary) {
        setDashboardSummary(summary);
      }
    } catch (error) {
      console.warn('Erro inesperado ao sincronizar dados operacionais', error);
    }
  }, []);

  // ## Busca pedidos no backend FastAPI e atualiza o estado local
  const syncOrdersFromBackend = useCallback(async () => {
    try {
      setIsSyncingOrders(true);
      const remoteOrders = await fetchOrders();
      if (Array.isArray(remoteOrders)) {
        const normalized = remoteOrders
          .map(mapApiOrder)
          .filter((order) => Boolean(order));
        setOrders(normalized);
      }
    } catch (error) {
      console.warn('Falha ao sincronizar pedidos remotos', error);
    } finally {
      setIsSyncingOrders(false);
    }
  }, []);

  // ## Manipula a seleção do papel do usuário e direciona a tela correta
  const handleSelectUser = useCallback(
    (roleKey) => {
      // ## Atualiza o estado com o papel escolhido
      setUserType(roleKey);
      // ## Reseta qualquer filtro de cliente aplicado
      setFocusedClientEmail(null);
      // ## Decide a navegação com base no papel selecionado
      if (roleKey === CLIENT_ROLE) {
        // ## Direciona o cliente para home ou login conforme autenticação
        setScreen(isClientLoggedIn ? 'home' : 'login');
      } else {
        // ## Direciona perfis internos ao dashboard
        setScreen('roleDashboard');
        loadOperationalData();
      }
    },
    [isClientLoggedIn, loadOperationalData]
  );

  // ## Realiza validações e autenticação do cliente
  const handleClientLogin = useCallback(
    (email, password) => {
      // ## Normaliza o e-mail removendo espaços e padronizando caixa
      const normalizedEmail = email.trim().toLowerCase();
      // ## Garante que e-mail e senha foram informados
      if (!normalizedEmail || !password) {
        Alert.alert('Campos obrigatórios', 'Informe e-mail e senha para continuar.');
        return;
      }

      // ## Busca um cliente registrado com as mesmas credenciais
      const storedUser = registeredClients.find(
        (client) => client.email === normalizedEmail && client.password === password
      );
      // ## Permite o uso das credenciais padrão fornecidas
      const useDefaultCredentials =
        normalizedEmail === CLIENT_CREDENTIALS.user &&
        password === CLIENT_CREDENTIALS.pass;

      // ## Interrompe caso não encontre usuário válido
      if (!storedUser && !useDefaultCredentials) {
        Alert.alert(
          'Credenciais inválidas',
          'Verifique os dados informados ou realize um cadastro.'
        );
        return;
      }

      // ## Armazena o e-mail do cliente logado
      setClientEmail(normalizedEmail);
      // ## Marca o cliente como autenticado
      setIsClientLoggedIn(true);
      // ## Leva o cliente para a tela principal de compras
      setScreen('home');
    },
    [registeredClients]
  );

  // ## Gerencia cadastro de novos clientes com validações
  const handleClientRegister = useCallback(
    ({ name, email, password, confirmPassword }) => {
      // ## Remove espaços extras no nome
      const trimmedName = name.trim();
      // ## Normaliza o e-mail para caixa baixa
      const normalizedEmail = email.trim().toLowerCase();

      // ## Garante que todos os campos foram preenchidos
      if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
        Alert.alert(
          'Campos obrigatórios',
          'Preencha todos os campos para concluir o cadastro.'
        );
        return;
      }

      // ## Valida tamanho mínimo da senha
      if (password.length < 6) {
        Alert.alert('Senha inválida', 'A senha deve possuir no mínimo 6 caracteres.');
        return;
      }

      // ## Confere se a confirmação de senha coincide
      if (password !== confirmPassword) {
        Alert.alert(
          'Senhas divergentes',
          'A confirmação deve ser idêntica à senha informada.'
        );
        return;
      }

      // ## Evita cadastros duplicados ou conflito com credenciais padrão
      const emailAlreadyUsed =
        normalizedEmail === CLIENT_CREDENTIALS.user ||
        registeredClients.some((client) => client.email === normalizedEmail);

      // ## Impede cadastro se o e-mail já estiver em uso
      if (emailAlreadyUsed) {
        Alert.alert(
          'E-mail em uso',
          'Já existe um cadastro associado a este endereço eletrônico.'
        );
        return;
      }

      // ## Adiciona o novo cliente à lista local
      setRegisteredClients((prev) => [
        ...prev,
        { name: trimmedName, email: normalizedEmail, password },
      ]);
      // ## Confirma a criação do cadastro para o usuário
      Alert.alert('Cadastro criado', 'Sua conta foi gerada com sucesso.');
      // ## Retorna o fluxo para a tela de login
      setScreen('login');
    },
    [registeredClients]
  );

  // ## Realiza logout limpando estados sensíveis
  const handleLogout = useCallback(() => {
    // ## Volta a navegação para a escolha de usuário
    setScreen('userSelect');
    // ## Limpa o papel selecionado
    setUserType(null);
    // ## Remove o e-mail do cliente atual
    setClientEmail(null);
    // ## Marca o cliente como deslogado
    setIsClientLoggedIn(false);
    // ## Limpa o carrinho de compras
    setCart([]);
    // ## Remove filtros específicos de pedidos
    setFocusedClientEmail(null);
  }, []);

  // ## Adiciona produtos ao carrinho ou incrementa se já existirem
  const handleProductSelect = useCallback((product) => {
    // ## Atualiza o carrinho com base no item selecionado
    setCart((prevCart) => {
      // ## Verifica se o produto já estava no carrinho
      const exists = prevCart.find((item) => item.id === product.id);
      if (exists) {
        // ## Incrementa a quantidade do produto existente
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      // ## Adiciona o produto com quantidade inicial igual a 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  // ## Incrementa a quantidade de um item específico do carrinho
  const handleIncrementCartItem = useCallback((productId) => {
    // ## Percorre os itens para encontrar o produto e incrementar
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  }, []);

  // ## Decrementa a quantidade de um item e remove se chegar a zero
  const handleDecrementCartItem = useCallback((productId) => {
    // ## Reduz a quantidade do item alvo e remove quando zera
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id !== productId) return [item];
        const nextQuantity = (item.quantity || 1) - 1;
        if (nextQuantity <= 0) return [];
        return [{ ...item, quantity: nextQuantity }];
      })
    );
  }, []);

  // ## Remove completamente um produto do carrinho
  const handleRemoveCartItem = useCallback((productId) => {
    // ## Remove o item escolhido sem alterar os demais
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  // ## Confirma o pagamento, gera pedido e limpa o carrinho
  const handleConfirmPayment = useCallback(
    async (cartItems, totalAmount, paymentMethod) => {
      // ## Impede finalização se o carrinho estiver vazio
      if (!cartItems.length) {
        Alert.alert(
          'Carrinho vazio',
          'Adicione produtos antes de confirmar o pagamento.'
        );
        return;
      }

      // ## Verifica se ainda há uma sessão válida
      if (!clientEmail) {
        Alert.alert('Sessão expirada', 'Realize login novamente para concluir o pedido.');
        setScreen('login');
        return;
      }

      const fallbackOrder = {
        id: `order_${Date.now()}`,
        clientEmail,
        paymentMethod,
        total: totalAmount,
        items: cartItems.map((item) => ({ ...item })),
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        trackingPoints: [],
        assignedDeliverer: null,
        invoiceNumber: null,
        invoiceUrl: null,
        proofs: [],
      };

      try {
        await createOrderApi({
          user_email: clientEmail,
          payment_method: paymentMethod,
          items: cartItems.map((item) => ({
            product_id: item.id,
            product_name: item.name,
            unit_price: item.price,
            quantity: item.quantity || 1,
          })),
        });
        await syncOrdersFromBackend();
        await loadOperationalData();
      } catch (error) {
        console.warn('Não foi possível registrar o pedido remotamente', error);
        Alert.alert(
          'Modo offline',
          'O servidor não respondeu. O pedido foi salvo apenas no dispositivo e será sincronizado depois.'
        );
        setOrders((prev) => [fallbackOrder, ...prev]);
      } finally {
        setCart([]);
        setLastOrderInfo({ paymentMethod, total: totalAmount });
        setScreen('thankYou');
      }
    },
    [clientEmail, loadOperationalData, syncOrdersFromBackend]
  );

  // ## Retorna da tela de agradecimento para a seleção de produtos
  const handleReturnHome = useCallback(() => {
    // ## Limpa dados do último pedido para evitar repetição
    setLastOrderInfo(null);
    // ## Volta o usuário para a tela principal de compras
    setScreen('home');
  }, []);

  // ## Incrementa itens dentro de um pedido existente
  const handleIncrementOrderItem = useCallback((targetOrder, targetItem) => {
    // ## Atualiza o pedido alvo incrementando o item selecionado
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== targetOrder.id) return order;
        const updatedItems = order.items.map((item) =>
          item.id === targetItem.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        return { ...order, items: updatedItems, total: order.total + targetItem.price };
      })
    );
  }, []);

  // ## Remove itens de um pedido e exclui pedidos vazios
  const handleRemoveOrderItem = useCallback((targetOrder, targetItem) => {
    // ## Remove o item indicado e exclui pedidos vazios
    setOrders((prev) =>
      prev.flatMap((order) => {
        if (order.id !== targetOrder.id) return [order];
        const removableItem = order.items.find((item) => item.id === targetItem.id);
        if (!removableItem) return [order];
        const updatedItems = order.items.filter((item) => item.id !== targetItem.id);
        const delta = (removableItem.quantity || 1) * removableItem.price;
        const updatedOrder = {
          ...order,
          items: updatedItems,
          total: Math.max(0, order.total - delta),
        };
        if (!updatedItems.length) return [];
        return [updatedOrder];
      })
    );
  }, []);

  // ## Abre o quadro de pedidos aplicando um filtro opcional por e-mail
  const handleOpenOrdersBoard = useCallback((emailFilter = null) => {
    // ## Define qual e-mail deve ser usado como filtro (ou nenhum)
    setFocusedClientEmail(emailFilter);
    // ## Troca para a tela de gerenciamento de pedidos
    setScreen('orders');
  }, []);

  // ## Determina quais pedidos devem ser exibidos conforme filtros
  const visibleOrders = useMemo(() => {
    // ## Parte da lista completa de pedidos
    let baseOrders = orders;
    // ## Limita para pedidos do próprio cliente quando aplicável
    if (userType === CLIENT_ROLE) {
      baseOrders = orders.filter((order) => order.clientEmail === clientEmail);
    }
    // ## Aplica filtro por e-mail quando definido no painel
    if (focusedClientEmail) {
      baseOrders = baseOrders.filter((order) => order.clientEmail === focusedClientEmail);
    }
    // ## Retorna a coleção final a ser exibida
    return baseOrders;
  }, [orders, userType, clientEmail, focusedClientEmail]);

  // ## Exibe um loader enquanto os dados iniciais são carregados
  if (isLoading) {
    // ## Mostra uma tela de carregamento enquanto sincroniza dados
    return (
      <View style={styles.loadingContainer}>
        {/* ## Indicador visual de carregamento */}
        <ActivityIndicator size="large" color={themeColors.primary} />
        {/* ## Mensagem textual informando o status */}
        <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '600' }}>
          Carregando...
        </Text>
      </View>
    );
  }

  // ## Renderiza a árvore principal conforme as combinações de tela e papel
  return (
    <ThemeProvider mode={themeMode} toggleTheme={toggleThemeMode}>
      <View style={{ flex: 1, backgroundColor: themeColors.background }}>
        {/* ## Configura a barra de status conforme o tema */}
        <StatusBar barStyle={themeColors.statusBar} />
        {/* ## Indica quando há sincronização ativa com o backend */}
        {isSyncingOrders && (
          <View
            style={{
              backgroundColor: themeColors.highlight,
              paddingVertical: 8,
              paddingHorizontal: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: themeColors.primary, fontWeight: '600' }}>
              Sincronizando pedidos com o servidor...
            </Text>
          </View>
        )}
        {/* ## Exibe seleção de usuário quando ninguém está definido */}
        {(!userType || screen === 'userSelect') && (
          <UserSelectionScreen onSelectUser={handleSelectUser} />
        )}

        {/* ## Exibe a tela de login de clientes quando apropriado */}
        {userType === CLIENT_ROLE && screen === 'login' && !isClientLoggedIn && (
          <LoginScreen
            onLogin={handleClientLogin}
            onBackToSelection={handleLogout}
            onNavigateToRegister={() => setScreen('register')}
          />
        )}

        {/* ## Renderiza o formulário de cadastro de clientes */}
        {userType === CLIENT_ROLE && screen === 'register' && (
          <RegisterScreen
            onRegisterSuccess={handleClientRegister}
            onBackToLogin={() => setScreen('login')}
          />
        )}

        {/* ## Mostra a lista de produtos para clientes autenticados */}
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

        {/* ## Exibe os itens presentes no carrinho do cliente */}
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

        {/* ## Fluxo de pagamento para finalizar compra */}
        {userType === CLIENT_ROLE && screen === 'payment' && (
          <PaymentScreen
            cart={cart}
            clientEmail={clientEmail}
            onConfirmPayment={handleConfirmPayment}
            onBack={() => setScreen('home')}
          />
        )}

        {/* ## Painel de pedidos acessível a todos os papéis */}
        {screen === 'orders' && (
          <OrderManagementScreen
            orders={visibleOrders}
            userType={userType}
            clientEmail={clientEmail}
            onIncrementItem={handleIncrementOrderItem}
            onRemoveItem={handleRemoveOrderItem}
            onBack={() => {
              if (userType === CLIENT_ROLE) {
                // ## Cliente retorna para a home
                setScreen('home');
              } else {
                // ## Papéis internos retornam ao dashboard
                setScreen('roleDashboard');
              }
              // ## Limpa filtro aplicado ao painel de pedidos
              setFocusedClientEmail(null);
            }}
          />
        )}

        {/* ## Painel principal para entregadores e administradores */}
        {screen === 'roleDashboard' && userType !== CLIENT_ROLE && (
          <RoleDashboardScreen
            userType={userType}
            registeredClients={registeredClients}
            orders={orders}
            deliverers={deliverers}
            summary={dashboardSummary}
            onViewAllOrders={() => handleOpenOrdersBoard(null)}
            onViewClientOrders={(email) => handleOpenOrdersBoard(email)}
            onRefreshDashboard={() => {
              syncOrdersFromBackend();
              loadOperationalData();
            }}
            onBackToSelection={() => {
              // ## Retorna para a escolha de perfil quando solicitado
              setScreen('userSelect');
              // ## Limpa o tipo de usuário atual
              setUserType(null);
            }}
          />
        )}

        {/* ## Tela exibida após confirmação do pedido */}
        {screen === 'thankYou' && (
          <ThankYouScreen
            paymentMethod={lastOrderInfo?.paymentMethod || 'Indefinido'}
            total={lastOrderInfo?.total || 0}
            onReturnHome={handleReturnHome}
          />
        )}
      </View>
    </ThemeProvider>
  );
};

// ## Exporta o componente principal para uso pelo Expo
export default App;
