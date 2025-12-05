# Guia Operacional de Segurança e Upgrades

Este guia sintetiza as ações práticas para manter o App-Gas Amazonas LTDA em conformidade com os requisitos de segurança e governança definidos. Cada subseção aponta comandos, responsáveis e critérios de aceitação para auditorias futuras.

---

## 1. Plano de Upgrade Expo / Webpack

**Contexto atual**: após `npm audit fix --force`, ainda restam alertas em `semver` e `xml2js` trazidos por `@expo/webpack-config@18.0.0`. Zerá-los requer avançar para `@expo/webpack-config@19.x`, que acompanha o ciclo do Expo SDK 55.

| Etapa | Ação | Comando / Referência | Critério de aceitação |
| ----- | ---- | -------------------- | ---------------------- |
| 1 | Criar branch dedicada | `git checkout -b upgrade/expo-55` | Branch isolada sem outros trabalhos. |
| 2 | Atualizar Node | Node 20.11+ (LTS) | `node -v` retorna versão compatível. |
| 3 | Atualizar Expo e RN | `npx expo install expo@55 react-native@0.74 react@18.2 react-dom@18.2 react-native-web@~0.19.12` | `package.json` alinhado ao SDK 55. |
| 4 | Atualizar toolchain | `npm install -D @expo/webpack-config@19 babel-preset-expo@~11 jest-expo@~55` | Tooling pareado com o SDK. |
| 5 | Revisar breaking changes | [Notas Expo 55](https://blog.expo.dev/) e changelog do RN 0.74 | Lista de impactos anotada em `docs/CHANGELOG.md`. |
| 6 | Limpar caches | `rm -rf node_modules package-lock.json && npm install` | Build reproduzível. |
| 7 | Diagnóstico | `npx expo-doctor --fix` e `npx expo-env-info` | Sem erros críticos. |
| 8 | Testes manuais + Jest | `npm test`, `npm run web`, `npm run android` | Fluxos principais (login, carrinho, pagamento) validados. |
| 9 | Auditoria final | `npm audit`, `npx expo security:check` (quando disponível) | Zero vulnerabilidades altas.
| 10 | PR + revisão | Abrir PR com checklist de regressão e resultado de testes | Aprovado por outro mantenedor antes de merge. |

> **Rollback**: manter tag `pre-expo55` apontando para o último commit estável. Em caso de falha, `git tag pre-expo55 && git push origin pre-expo55` antes do merge permite rollback simples via `git revert` ou `git reset --hard` em ambiente controlado.

---

## 2. Procedimento de Antivírus (ClamAV)

1. **Instalação** (Ubuntu/Debian):
   ```bash
   sudo apt update && sudo apt install -y clamav clamav-daemon
   sudo systemctl stop clamav-freshclam
   sudo freshclam   # Atualiza assinaturas
   sudo systemctl start clamav-freshclam
   ```
2. **Varredura manual do workspace**:
   ```bash
   clamscan -r --bell -i "/home/jerr/Downloads/App-Gas Amazonas LTDA/App-Gas Amazonas LTDA"
   ```
   - `-i`: reporta apenas arquivos infectados.
   - `--bell`: alerta sonoro opcional.
3. **Logs e relatórios**: redirecione a saída para `reports/clamav-<data>.log` e armazene evidências por 90 dias.
4. **Agendamento**: adicionar cron semanal (`crontab -e`):
   ```cron
   0 2 * * 1 clamscan -r -i /home/jerr/Downloads/App-Gas\ Amazonas\ LTDA/App-Gas\ Amazonas\ LTDA > /home/jerr/Downloads/App-Gas\ Amazonas\ LTDA/reports/clamav-$(date +\%Y\%m\%d).log
   ```
5. **Integração CI**: em runners Linux, instale ClamAV durante o job e bloqueie o deploy se houver detecção.

---

## 3. Governança e Segurança no GitHub

1. **Visibilidade e acesso**
   - Transformar o repositório em privado: *Settings → General → Danger Zone → Change visibility*.
   - Habilitar `Require contributors to sign in with 2FA` na organização.
   - Criar equipes específicas (dev, ops) com permissões mínimas (principle of least privilege).

2. **Proteção de branches** (`main` e release branches)
   - Habilitar branch protection com: merges via PR, 1+ review obrigatório, status checks `npm test`/`pytest`/`clamscan` verdes, commits assinados (`require signed commits`).
   - Ativar `Require linear history` para evitar merges complexos.

3. **Secret Management e distribuição**
   - Manter segredos em GitHub Secrets/Environments, nunca em plain text.
   - Habilitar *Secret Scanning* e *Push Protection* (alertas bloqueiam commits com segredos conhecidos).
   - Configurar Dependabot para npm + pip (`.github/dependabot.yml`) e aplicar atualizações dentro de 7 dias.

4. **Auditoria e monitoramento**
   - Ativar logs de auditoria (GitHub Enterprise ou via webhook) e enviar para SIEM.
   - Revisar permissões trimestralmente; remover usuários inativos imediatamente.
   - Planejar tabletop exercise semestral simulando vazamento de token.

5. **Distribuição controlada**
   - Utilizar *Releases* com changelog e hash do build.
   - Assinar APK/IPA final e publicar checksums no release.
   - Caso distribua via Expo Go, usar *EAS Update* com grupos privados e autenticação MFA.

---

## 4. Checklist Rápido

- [ ] `npm audit` limpo após migração para Expo 55.
- [ ] ClamAV instalado, atualizado e com cron semanal ativo.
- [ ] Branch protection e 2FA obrigatória na organização GitHub.
- [ ] Secrets fora do repositório, com Push Protection ligado.
- [ ] Documentação atualizada (`README.md` + este guia) e compartilhada com a equipe.
