import React, { useState, useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';
import AppButton from '../common/AppButton';
import { CLIENT_CREDENTIALS } from '../../constants/users';
import ThemeToggle from '../common/ThemeToggle';

const LoginScreen = ({ onLogin, onBackToSelection, onNavigateToRegister }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const { styles, themeColors } = useTheme();

  const handleLoginAttempt = useCallback(() => {
    onLogin(user, password);
  }, [user, password, onLogin]);

  return (
    <View style={[styles.container, styles.loginContainer]}>
      <ThemeToggle showHint={false} />
      <Text style={styles.header}>🔐 Login</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Credenciais Padrão:</Text>
        <Text style={{ fontSize: 13, color: themeColors.mutedText, marginTop: 8 }}>
          📧 {CLIENT_CREDENTIALS.user}
        </Text>
        <Text style={{ fontSize: 13, color: themeColors.mutedText }}>
          🔑 {CLIENT_CREDENTIALS.pass}
        </Text>
      </View>
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        value={user}
        onChangeText={setUser}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* Valida as credenciais informadas e tenta autenticar */}
      <AppButton label="Entrar" onPress={handleLoginAttempt} />
      {/* Redireciona para o fluxo de cadastro */}
      <AppButton
        label="Novo cliente? Cadastre-se"
        variant="outline"
        onPress={onNavigateToRegister}
      />
      {/* Sai da tela de login voltando para a seleção de perfis */}
      <AppButton
        label="Voltar"
        variant="secondary"
        onPress={onBackToSelection}
        style={{ marginTop: 10 }}
      />
    </View>
  );
};

export default LoginScreen;
