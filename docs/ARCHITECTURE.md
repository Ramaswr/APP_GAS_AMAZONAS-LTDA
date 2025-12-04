# App-Gas Amazonas LTDA — Documentacao Tecnica

## Objetivo

Este documento descreve, de forma cientifica e pratica, como o aplicativo App-Gas Amazonas LTDA e o backend FastAPI colaboram para atender aos fluxos de venda, entrega e gestao de pedidos. Ele complementa o README principal com mais detalhes de arquitetura, dados e fluxos operacionais.

---

## 1. Contexto do Sistema

```text
[Cliente Web/Mobile (Expo)] <----HTTP/JSON----> [API FastAPI] <----SQLAlchemy----> [SQLite]
       |                                                        ^
       |                                                        |
       +---- AsyncStorage (dados locais) -----------------------+
```

- **Cliente Expo (React Native / Web)**: responsavel por toda a experiencia do usuario, autenticacao local, carrinho e disparo de pedidos.
- **API FastAPI**: provê persistencia duravel de usuarios e pedidos, expõe endpoints REST e aplica validacoes.
- **SQLite**: banco relacional transacional. Armazena usuarios, pedidos e itens com integridade referencial no SQLite.
- **AsyncStorage**: cache e estado offline para carrinho, usuarios logados, pedidos pendentes e configuracoes rapidas.

---

## 2. Camada Mobile/Web (Expo)

### 2.1 Componentes principais

| Componente              | Responsabilidade principal                                                   |
| ----------------------- | ---------------------------------------------------------------------------- |
| `UserSelectionScreen`   | Escolha inicial de perfil (Cliente, Entregador, Admin).                      |
| `LoginScreen`           | Autenticacao local do cliente utilizando credenciais persistidas ou default. |
| `RegisterScreen`        | Cadastro local validado de novos clientes.                                   |
| `SelectProductScreen`   | Listagem de `PRODUCTS`, acesso ao carrinho e pedidos.                        |
| `CartScreen`            | Gestao detalhada de itens, quantidades e remocao.                            |
| `PaymentScreen`         | Escolha de metodo de pagamento e confirmacao do pedido.                      |
| `OrderManagementScreen` | Painel de pedidos filtrados para cliente e operadores.                       |
| `RoleDashboardScreen`   | Visao operacional para entregadores/administradores.                         |
| `ThankYouScreen`        | Feedback final apos pagamento confirmado.                                    |

### 2.2 Gerenciamento de estado

`App.js` concentra o orquestrador de telas com `useState`, `useEffect`, `useMemo` e `useCallback`. O fluxo principal ocorre em tres fases:

1. **Hidratacao**: leitura paralela de todos os registros em `AsyncStorage` via `readJson`. Controlada pela flag `bootstrapped`.
2. **Persistencia dirigida por efeitos**: a cada mutacao relevante (pedidos, carrinho, tipo de usuario etc.) um `useEffect` grava o espelho no armazenamento local para garantir continuidade offline.
3. **Derivacoes**: `cartCount` e `visibleOrders` usam `useMemo` para evitar renderizacoes desnecessarias.

### 2.3 Chaves e contratos AsyncStorage

| Chave            | Conteudo                                           | Origem              |
| ---------------- | -------------------------------------------------- | ------------------- |
| `@PendingOrders` | Array de pedidos pendentes locais.                 | `orders`            |
| `@Cart`          | Snapshot do carrinho local.                        | `cart`              |
| `@UserType`      | Perfil logado (Cliente/Entregador/Admin).          | `userType`          |
| `@ClientEmail`   | Email do cliente autenticado.                      | `clientEmail`       |
| `@ClientData`    | Lista de clientes registrados localmente.          | `registeredClients` |
| `@IsloggedIn`    | Booleano referenciando autenticacao do cliente.    | `isClientLoggedIn`  |
| `@LastGasOrder`  | Inf. do ultimo pedido exibida na `ThankYouScreen`. | `lastOrderInfo`     |
| `@ThemeMode`     | Preferencia visual (`light`/`dark`).                | `themeMode`         |

Todas as operacoes utilizam `readJson`/`writeJson`, que encapsulam serializacao JSON e protecao contra dados corrompidos.

### 2.4 Aparencia adaptativa

- `ThemeProvider` (`src/styles/ThemeContext.js`) combina `themes` e `createStyles` para gerar dinamicamente a paleta em cada renderização. O valor do contexto expõe `themeMode`, `themeColors`, `styles` e `toggleTheme`.
- `ThemeToggle` adiciona um seletor `Switch` com copy acessível nas telas principais, permitindo que qualquer perfil altere o contraste sem navegar para configurações.
- A persistência acontece através da chave `@ThemeMode`, garantindo retomada do modo preferido após reinícios e sincronização offline.
- Ambas as paletas foram balanceadas para manter contraste mínimo AA (texto claro em fundo escuro e vice-versa) e replicar feedback cromático (sucesso/perigo) sem comprometer legibilidade.

### 2.5 Produtos e pagamentos

`src/constants/products.js` fixa o catalogo (gas e agua) com preco, peso e imagem. Os metodos de pagamento estao em `PAYMENT_OPTIONS` e sao usados na tela de pagamento.

---

## 3. Camada Backend (FastAPI + SQLite)

### 3.1 Endpoints

| Metodo         | Rota                                                                 | Descricao                                                           |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `GET`          | `/health`                                                            | Verifica disponibilidade do servico.                                |
| `POST`         | `/users`                                                             | Cria usuario (nome, email, senha >= 6). Evita duplicados por email. |
| `GET`          | `/users`                                                             | Lista usuarios ordenados por criacao.                               |
| `POST`         | `/orders`                                                            | Cria pedido vinculado a um usuario, valida itens e totaliza valores. |
| `GET`          | `/orders`                                                            | Lista pedidos com relacionamento `user` e `items`.                   |

A API usa `Pydantic` para validacao e `SQLAlchemy` com `selectinload` para otimizar consultas relacionadas.

### 3.2 Modelo de dados relacional

```text
Users (id, name, email*, password_hash, created_at)
Orders (id, user_id -> Users.id, total_value, status, created_at)
OrderItems (id, order_id -> Orders.id, product_id, product_name, unit_price, quantity)
```

- `status` utiliza um Enum (`PENDING`, `CONFIRMED`, `CANCELLED`).
- `Order.items` tem `cascade="all, delete-orphan"`, garantindo limpeza consistente.
- Senhas sao armazenadas usando SHA-256 (`security.hash_password`).

### 3.3 Pipeline de criacao de pedido

1. `POST /orders` recebe `user_email` e lista de itens.
2. API valida existencia do usuario e se existem itens.
3. Calcula `total_value = sum(unit_price * quantity)`.
4. Insere `Order` e `OrderItem` em transacao.
5. Retorna `PurchaseResponse` com `order_id`, `total_value` e `status`.

### 3.4 Consideracoes de seguranca

- `hash_password` garante armazenamento nao reversivel, mas recomenda-se migrar para algoritmos com salt (ex.: `bcrypt`).
- CORS esta liberado para `*` no prototipo; defina dominios especificos em producao.
- Configurar HTTPS no deploy final.

---

## 4. Fluxos Funcionais

### 4.1 Login e registro de clientes

- Registro local valida campos obrigatorios, tamanho de senha e unicidade de email.
- Login aceita credenciais registradas localmente ou `CLIENT_CREDENTIALS` default. Estados sao persistidos para reabertura do app.

### 4.2 Jornada de pedido do cliente

1. Cliente seleciona produtos em `SelectProductScreen` (somatorio no `cart`).
2. `CartScreen` permite ajustar quantidades com consistencia (remocao quando zera).
3. `PaymentScreen` confirma metodo e chama `handleConfirmPayment`, que gera `newOrder`, limpa carrinho e guarda `lastOrderInfo`.
4. `ThankYouScreen` fornece resumo e aciona `handleReturnHome` para voltar a `home`.

### 4.3 Operacao de entregadores/admins

- `RoleDashboardScreen` exibe métricas basicas, lista clientes registrados e permite abrir o painel de pedidos (com filtros por email).
- `OrderManagementScreen` permite incrementar itens, remover itens ou apagar pedidos vazios. Alteracoes são refletidas no estado global e persistencia local.

---

## 5. Testes e Qualidade

- **Frontend**: recomenda-se usar `expo start --web` (hot reload) e incluir testes com Jest/React Testing Library para componentes criticos (nao implementados ainda).
- **Backend**: acrescente testes `pytest` para `crud` e `schemas` ao evoluir o backend. O `requirements.txt` já é compatível com `pytest`.
- **Workflow sugerido**: configurar CI no GitHub Actions para rodar `npm test` e `pytest` quando disponiveis.

---

## 6. Roadmap sugerido

1. **Sincronizacao real**: integrar o frontend à API FastAPI, substituindo registros locais por chamadas HTTP com fallback offline.
2. **Autenticacao segura**: migrar para JWT + refresh tokens no backend e remover credenciais default em producao.
3. **Observabilidade**: adicionar logs centralizados e monitoramento (Prometheus ou serviços gerenciados).
4. **Entrega em producao**: containerizar backend (Dockerfile) e usar Expo EAS para builds mobile.
5. **Testes automatizados**: adicionar suites UI e API, além de lint (ESLint, mypy) no pipeline.

---

## 7. Plano de Recursos de Entrega Inteligente

### 7.1 Objetivo

Transformar o App-Gas em um software completo de logistica, cobrindo rastreio em tempo real, emissao fiscal e operacao com perfis distintos (cliente, entregador, administrador) sem depender apenas de estado local.

### 7.2 Recursos Prioritarios

| Recurso                      | Descricao resumida                                                                 | Dependencias principais                                          |
| ---------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Rastreamento GPS ativo       | Registrar coordenadas periodicamente, permitir acompanhar entregas no dashboard.   | Expo Location, tarefas em background (`expo-background-fetch`).  |
| Painel do entregador         | Exibir rotas otimizadas, aceite/recusa de pedidos, status (em rota, entregue).     | Backend com estados `ASSIGNED`, `IN_ROUTE`, `DELIVERED`.         |
| Dashboard administrativo     | Visao macro com mapa, fila de pedidos, SLA, performance de entregadores.          | Endpoints agregados, WebSocket ou polling progressivo.          |
| Emissao NF-e / recibos       | Integracao com provedor fiscal (ex.: SEFAZ/FocusNFe) para gerar DANFE/QR Code.     | Webhooks/REST externos, armazenamento seguro de chaves.         |
| Prova de entrega (POD)       | Captura de assinatura ou foto apos entrega confirmada.                             | Permissoes de camera/galeria, upload seguro para backend.       |

### 7.3 Evolucao de Modelo de Dados

```text
Deliverers (id, name, email*, phone, document, status)
Orders.status -> Enum estendido: PENDING, ASSIGNED, IN_ROUTE, DELIVERED, CANCELLED
Orders.geodata -> json (waypoints, timestamps, accuracy)
Orders.invoice -> (nf_number, nf_url, xml_path)
ProofsOfDelivery (id, order_id -> Orders.id, type, payload_url, signed_at)
```

- Introduzir relacionamentos `Deliverers` ⇄ `Orders` (`assigned_to`).
- Guardar eventos de rastreio em uma tabela ou coluna JSON para reconstruir trajetorias.
- Registrar metadados fiscais (numero NF, chave de acesso) para envio de comprovantes ao cliente.

### 7.4 Fluxos Backend

1. **Criacao / Alocacao**: Admin aprova pedido e atribui a um entregador (`PATCH /orders/{id}/assign`).
2. **Tracking**: App do entregador publica `POST /orders/{id}/track` com coordenadas; backend valida velocidade/precisao.
3. **NF-e**: Ao mudar para `ASSIGNED`, backend chama provedor NF-e; armazena XML/PDF e disponibiliza link seguro.
4. **Entrega**: Entregador envia `POST /orders/{id}/proof` com foto/assinatura, backend altera status para `DELIVERED`.
5. **Dashboards**: Endpoints (`GET /orders/dashboard`) agregam KPIs (tempo medio, % entregas em SLA, fila ativa).

### 7.5 Ajustes Mobile

- **Cliente**: exibicao do status em tempo real, timeline da entrega e acesso ao PDF/QR da NF-e.
- **Entregador**: app separado ou modo dedicado com login seguro (JWT), checklists, registros de tentativa.
- **Admin**: telas para monitorar mapa (MapView), pausar entregadores, reenfileirar pedidos.

### 7.6 Roadmap Sugerido

1. **Fundacao tecnica**: autenticao JWT completa, sincronizacao com backend, filas de pedidos reais.
2. **Tracking & dashboards**: implementar endpoints de rastreio e telas de mapa/admin.
3. **NF-e e POD**: integrar provedor fiscal, armazenar comprovantes e disponibilizar para clientes.
4. **Otimizaçao**: rotas inteligentes (ex.: GraphHopper), alertas SLA e integraçao com gateways de pagamento.

## 8. Referencias Cruzadas

- `README.md` — Guia operacional resumido.
- `App.js` — Fluxo principal do cliente com comentarios linha a linha.
- `src/constants/` — Fontes de dados estaticos (produtos, usuarios, chaves).
- `backend/app/` — API FastAPI modularizada (models, schemas, crud, security).

> Este documento deve ser revisado sempre que houver mudancas de arquitetura, endpoints ou fluxo de negocio.
