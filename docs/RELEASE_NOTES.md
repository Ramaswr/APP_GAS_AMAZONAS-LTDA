# Release Notes v1.1.0

Data: 6 de dezembro de 2025

## Resumo Executivo

Esta versão consolida o App-Gas Amazonas como plataforma pronta para operação piloto. Os principais pilares são: experiência multitema para clientes e operadores, novo módulo de entregadores com rastreamento em tempo real, reforço de segurança operacional e atualização da base Expo para o SDK 54. Todos os ativos foram regenerados para garantir builds web consistentes.

## Destaques

### UX e Temas
- `ThemeProvider` e `ThemeToggle` foram propagados para telas centrais (seleção de usuário, login, catálogo, carrinho, dashboards e novos fluxos de entregadores).
- Preferência de tema persiste em AsyncStorage garantindo retomada entre dispositivos.

### Operações do Entregador
- Nova `CourierRegisterScreen` com validação de CPF/CEP e dados de veículo, incluindo alerta de descarte quando há formulário preenchido.
- Nova `CourierOrdersScreen` com:
  - Rastreamento GPS usando `expo-location` (`watchPositionAsync`) e status visual do entregador.
  - Integração com Google Maps abrindo rotas por coordenadas ou endereço textual.
  - Modal seguro para cadastrar latitude/longitude e endereço completo do cliente.
  - Botões rápidos para atualizar pedidos e voltar ao dashboard.

### Segurança e Governança
- Criação do guia [`docs/SECURITY_OPERATIONS.md`](./SECURITY_OPERATIONS.md) descrevendo upgrade controlado do Expo, rotina ClamAV e práticas de governança GitHub.
- README recebeu política de senhas abrangendo `.env`, bcrypt/argon2, SecureStore, MFA/TOTP e auditoria periódica.
- Dependências atualizadas para `expo@54.0.26` com reinstalação limpa e `npm audit` sem vulnerabilidades abertas (exceto avisos dependentes do SDK 55).
- Regeneração dos ativos PNG (`icon`, `adaptive-icon`, `splash`, `favicon`) eliminando o erro "Crc error" durante `npm run web`.

## Dependências Principais
- `expo` → 54.0.26 (SDK atual) + inclusão do `expo-location`.
- `react-native` 0.73.6, `react`/`react-dom` 18.2 permanecem compatíveis.
- Versão do app atualizada para `1.1.0` em `package.json` e `app.json`.

## Testes e Validação
1. `npm install` em instalação limpa (remoção de `node_modules` e `package-lock.json`).
2. `npm run lint` para checar estilo e regras do ESLint.
3. `npm run web -- --clear` para confirmar build Expo Web e abertura em `http://localhost:19006`.
4. `npm audit` garantindo zero vulnerabilidades após reinstalação (restam apenas avisos ligados ao futuro Expo 55).

## Passo a Passo de Upgrade
1. Atualize sua branch local: `git checkout feature/theme-mode && git pull`.
2. Instale dependências: `npm install`.
3. Limpe cache do Expo antes do primeiro boot: `npm run web -- --clear` (ou `expo start -c`).
4. Garanta permissões de localização no dispositivo/emulador ao testar `CourierOrdersScreen`.
5. Para Android/iOS, utilize `npm run android` / `npm run ios` via Expo Go.

## Problemas Conhecidos
- O Expo 54 exibe avisos sugerindo React 19/RN 0.81; são recomendações antecipadas para o SDK 55 e não impactam a execução atual.
- Dependências `semver/xml2js` só serão atualizadas quando o Expo 55 estiver disponível publicamente.
- O módulo de localização depende de permissões concedidas; negá-las impede rastreamento até o usuário reautorizar nas configurações do OS.

## Próximos Passos
- Monitorar o lançamento do Expo 55 para eliminar os avisos remanescentes e adotar Webpack 5 com suporte oficial.
- Conectar o módulo do entregador ao backend FastAPI, persistindo cadastros e rastros de GPS.
- Automatizar ClamAV e lint/testes via GitHub Actions antes do próximo release.
