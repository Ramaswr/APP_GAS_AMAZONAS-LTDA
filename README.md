# App-Gas Amazonas LTDA

Aplicativo mobile de venda e entrega de gás para a região do Amazonas.

## 🚀 Instalação

\`\`\`bash
cd "App-Gas Amazonas LTDA"
npm install
\`\`\`

## ▶️ Executar

**Web (Chrome):**
\`\`\`bash
npm run web
\`\`\`

**Android:**
\`\`\`bash
npm run android
\`\`\`

**iOS:**
\`\`\`bash
npm run ios
\`\`\`

## 📁 Estrutura

- **App.js** — Aplicação principal
- **app.json** — Configurações do Expo
- **package.json** — Dependências

## 🔐 Credenciais Padrão

- **Email:** cliente@gasonline.com
- **Senha:** 123456

## 📝 Funcionalidades

✅ Login e Cadastro de Clientes
✅ Carrinho de Compras
✅ Histórico de Pedidos (AsyncStorage)
✅ 3 Perfis: Cliente, Entregador, Admin
✅ Design Responsivo

## 💾 Armazenamento

Todos os dados são salvos localmente em AsyncStorage (navegador/dispositivo).

## 🖥️ Backend (FastAPI + SQLite)

Para persistir usuários e pedidos em um serviço dedicado foi adicionado um backend em Python:

1. Instale as dependências:
	```bash
	cd "App-Gas Amazonas LTDA/backend"
	python -m venv .venv
	.venv\\Scripts\\activate
	pip install -r requirements.txt
	```
2. Inicie o servidor:
	```bash
	uvicorn app.main:app --reload
	```
3. A API ficará disponível em `http://localhost:8000` e a documentação automática em `http://localhost:8000/docs`.

### Endpoints principais
- `GET /health` – Verifica se o serviço está online.
- `POST /users` – Registra um novo usuário (nome, email, senha ≥ 6 chars).
- `GET /users` – Lista usuários cadastrados.
- `POST /orders` – Recebe o disparo de compra com e-mail do cliente e itens do carrinho; grava itens individualmente e calcula o total.
- `GET /orders` – Lista pedidos com itens e status.

---

**Desenvolvido com Expo + React Native**