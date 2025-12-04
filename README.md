# App-Gas Amazonas LTDA

> Plataforma cientificamente planejada para venda, entrega e gestão de pedidos de gás/água no Amazonas, composta por cliente Expo (mobile/web) e backend FastAPI + SQLite.

[Visão Geral](#visão-geral) • [Arquitetura](#arquitetura-do-sistema) • [Execução](#guia-de-execução-rápida) • [Fluxos](#fluxos-operacionais) • [Persistência](#persistência-e-segurança) • [Backend](#backend-fastapi--sqlite) • [Testes](#qualidade-e-testes) • [Roadmap](#roadmap)

Documentação expandida: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Visão Geral

- **Objetivo**: digitalizar o ciclo de compra e entrega de gás domiciliar, com suporte a estoque básico, carrinho, pagamentos e acompanhamento de pedidos.
- **Perfis**: Cliente (compra), Entregador (monitoramento e execução) e Administrador (visão consolidada).
- **Plataformas**: Expo (web/mobile) para experimentação rápida, FastAPI para persistência e integração futura.

### Stack Técnica

| Camada    | Tecnologia                                        | Justificativa                                                             |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| App       | Expo + React Native + React Native Web            | Código único para mobile e navegador, hot reload e builds EAS.            |
| Estado    | Hooks (useState/useEffect/useMemo) + AsyncStorage | Controle transparente do fluxo e re-hidratação offline.                   |
| Backend   | FastAPI + SQLAlchemy + SQLite                     | API tipada com validação Pydantic, ORM declarativo e banco leve portátil. |
| Segurança | Hash SHA-256, CORS, Alertas client-side           | Baseline de proteção imediata para prototipagem.                          |

---

## Arquitetura do Sistema

```text
[Expo Client] --HTTP/JSON--> [FastAPI] --ORM--> [SQLite]
     |                            ^
     +---- AsyncStorage ----------+
```

1. `App.js` lê e persiste dados usando `readJson`/`writeJson`, garantindo continuidade offline.
2. Fluxos locais estão comentados linha a linha (ver arquivo). A integração com a API pode ser ligada gradualmente trocando as chamadas internas por requisições HTTP.
3. `docs/ARCHITECTURE.md` detalha as responsabilidades de cada componente, contratos AsyncStorage e sequências operacionais.

### Estrutura de Pastas

```text
App-Gas Amazonas LTDA/
├── App.js                 # Orquestrador e roteador de telas
├── src/
│   ├── components/        # Screens e componentes compartilhados
│   ├── constants/         # Catálogo de produtos, usuários e chaves
│   ├── styles/            # Estilos globais
│   └── utils/storage.js   # Abstrações AsyncStorage
├── backend/
│   └── app/               # FastAPI (models, schemas, crud, main)
└── docs/ARCHITECTURE.md   # Documento técnico aprofundado
```

---

## Guia de Execução Rápida

### 1. Requisitos

- Node.js >= 18 + npm
- Expo CLI (opcional para dispositivos nativos)
- Python 3.11 para o backend

### 2. Frontend (Expo)

```bash
cd "App-Gas Amazonas LTDA"
npm install
# Web
npm run web
# Android (via Expo Go / emulador)
npm run android
# iOS (Expo Go / simulador)
npm run ios
```

### 3. Backend FastAPI

```bash
cd "App-Gas Amazonas LTDA/backend"
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### 4. Variáveis e Configurações

- O app utiliza `AsyncStorage` para estados locais (`src/constants/users.js`).
- Credenciais default: `cliente@gasonline.com` / `123456` (apenas desenvolvimento).
- Para produção, defina variáveis de ambiente para URLs da API e remova credenciais default.

---

## Fluxos Operacionais

### Cliente

1. **Seleção de Perfil** (`UserSelectionScreen`)
2. **Login/Cadastro** (`LoginScreen` / `RegisterScreen`)
3. **Seleção de Produtos** (`SelectProductScreen` com dados de `PRODUCTS`)
4. **Carrinho** (`CartScreen` com incrementos/decrementos consistentes)
5. **Pagamento** (`PaymentScreen` com `PAYMENT_OPTIONS`)
6. **Resumo Final** (`ThankYouScreen` exibindo `lastOrderInfo`)

### Preferências de Tema (Clara/Escura)

- `ThemeProvider` centraliza o modo claro/escuro e recalcula estilos via `createStyles`.
- Usuários leigos trocam o tema com o seletor visível em todas as telas principais (ex.: seleção de perfil, catálogo, carrinho e dashboards).
- A escolha é persistida em `AsyncStorage` (`@ThemeMode`), garantindo retomada científica do conforto visual em qualquer dispositivo.
- A paleta escura mantém contraste AA (texto claro sobre fundo #05080F) e replica feedbacks (badges, avisos) usando equivalentes energéticos.

### Entregador / Admin

- **RoleDashboardScreen**: resumo rápido, lista de clientes e filtros de pedidos.
- **OrderManagementScreen**: atualiza itens, remove pedidos vazios e aplica filtros por e-mail (`focusedClientEmail`).

### Persistência Local

- Cada mudança relevante dispara `useEffect` que grava os dados em AsyncStorage, garantindo retomada do fluxo mesmo offline.

---

## Persistência e Segurança

| Contexto             | Implementação atual         | Recomendações                                                    |
| -------------------- | --------------------------- | ---------------------------------------------------------------- |
| Autenticação cliente | Credenciais locais + padrão | Migrar para backend com JWT e remover credenciais fixas.         |
| Senhas backend       | SHA-256 (sem salt)          | Adotar `bcrypt`/`argon2` com salt e rounds configurados.         |
| Transporte           | HTTP local                  | Habilitar HTTPS e restringir CORS por domínio.                   |
| Armazenamento local  | AsyncStorage em texto claro | Criptografar campos sensíveis (expo-secure-store) para produção. |

---

## Backend (FastAPI + SQLite)

| Método | Rota      | Resumo                                     |
| ------ | --------- | ------------------------------------------ |
| GET    | `/health` | Status do serviço                          |
| POST   | `/users`  | Cria usuário com validações Pydantic       |
| GET    | `/users`  | Lista usuários (últimos primeiro)          |
| POST   | `/orders` | Cria pedido, valida itens e totaliza valor |
| GET    | `/orders` | Lista pedidos com usuário e itens ligados  |

- Modelos: `User`, `Order`, `OrderItem` (ver `backend/app/models.py`).
- `crud.py` utiliza `selectinload` para evitar N+1 ao carregar pedidos com itens.
- `security.py` concentra hash/verify.

---

## Qualidade e Testes

- **Frontend**: configurar Jest + React Testing Library para componentes de login, carrinho e pagamento. Scripts podem ser adicionados ao `package.json` (`npm test`).
- **Backend**: adicionar `pytest` com fixtures para `SessionLocal`. Valide `crud` e endpoints com `TestClient`.
- **Lint**: sugerido usar ESLint + Prettier (frontend) e Ruff + mypy (backend).
- **CI/CD**: GitHub Actions rodando `npm run web -- --non-interactive`, `npm test` e `pytest`. A pipeline também pode construir imagens Docker do backend.

---

## Roadmap

1. **Sincronização API ⇄ App**: substituir armazenamento local por chamadas REST, mantendo fallback offline.
2. **Autenticação completa**: cadastro/logon centralizado no FastAPI com tokens e refresh.
3. **Gestão de pedidos em tempo real**: websockets ou polling para operadores acompanharem atualizações.
4. **Monitoramento e Alertas**: logs estruturados e dashboards (Grafana/CloudWatch).
5. **Publicação**: backend em container + banco gerenciado; app distribuído via EAS Build / Google Play / App Store.

---

## Contribuição

1. Faça um fork e crie um branch (`feat/nome`).
2. Registre alterações com mensagens claras de commit.
3. Abra um Pull Request descrevendo contexto, testes e riscos.
4. Atualize `docs/ARCHITECTURE.md` quando houver mudanças estruturais.

---

Desenvolvido com Expo + React Native + FastAPI
